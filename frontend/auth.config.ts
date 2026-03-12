import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { authentication, createDirectus, rest, readMe } from "@directus/sdk"

import { env } from "@/env.mjs"
import { loginSchema } from "@/lib/validations/auth"

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedCredentials = loginSchema.safeParse(credentials)

        if (validatedCredentials.success) {
          const { email, password } = validatedCredentials.data

          try {
            const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
              .with(authentication())
              .with(rest());

            const loginResponse = await client.login({ email, password });
            // directus.login returns { access_token, expires, ... }

            // Get user details
            const user = await client.request(readMe({ fields: ['id', 'first_name', 'last_name', 'email', 'role', 'avatar'] })) as any;

            if (!user) return null

            // Map Directus Role ID to App Roles
            const rolesMap: Record<string, string> = {
              "e2a58ff1-ded2-41db-9efe-025f604e533d": "ADMIN",
              "a1b2c3d4-e5f6-7890-abcd-ef1234567890": "ADMIN", // Secretariat is also ADMIN for now
              "e3e82743-f4f1-40ea-bf50-deb2048678b5": "MEMBER",
              "cbdd77bf-6089-4b67-9919-3eebfd39404c": "USER",
            };

            return {
              id: user.id,
              name: (user.first_name || user.last_name) ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : user.email,
              email: user.email,
              image: user.avatar,
              role: rolesMap[user.role] || "USER",
              accessToken: loginResponse.access_token,
            }
          } catch (error) {
            console.error("Directus Auth Error:", error)
            return null
          }
        }
        return null
      },
    }),
  ],
} satisfies NextAuthConfig
