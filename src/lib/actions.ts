'use server'

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function logAction(action: string, resource: string, entityId: string, details: string) {
    const session = await getServerSession(authOptions)
    const userEmail = session?.user?.email

    if (!userEmail) return // Should not happen if protected

    const user = await prisma.user.findUnique({ where: { email: userEmail } })
    if (!user) return

    await prisma.auditLog.create({
        data: {
            action,
            resource,
            details: `${details} (ID: ${entityId})`,
            userId: user.id,
        },
    })
}

export async function createUser(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const roleId = formData.get("roleId") as string

    if (!name || !email || !password || !roleId) {
        throw new Error("Missing required fields")
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            roleId,
        },
    })

    await logAction("CREATE", "User", user.id, `Created user ${email}`)

    revalidatePath("/users")
}

export async function deleteUser(formData: FormData) {
    const id = formData.get("id") as string

    if (!id) {
        throw new Error("Missing user ID")
    }

    await prisma.user.delete({
        where: { id },
    })

    await logAction("DELETE", "User", id, `Deleted user ID ${id}`)

    revalidatePath("/users")
}

export async function updateUser(formData: FormData) {
    const id = formData.get("id") as string
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const roleId = formData.get("roleId") as string

    if (!id || !name || !email || !roleId) {
        throw new Error("Missing required fields")
    }

    await prisma.user.update({
        where: { id },
        data: {
            name,
            email,
            roleId,
        },
    })

    await logAction("UPDATE", "User", id, `Updated user ${email}`)

    revalidatePath("/users")
}

export async function createRole(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
        throw new Error("Missing required fields")
    }

    const role = await prisma.role.create({
        data: {
            name,
            description,
        },
    })

    await logAction("CREATE", "Role", role.id, `Created role ${name}`)

    revalidatePath("/roles")
}

export async function deleteRole(formData: FormData) {
    const id = formData.get("id") as string

    if (!id) {
        throw new Error("Missing role ID")
    }

    await prisma.role.delete({
        where: { id },
    })

    await logAction("DELETE", "Role", id, `Deleted role ID ${id}`)

    revalidatePath("/roles")
}
