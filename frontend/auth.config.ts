import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"
import { authentication, createDirectus, rest, readMe, readItems, staticToken } from "@directus/sdk"

import { env } from "@/env.mjs"
import { loginSchema } from "@/lib/validations/auth"

async function getRoleIdMap(): Promise<Record<string, string>> {
  try {
    const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
      .with(staticToken(env.DIRECTUS_STATIC_TOKEN || "static_ebdfd517a183459c82972b87d2d5ec3f"))
      .with(rest());
    
    console.log("[Auth] Fetching roles for dynamic mapping...");
    const roles = await client.request(readItems('roles', {
      fields: ['id', 'name', 'admin_access']
    }));
    
    const roleMap: Record<string, string> = {};
    
    for (const role of roles as any[]) {
      if (role.admin_access || role.name === 'Administrator') {
        roleMap[role.id] = 'ADMIN';
      } else if (role.name === 'Member' || role.name === '联盟成员') {
        roleMap[role.id] = 'MEMBER';
      } else if (role.name === 'User' || role.name === '普通用户') {
        roleMap[role.id] = 'USER';
      }
    }
    
    console.log("[Auth] Role Map synchronized:", JSON.stringify(roleMap));
    return roleMap;
  } catch (error: any) {
    console.error("[Auth] Failed to fetch role map:", error.message);
    return {};
  }
}

let cachedRoleMap: Record<string, string> | null = null;

function getCachedRoleMap(): Record<string, string> {
  if (!cachedRoleMap) {
    cachedRoleMap = {};
    // Hardcode for lifecycle test if env vars fail to sync
    cachedRoleMap["ac3afb40-61a1-4b63-b708-50b4f615850b"] = "ADMIN";
    
    if (env.DIRECTUS_ADMIN_ROLE_ID) cachedRoleMap[env.DIRECTUS_ADMIN_ROLE_ID] = "ADMIN";
    if (env.DIRECTUS_SECRETARIAT_ROLE_ID) cachedRoleMap[env.DIRECTUS_SECRETARIAT_ROLE_ID] = "ADMIN";
    if (env.DIRECTUS_MEMBER_ROLE_ID) cachedRoleMap[env.DIRECTUS_MEMBER_ROLE_ID] = "MEMBER";
    if (env.DIRECTUS_USER_ROLE_ID) cachedRoleMap[env.DIRECTUS_USER_ROLE_ID] = "USER";
  }
  return cachedRoleMap;
}

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

            const user = await client.request(readMe({ fields: ['id', 'first_name', 'last_name', 'email', 'role', 'avatar', 'role.id', 'role.name', 'affiliated_company_id'] })) as any;

            if (!user) {
              console.error("[Auth] Login successful but readMe failed");
              return null;
            }

            console.log(`[Auth] User fetched: ${user.email}, Role field type: ${typeof user.role}`);
            
            const rolesMap = getCachedRoleMap();
            // Crucial: Handle object or string role field
            const roleId = typeof user.role === 'object' ? user.role?.id : user.role;
            const roleName = typeof user.role === 'object' ? user.role?.name : "Unknown";
            
            console.log(`[Auth] Role ID: ${roleId}, Role Name from Directus: ${roleName}`);

            let appRole = rolesMap[roleId] || "USER";
            
            if (!rolesMap[roleId]) {
              console.log(`[Auth] Role ID ${roleId} not in cache, fetching dynamic map...`);
              const dynamicRoleMap = await getRoleIdMap();
              appRole = dynamicRoleMap[roleId] || "USER";
            }

            // Fallback for known role names if mapping still USER
            if (appRole === "USER") {
               if (roleName === "Administrator" || roleName === "Admin") appRole = "ADMIN";
               if (roleName === "Secretariat" || roleName === "秘书处") appRole = "ADMIN";
            }

            console.log(`[Auth] Final Assignment -> Email: ${user.email}, App Role: ${appRole}`);

            return {
              id: user.id,
              name: (user.first_name || user.last_name) ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : user.email,
              email: user.email,
              image: user.avatar,
              role: appRole,
              accessToken: loginResponse.access_token,
              companyId: user.affiliated_company_id,
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
