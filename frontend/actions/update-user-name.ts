"use server";

import { auth } from "@/auth";
import { userNameSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

export type FormData = {
  name: string;
};

export async function updateUserName(userId: string, data: FormData) {
  try {
    const session = await auth()

    if (!session?.user || session?.user.id !== userId) {
      throw new Error("Unauthorized");
    }

    const { name } = userNameSchema.parse(data);

    // TODO: Update user name in Directus
    // await directus.users.update(userId, { name });

    revalidatePath('/dashboard/settings');
    return { status: "success" };
  } catch (error) {
    return { status: "error" }
  }
}