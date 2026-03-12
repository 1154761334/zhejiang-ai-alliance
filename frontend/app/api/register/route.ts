import { createDirectus, rest, registerUser } from "@directus/sdk";
import { NextResponse } from "next/server";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest());

        // Directus registerUser function creates a new user in the system
        // Default role for public registration should be configured in Directus settings
        // or we can manually assign it if we use an admin token, but registerUser is cleaner.
        await client.request(registerUser(email, password));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Registration Error:", error);

        let message = "注册失败，请稍后再试";
        const directusErrorCode = error.errors?.[0]?.extensions?.code;
        const directusMessage = error.errors?.[0]?.message;

        if (directusErrorCode === 'RECORD_NOT_UNIQUE' || (directusMessage && directusMessage.toLowerCase().includes('unique'))) {
            message = "该企业邮箱已被注册，请直接登录";
        }

        return NextResponse.json({ error: message }, { status: error.response?.status || 500 });
    }
}
