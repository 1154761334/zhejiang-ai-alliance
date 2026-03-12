"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { UserRole } from "types";

import { userRoleSchema } from "@/lib/validations/user";

export type FormData = {
  role: UserRole;
};

export async function updateUserRole(userId: string, data: FormData) {
  try {
    const session = await auth();

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { role } = userRoleSchema.parse(data);

    // TODO: Update user role in Directus backend
    // await directus.users.update(userId, { role });

    revalidatePath("/dashboard/settings");
    return { status: "success" };
  } catch (error) {
    return { status: "error" };
  }
}
