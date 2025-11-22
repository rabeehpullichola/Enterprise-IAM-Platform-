import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import styles from "./page.module.css"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <div className={styles.userProfile}>
          <span>{session.user?.name}</span>
          <span className={styles.roleBadge}>{(session.user as any).role}</span>
          <Link href="/api/auth/signout" className={styles.signOut}>
            Sign Out
          </Link>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3>Users</h3>
            <p>Manage system users</p>
            <Link href="/users" className={styles.link}>View Users &rarr;</Link>
          </div>
          <div className={styles.card}>
            <h3>Roles</h3>
            <p>Configure roles & permissions</p>
            <Link href="/roles" className={styles.link}>Manage Roles &rarr;</Link>
          </div>
          <div className={styles.card}>
            <h3>Audit Logs</h3>
            <p>View system activity</p>
            <Link href="/audit" className={styles.link}>View Logs &rarr;</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
