import { createDirectus, rest, registerUser } from "@directus/sdk";
import { NextResponse } from "next/server";
import { env } from "@/env.mjs";
import { loginSchema } from "@/lib/validations/auth";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        // 1. Validation using shared schema
        const validated = loginSchema.parse(body);

        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest());

        // 2. Directus registerUser function creates a new user in the system
        await client.request(registerUser(validated.email, validated.password));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Registration Error:", error);

        if (error.name === "ZodError") {
            return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
        }

        let message = "注册失败，请稍后再试";
        const directusErrorCode = error.errors?.[0]?.extensions?.code;
        const directusMessage = error.errors?.[0]?.message;

        if (directusErrorCode === 'RECORD_NOT_UNIQUE' || (directusMessage && directusMessage.toLowerCase().includes('unique'))) {
            message = "该企业邮箱已被注册，请直接登录";
        }

        return NextResponse.json({ error: message }, { status: error.response?.status || 500 });
    }
}
