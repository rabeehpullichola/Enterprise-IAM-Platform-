import { prisma } from "@/lib/prisma"
import { createUser, deleteUser, updateUser } from "@/lib/actions"
import styles from "./users.module.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function UsersPage({ searchParams }: { searchParams: { edit?: string } }) {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/auth/signin")

    const users = await prisma.user.findMany({
        include: { role: true },
        orderBy: { createdAt: 'desc' }
    })

    const roles = await prisma.role.findMany()

    const editUserId = searchParams.edit
    const userToEdit = editUserId ? await prisma.user.findUnique({ where: { id: editUserId } }) : null

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>User Management</h1>
                <a href="/" className={styles.backLink}>&larr; Back to Dashboard</a>
            </header>

            <div className={styles.content}>
                <section className={styles.createSection}>
                    <h2>{userToEdit ? 'Edit User' : 'Create New User'}</h2>
                    <form action={userToEdit ? updateUser : createUser} className={styles.form}>
                        {userToEdit && <input type="hidden" name="id" value={userToEdit.id} />}

                        <div className={styles.formGroup}>
                            <label htmlFor="name">Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                required
                                placeholder="John Doe"
                                defaultValue={userToEdit?.name || ''}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                required
                                placeholder="john@example.com"
                                defaultValue={userToEdit?.email || ''}
                            />
                        </div>
                        {!userToEdit && (
                            <div className={styles.formGroup}>
                                <label htmlFor="password">Password</label>
                                <input type="password" name="password" id="password" required placeholder="******" />
                            </div>
                        )}
                        <div className={styles.formGroup}>
                            <label htmlFor="roleId">Role</label>
                            <select
                                name="roleId"
                                id="roleId"
                                required
                                defaultValue={userToEdit?.roleId || ''}
                            >
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>{role.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.buttonGroup}>
                            <button type="submit" className={styles.createButton}>
                                {userToEdit ? 'Update User' : 'Create User'}
                            </button>
                            {userToEdit && (
                                <a href="/users" className={styles.cancelButton}>Cancel</a>
                            )}
                        </div>
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
                                        <div className={styles.actions}>
                                            <a href={`/users?edit=${user.id}`} className={styles.editButton}>Edit</a>
                                            <form action={deleteUser}>
                                                <input type="hidden" name="id" value={user.id} />
                                                <button type="submit" className={styles.deleteButton}>Delete</button>
                                            </form>
                                        </div>
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
