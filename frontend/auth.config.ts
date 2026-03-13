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
            const rolesMap: Record<string, string> = {};
            if (env.DIRECTUS_ADMIN_ROLE_ID) rolesMap[env.DIRECTUS_ADMIN_ROLE_ID] = "ADMIN";
            if (env.DIRECTUS_SECRETARIAT_ROLE_ID) rolesMap[env.DIRECTUS_SECRETARIAT_ROLE_ID] = "ADMIN";
            if (env.DIRECTUS_MEMBER_ROLE_ID) rolesMap[env.DIRECTUS_MEMBER_ROLE_ID] = "MEMBER";
            if (env.DIRECTUS_USER_ROLE_ID) rolesMap[env.DIRECTUS_USER_ROLE_ID] = "USER";

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
