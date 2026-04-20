"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createDirectus,
  createItem,
  rest,
  staticToken,
  updateItem,
} from "@directus/sdk";

type UpdateNeedPayload = {
  ticket_status?: string;
  assignee?: string;
  tags?: string[];
};

const adminClient = createDirectus(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
)
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

async function logMatchmakingAudit(
  needId: string,
  userId: string,
  payload: UpdateNeedPayload,
) {
  try {
    await adminClient.request(
      createItem("audit_logs", {
        action: "UPDATE_MATCHMAKING_NEED",
        user_id: userId,
        target_type: "survey_needs",
        target_id: needId,
        details: JSON.stringify(payload),
        ip_address: "server",
        created_at: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("Failed to log matchmaking audit:", error);
  }
}

export async function updateMatchmakingNeed(
  needId: string,
  payload: UpdateNeedPayload,
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const updatePayload: UpdateNeedPayload = {};
    if (payload.ticket_status !== undefined) {
      updatePayload.ticket_status = payload.ticket_status;
    }
    if (payload.assignee !== undefined) {
      updatePayload.assignee = payload.assignee;
    }
    if (payload.tags !== undefined) {
      updatePayload.tags = payload.tags;
    }

    await adminClient.request(updateItem("survey_needs", needId, updatePayload));
    await logMatchmakingAudit(
      needId,
      session.user.id || "unknown",
      updatePayload,
    );
    revalidatePath("/admin/matchmaking");
    revalidatePath("/admin/audit");
    revalidatePath("/dashboard/needs");

    return { status: "success" };
  } catch (error: any) {
    console.error("updateMatchmakingNeed failed:", error);
    return {
      status: "error",
      message: error.message || "需求工单更新失败",
    };
  }
}
