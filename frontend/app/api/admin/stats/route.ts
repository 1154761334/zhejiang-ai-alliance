import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import { env } from "@/env.mjs";
import { auth } from "@/auth";

export async function GET() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        // 1. Total companies
        const companies = await client.request(readItems('companies', { fields: ['id', 'status'] }));
        const totalCompanies = companies.length;
        const publishedCompanies = companies.filter(c => c.status === 'published').length;

        // 2. Compute needs
        const needs = await client.request(readItems('survey_needs', { fields: ['compute_amount', 'policy_intent'] }));
        
        let totalCompute = 0;
        let couponInterested = 0;
        needs.forEach(n => {
            if (n.compute_amount) {
                const val = parseFloat(n.compute_amount);
                if (!isNaN(val)) totalCompute += val;
            }
            if (Array.isArray(n.policy_intent) && n.policy_intent.some((i: string) => i.includes("券"))) {
                couponInterested++;
            }
        });

        return NextResponse.json({
            totalCompanies,
            publishedCompanies,
            totalCompute,
            couponInterested,
            newToday: 0
        });
    } catch (error: any) {
        console.error("Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
