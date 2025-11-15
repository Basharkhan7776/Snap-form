import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@/lib/prisma"
import { isSuperAdmin } from "@/lib/admin"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: false, // Google OAuth only
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/callback/google`,
    },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "USER",
      },
      plan: {
        type: "string",
        required: false,
        defaultValue: "FREE",
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Update session every day
  },

  advanced: {
    generateId: () => {
      // Use default ID generation (cuid)
      return crypto.randomUUID()
    },
  },

  callbacks: {
    async after(ctx) {
      // After sign-in, check if user should be super admin
      if (ctx.type === "signIn" && ctx.user) {
        const user = await prisma.user.findUnique({
          where: { id: ctx.user.id },
        })

        if (user && isSuperAdmin(user.email)) {
          // Promote to super admin if email is in the list
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "SUPER_ADMIN" },
          })
        }
      }
    },
  },
})

export type Session = typeof auth.$Infer.Session.session
export type User = typeof auth.$Infer.Session.user
