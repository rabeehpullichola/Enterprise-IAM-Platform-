import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Custom logic if needed, but authorized callback handles the main checks
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        const role = token?.role as string | undefined

        // If not logged in, reject
        if (!token) return false

        // Admin routes
        if (path.startsWith("/users") || path.startsWith("/roles")) {
          return role === "Admin"
        }

        // Audit routes (Admin or Auditor)
        if (path.startsWith("/audit")) {
          return role === "Admin" || role === "Auditor"
        }

        // Default: allow if authenticated
        return true
      },
    },
  }
)

export const config = {
  matcher: ["/users/:path*", "/roles/:path*", "/audit/:path*"],
}
