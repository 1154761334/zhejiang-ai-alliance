"use server";

import { auth } from "@/auth";
import { createDirectus, rest, staticToken, readUsers, updateUser, readRoles, readItems } from "@directus/sdk";
import { revalidatePath } from "next/cache";

/**
 * Creates a Directus client with admin privileges.
 * Using a function ensures environment variables are fresh for each request.
 */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055";
  const token = process.env.DIRECTUS_STATIC_TOKEN || "static_ebdfd517a183459c82972b87d2d5ec3f";
  return createDirectus<any>(url)
    .with(staticToken(token))
    .with(rest());
}

export async function getUsers() {
  try {
    const session = await auth();
    console.log(`[getUsers] Session user: ${session?.user?.email}, role: ${session?.user?.role}`);
    
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const client = getAdminClient();
    
    // Simple fetch all fields with star, cast to any for flexibility
    const users = await client.request(readUsers({
      fields: ["*", "role.id", "role.name"] as any,
      limit: -1
    }));

    console.log(`[getUsers] Success. Found ${users.length} users.`);
    
    return { status: "success", data: users };
  } catch (error: any) {
    console.error("[getUsers] Critical Error:", error.message);
    return { status: "error", message: error.message || "未知错误" };
  }
}

export async function updateUserAdmin(userId: string, data: any) {
  console.log(`[AdminAction] Invoking updateUserAdmin for ${userId}`);
  
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const client = getAdminClient();

    // Explicitly handle unbinding by ensuring null is passed if empty
    const updatePayload = {
      ...data,
      affiliated_company_id: data.affiliated_company_id || null
    };

    const result = await client.request(updateUser(userId, updatePayload));
    
    revalidatePath("/admin/users");
    return { status: "success" };
  } catch (error: any) {
    console.error("Directus Error detail:", error.errors || error);
    return { 
      status: "error", 
      message: error.message || "更新失败",
      details: error.errors
    };
  }
}

export async function updateUserAccount(userId: string, data: any) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const client = getAdminClient();
    await client.request(updateUser(userId, data));
    
    revalidatePath("/admin/users");
    return { status: "success" };
  } catch (error: any) {
    console.error("Failed to update user status:", error);
    return { status: "error", message: error.message };
  }
}

export async function getRoles() {
    try {
        const client = getAdminClient();
        const roles = await client.request(readRoles({
            fields: ["id", "name"]
        }));
        return { status: "success", data: roles };
    } catch (error: any) {
        return { status: "error", message: error.message };
    }
}

export async function getCompanyList() {
    try {
        const client = getAdminClient();
        const companies = await client.request(readItems("companies", {
            fields: ["id", "company_name"],
            limit: -1
        }));
        return { status: "success", data: companies };
    } catch (error: any) {
        return { status: "error", message: error.message };
    }
}
