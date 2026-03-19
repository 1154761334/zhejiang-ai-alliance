import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, readItems, updateItem, readUsers } from "@directus/sdk";
import { env } from "@/env.mjs";
import crypto from "crypto";
import { auth } from "@/auth";
import { logAuditAction } from "@/lib/audit";
import { sendHandoverEmail } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, companyName } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        // Find user by email
        const users = await client.request(readUsers({
            filter: { email: { _eq: email } }
        }));

        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

        // Update user with handover token
        await client.request(updateItem('directus_users', user.id, {
            handover_token: token,
            handover_expires: expires
        }));

        const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const claimLink = `${baseUrl}/claim?token=${token}`;

        // Send email notification (async, don't block response)
        sendHandoverEmail({
            to: email,
            companyName: companyName || "您的企业",
            claimLink: claimLink
        }).catch(err => console.error("Delayed email send error:", err));

        await logAuditAction({
            action: 'ACCOUNT_HANDOVER',
            userId: session.user.id,
            targetType: 'directus_users',
            targetId: user.id,
            details: `生成认领链接 (企业: ${companyName || '未知'})`,
            req
        });

        return NextResponse.json({ claimLink });
    } catch (error: any) {
        console.error("Invite Error:", error);
        return NextResponse.json({ error: "Failed to generate invite link" }, { status: 500 });
    }
}
