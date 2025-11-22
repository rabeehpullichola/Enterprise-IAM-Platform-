import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called with:", credentials?.email);
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.log("Missing credentials");
                        return null
                    }

                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email },
                        include: { role: true },
                    })

                    if (!user) {
                        console.log("User not found");
                        return null
                    }

                    console.log("User found:", user.email);
                    console.log("Stored hash:", user.password);

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    )

                    console.log("Password valid:", isPasswordValid);

                    if (!isPasswordValid) {
                        return null
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role?.name,
                    }
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
    secret: "supersecretkey123",
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).id = token.id;
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
