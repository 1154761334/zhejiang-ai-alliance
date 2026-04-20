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
  const token = process.env.DIRECTUS_STATIC_TOKEN;
  if (!token) {
    throw new Error("DIRECTUS_STATIC_TOKEN is required for admin actions");
  }
  return createDirectus<any>(url)
    .with(staticToken(token))
    .with(rest());
}

export async function getUsers() {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const client = getAdminClient();

    // Simple fetch all fields with star, cast to any for flexibility
    const users = await client.request(readUsers({
      fields: ["*", "role.id", "role.name", "affiliated_company_id.id", "affiliated_company_id.company_name"] as any,
      limit: -1
    }));

    return { status: "success", data: users };
  } catch (error: any) {
    console.error("[getUsers] Critical Error:", error.message);
    return { status: "error", message: error.message || "未知错误" };
  }
}

/**
 * 批量更新用户角色
 */
export async function batchUpdateUserRole(userIds: string[], roleId: string | null) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const client = getAdminClient();

    // 并行更新所有用户
    const promises = userIds.map(id =>
      client.request(updateUser(id, { role: roleId }))
    );

    await Promise.all(promises);
    revalidatePath("/admin/users");

    return { status: "success", count: userIds.length };
  } catch (error: any) {
    console.error("批量更新角色失败:", error);
    return { status: "error", message: error.message || "批量更新失败" };
  }
}

/**
 * 批量更新用户状态
 */
export async function batchUpdateUserStatus(userIds: string[], status: string) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const client = getAdminClient();

    // 并行更新所有用户
    const promises = userIds.map(id =>
      client.request(updateUser(id, { status }))
    );

    await Promise.all(promises);
    revalidatePath("/admin/users");

    return { status: "success", count: userIds.length };
  } catch (error: any) {
    console.error("批量更新状态失败:", error);
    return { status: "error", message: error.message || "批量更新失败" };
  }
}

export async function updateUserAdmin(userId: string, data: any) {
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
