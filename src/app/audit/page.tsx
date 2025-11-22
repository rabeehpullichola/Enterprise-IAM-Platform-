import { prisma } from "@/lib/prisma"
import styles from "./audit.module.css"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function AuditPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect("/auth/signin")

    const logs = await prisma.auditLog.findMany({
        include: {
            user: {
                select: { name: true, email: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Audit Logs</h1>
                <a href="/" className={styles.backLink}>&larr; Back to Dashboard</a>
            </header>

            <div className={styles.content}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Details</th>
                            <th>Performed By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log) => (
                            <tr key={log.id}>
                                <td className={styles.timestamp}>{new Date(log.createdAt).toLocaleString()}</td>
                                <td><span className={`${styles.badge} ${styles[log.action.toLowerCase()]}`}>{log.action}</span></td>
                                <td>{log.resource}</td>
                                <td className={styles.details}>{log.details}</td>
                                <td>
                                    <div className={styles.user}>
                                        <span className={styles.userName}>{log.user?.name || 'Unknown'}</span>
                                        <span className={styles.userEmail}>{log.user?.email}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
