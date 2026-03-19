import { NextResponse } from "next/server";
import { createDirectus, rest, readItems } from "@directus/sdk";
import { env } from "@/env.mjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
    }

    const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055").with(rest());

    const users = await client.request(readItems("directus_users", {
      filter: { email: { _eq: email } },
      fields: ["id", "email"]
    }));

    if (!users || (users as any[]).length === 0) {
      return NextResponse.json({ error: "该邮箱未注册" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "如果邮箱存在，系统将发送密码重置链接" 
    });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "系统错误，请稍后再试" }, { status: 500 });
  }
}