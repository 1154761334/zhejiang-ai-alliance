"use server";

import { auth } from "@/auth";
import { createDirectus, rest, staticToken, updateUser } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { passwordChangeSchema } from "@/lib/validations/account";
import { userNameSchema } from "@/lib/validations/user";

const adminClient = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function updatePassword(data: { currentPassword?: string; newPassword: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    passwordChangeSchema.parse(data);

    await adminClient.request(updateUser(session.user.id, {
      password: data.newPassword
    }));

    return { status: "success" };
  } catch (error) {
    console.error("Action error (updatePassword):", error);
    return { status: "error", message: error.message };
  }
}

export async function updateProfile(data: { name: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    userNameSchema.parse(data);

    await adminClient.request(updateUser(session.user.id, {
      first_name: data.name
    }));

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    console.error("Action error (updateProfile):", error);
    return { status: "error", message: error.message };
  }
}