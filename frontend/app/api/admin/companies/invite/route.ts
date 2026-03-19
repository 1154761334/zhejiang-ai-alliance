import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, createUser, readRoles, readUsers, updateUser } from "@directus/sdk";
import { env } from "@/env.mjs";
import { auth } from "@/auth";
import { logAuditAction } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, name, company_id } = await req.json();
        
        if (!email || !name) {
            return NextResponse.json({ error: "必填字段缺失" }, { status: 400 });
        }

        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        // 1. Check if User already exists
        const existingUsers = await client.request(readUsers({
            filter: { email: { _eq: email } },
            fields: ['id']
        }));

        let userId: string;

        if (existingUsers && existingUsers.length > 0) {
            userId = existingUsers[0].id;
            // Update mapping
            await client.request(updateUser(userId, {
                affiliated_company_id: company_id || null,
                first_name: name
            } as any));
        } else {
            // Get Member role ID
            const roles = await client.request(readRoles({
                filter: { name: { _eq: 'Member' } }
            }));
            const memberRoleId = roles[0]?.id || (await client.request(readRoles({ filter: { name: { _eq: 'User' } } })))[0]?.id;

            // Create new user
            const newUser = await client.request(createUser({
                email,
                first_name: name,
                role: memberRoleId,
                status: 'invited',
                affiliated_company_id: company_id || null
            } as any));
            userId = newUser.id;
        }

        await logAuditAction({
            action: 'INVITE_MEMBER_WITH_MAPPING',
            userId: session.user.id,
            targetType: 'directus_users',
            targetId: userId,
            details: `管理员邀请成员: ${email} 并关联企业 ID: ${company_id || '无'}`,
            req
        });

        return NextResponse.json({ success: true, id: userId });
    } catch (error: any) {
        console.error("Invite Error:", error);
        return NextResponse.json({ error: error.message || "邀请失败" }, { status: 500 });
    }
}
