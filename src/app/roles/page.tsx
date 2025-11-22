import { prisma } from "@/lib/prisma"
import { createRole, deleteRole } from "@/lib/actions"
import styles from "./roles.module.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function RolesPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/auth/signin")

    const roles = await prisma.role.findMany({
        include: {
            _count: {
                select: { users: true }
            }
        },
        orderBy: { name: 'asc' }
    })

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Role Management</h1>
                <a href="/" className={styles.backLink}>&larr; Back to Dashboard</a>
            </header>

            <div className={styles.content}>
                <section className={styles.createSection}>
                    <h2>Create New Role</h2>
                    <form action={createRole} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Role Name</label>
                            <input type="text" name="name" id="name" required placeholder="e.g. Manager" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="description">Description</label>
                            <textarea name="description" id="description" rows={3} placeholder="Optional description"></textarea>
                        </div>
                        <button type="submit" className={styles.createButton}>Create Role</button>
                    </form>
                </section>

                <section className={styles.listSection}>
                    <h2>Existing Roles</h2>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Users</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role) => (
                                <tr key={role.id}>
                                    <td><span className={styles.roleBadge}>{role.name}</span></td>
                                    <td>{role.description || '-'}</td>
                                    <td>{role._count.users} users</td>
                                    <td>
                                        <form action={deleteRole}>
                                            <input type="hidden" name="id" value={role.id} />
                                            <button type="submit" className={styles.deleteButton}>Delete</button>
                                        </form>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    )
}
