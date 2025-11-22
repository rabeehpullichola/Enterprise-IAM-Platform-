import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create Permissions
    const permissions = [
        'user:read',
        'user:write',
        'user:delete',
        'role:read',
        'role:write',
        'audit:read',
    ]

    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: { name: perm },
            update: {},
            create: { name: perm },
        })
    }

    // Create Roles
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: {
            name: 'Admin',
            description: 'Administrator with full access',
            permissions: {
                connect: permissions.map((p) => ({ name: p })),
            },
        },
    })

    const userRole = await prisma.role.upsert({
        where: { name: 'User' },
        update: {},
        create: {
            name: 'User',
            description: 'Standard user',
        },
    })

    const auditorRole = await prisma.role.upsert({
        where: { name: 'Auditor' },
        update: {},
        create: {
            name: 'Auditor',
            description: 'Can view audit logs',
            permissions: {
                connect: [{ name: 'audit:read' }],
            },
        },
    })

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10)

    await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            roleId: adminRole.id,
        },
    })

    console.log('Database seeded!')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
