import { createDirectus, rest, readItems } from "@directus/sdk";

export async function getRoleByName(roleName: string): Promise<string | null> {
  try {
    const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055").with(rest());
    
    const roles = await client.request(readItems('roles', {
      filter: { name: { _eq: roleName } },
      fields: ['id']
    }));
    
    if (Array.isArray(roles) && roles.length > 0) {
      return roles[0].id;
    }
    return null;
  } catch (error) {
    console.error("Failed to get role by name:", error);
    return null;
  }
}

export async function verifyRoleConfiguration(): Promise<{
  valid: boolean;
  roles: Record<string, string | null>;
  warnings: string[];
}> {
  const warnings: string[] = [];
  const roleIds: Record<string, string | null> = {};
  
  const adminRoleId = await getRoleByName('Administrator');
  const secretaryRoleId = await getRoleByName('Secretary');
  const memberRoleId = await getRoleByName('Member');
  const userRoleId = await getRoleByName('User');
  
  roleIds['ADMIN'] = adminRoleId || secretaryRoleId;
  roleIds['MEMBER'] = memberRoleId;
  roleIds['USER'] = userRoleId;
  
  if (!roleIds['ADMIN']) {
    warnings.push("No ADMIN role found (Administrator or Secretary)");
  }
  if (!roleIds['MEMBER']) {
    warnings.push("No MEMBER role found");
  }
  if (!roleIds['USER']) {
    warnings.push("No USER role found");
  }
  
  return {
    valid: warnings.length === 0,
    roles: roleIds,
    warnings
  };
}

export function getRoleFromId(roleId: string, roleIds: Record<string, string | null>): string {
  if (roleIds['ADMIN'] && roleId === roleIds['ADMIN']) return 'ADMIN';
  if (roleIds['MEMBER'] && roleId === roleIds['MEMBER']) return 'MEMBER';
  if (roleIds['USER'] && roleId === roleIds['USER']) return 'USER';
  return 'USER';
}