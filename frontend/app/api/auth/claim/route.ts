import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, readUsers, updateItem } from "@directus/sdk";
import { env } from "@/env.mjs";
import { logAuditAction } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: "Token and password are required" }, { status: 400 });
        }

        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        // 1. Find user by token
        const users = await client.request(readUsers({
            filter: {
                handover_token: { _eq: token },
                handover_expires: { _gt: new Date().toISOString() }
            }
        }));

        if (users.length === 0) {
            return NextResponse.json({ error: "无效或已过期的认领令牌" }, { status: 400 });
        }

        const user = users[0];

        // 2. Update password and clear token
        await client.request(updateItem('directus_users', user.id, {
            password: password,
            handover_token: null,
            handover_expires: null,
            status: 'active'
        }));

        await logAuditAction({
            action: 'ACCOUNT_CLAIM',
            userId: user.id,
            details: `用户通过 Token 完成账号认领`,
            req
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Claim Error:", error);
        return NextResponse.json({ error: "认领失败，请联系管理员" }, { status: 500 });
    }
}
