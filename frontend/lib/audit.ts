import { createDirectus, rest, staticToken, createItem } from "@directus/sdk";
import { env } from "@/env.mjs";

export async function logAuditAction(params: {
    action: string;
    userId?: string;
    targetType?: string;
    targetId?: string;
    details?: string;
    req?: Request;
}) {
    try {
        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        const ipAddress = params.req?.headers.get("x-forwarded-for") || "unknown";
        const userAgent = params.req?.headers.get("user-agent") || "unknown";

        await client.request(createItem('audit_logs', {
            action: params.action,
            user_id: params.userId,
            target_type: params.targetType,
            target_id: params.targetId,
            details: params.details,
            ip_address: ipAddress,
            user_agent: userAgent,
            created_at: new Date().toISOString()
        }));
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
}
