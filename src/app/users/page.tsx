import { prisma } from "@/lib/prisma"
import { createUser, deleteUser } from "@/lib/actions"
import styles from "./users.module.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/auth/signin")

    const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' }
    })

    const roles = await prisma.role.findMany()

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>User Management</h1>
                <a href="/" className={styles.backLink}>&larr; Back to Dashboard</a>
            </header>

            <div className={styles.content}>
                <section className={styles.createSection}>
                    <h2>Create New User</h2>
                    <form action={createUser} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input type="text" name="name" id="name" required placeholder="John Doe" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" required placeholder="john@example.com" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password</label>
                            <input type="password" name="password" id="password" required placeholder="******" />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="roleId">Role</label>
                            <select name="roleId" id="roleId" required>
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className={styles.createButton}>Create User</button>
                    </form>
                </section>

                <section className={styles.listSection}>
                    <h2>Existing Users</h2>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span className={styles.roleBadge}>{user.role?.name || 'No Role'}</span>
                                    </td>
                                    <td>
                                        <form action={deleteUser}>
                                            <input type="hidden" name="id" value={user.id} />
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
