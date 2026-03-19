import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, createItem, createUser, readRoles, readUsers, readItems } from "@directus/sdk";
import { env } from "@/env.mjs";
import { auth } from "@/auth";
import { logAuditAction } from "@/lib/audit";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

function logDebug(tag: string, data: any) {
    const logPath = path.join(process.cwd(), 'api-debug.log');
    const entry = `[${new Date().toISOString()}] [${tag}] ${JSON.stringify(data, null, 2)}\n\n`;
    fs.appendFileSync(logPath, entry);
}

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

        // 1. Fetch Companies
        const companies = await client.request(readItems('companies', {
            fields: ['id', 'company_name', 'credit_code', 'region', 'role', 'status', 'source', 'contact_email', 'user_created'],
            limit: -1
        }));

        // Diagnostic dump
        logDebug("DIAGNOSTIC_DUMP", { 
            stack: "GET Companies Sample", 
            response: { sample: companies.slice(0, 3) } 
        });

        // 2. Fetch Needs
        const needs = await client.request(readItems('survey_needs', {
            fields: ['user_created', 'policy_intent'],
            limit: -1
        }));

        const needsMap = new Map();
        needs.forEach(n => {
            if (n.user_created) {
                const uid = typeof n.user_created === 'object' ? n.user_created.id : n.user_created;
                needsMap.set(uid, n);
            }
        });

        const extendedData = companies.map(c => ({
            ...c,
            policy_intent: needsMap.get(c.user_created)?.policy_intent || []
        }));

        return NextResponse.json(extendedData);
    } catch (error: any) {
        console.error("List Companies Error:", error);
        return NextResponse.json({ error: "Failed to fetch company list" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        // Full dimension support (Tier A fields)
        const { 
            company_name, 
            credit_code, 
            contact_name, 
            contact_email, 
            contact_phone, 
            contact_position,
            region, 
            address,
            website,
            sector,
            established_date,
            employee_count,
            rnd_count
        } = body;

        if (!company_name || !contact_email || !contact_name) {
            return NextResponse.json({ error: "必填字段缺失" }, { status: 400 });
        }

        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        // 1. Get User role ID
        const roles = await client.request(readRoles({
            filter: { name: { _eq: 'User' } }
        }));
        const userRoleId = roles[0]?.id;

        if (!userRoleId) {
            console.error("User role not found in Directus");
            return NextResponse.json({ error: "系统权限配置错误：未找到 User 角色" }, { status: 500 });
        }

        // 2. Check if User already exists, if not Create it
        let userId: string;
        try {
            const existingUsers = await client.request(readUsers({
                filter: { email: { _eq: contact_email } },
                fields: ['id']
            }));

            if (existingUsers && existingUsers.length > 0) {
                userId = existingUsers[0].id;
                console.log(`Reusing existing user for email: ${contact_email}`);
            } else {
                const newUser = await client.request(createUser({
                    email: contact_email,
                    first_name: contact_name,
                    role: userRoleId,
                    status: 'invited',
                }));
                userId = newUser.id;
                console.log(`Created new user for email: ${contact_email}`);
            }
        } catch (uErr: any) {
            console.error("User ops error:", uErr);
            logDebug("ERROR", uErr);
            throw uErr;
        }

        // 3. Prepare tracks (split by comma/space)
        const trackList = sector 
            ? sector.split(/[,，\s]+/).filter(Boolean)
            : [];

        const companyId = crypto.randomUUID();
        const payload = {
            id: companyId,
            company_name: body.company_name,
            credit_code: body.credit_code || null,
            established_date: body.established_date || null,
            region: body.region,
            address: body.address,
            website: body.website,
            contact_name: body.contact_name,
            contact_email: body.contact_email,
            contact_phone: body.contact_phone,
            contact_position: body.contact_position,
            contact_preference: body.contact_preference,
            company_description: body.company_description,
            awards_honors: body.awards_honors,
            company_type: body.company_type,
            employee_count: body.employee_count || 0,
            rnd_count: body.rnd_count || 0,
            revenue_range: body.revenue_range,
            role: body.role,
            tracks: body.tracks || [],
            info_provider_name_position: body.info_provider_name_position,
            maturity_level: body.maturity_level,
            industry_tags: body.industry_tags,
            capability_tags: body.capability_tags,
            tech_stack_tags: body.tech_stack_tags,
            confidentiality_commitment: body.confidentiality_commitment,
            delivery_risks: body.delivery_risks,
            risk_mitigation: body.risk_mitigation,
            user_created: userId, 
            source: 'admin_created',
            status: 'draft',
            info_updated_at: new Date().toISOString().split('T')[0]
        };

        logDebug("POST_PAYLOAD", payload);

        await client.request(createItem('companies', payload));

        // 5. Create Associated Records
        
        // Survey Needs
        await client.request(createItem('survey_needs', {
            id: crypto.randomUUID(),
            company_id: companyId,
            financing_need: body.financing_need,
            market_need: body.market_need,
            tech_need: body.tech_need,
            compute_pain_points: body.compute_pain_points,
            tech_complement_desc: body.tech_complement_desc,
            policy_intent: body.policy_intent
        }));

        // Compliance Risks
        await client.request(createItem('compliance_risks', {
            id: crypto.randomUUID(),
            company_id: companyId,
            data_security_measures: body.data_security_measures,
            has_mlps_certification: body.has_mlps_certification,
            processes_pii: body.processes_pii
        }));

        // Products
        if (body.products && body.products.length > 0) {
            for (const p of body.products) {
                await client.request(createItem("products", { 
                  ...p, 
                  id: crypto.randomUUID(), 
                  company_id: companyId 
                }));
            }
        }

        // Case Studies
        if (body.case_studies && body.case_studies.length > 0) {
            for (const c of body.case_studies) {
                await client.request(createItem("case_studies", { 
                  ...c, 
                  id: crypto.randomUUID(), 
                  company_id: companyId, 
                  is_live: c.is_live || false 
                }));
            }
        }

        await logAuditAction({
            action: 'SINGLE_ENTRY_COMPREHENSIVE',
            userId: session.user.id,
            targetType: 'companies',
            targetId: companyId,
            details: `管理员录入全维度企业档案: ${body.company_name} (含产品与案例)`,
            req
        });

        return NextResponse.json({ success: true, id: companyId });
    } catch (error: any) {
        console.error("Single Entry Error Detail:", {
            message: error.message,
            response: error.response?.data || error.errors
        });
        logDebug("POST_ERROR", {
            message: error.message,
            response: error.response?.data || error.errors,
            stack: error.stack
        });
        const errMsg = error.errors?.[0]?.message || error.message;
        return NextResponse.json({ error: errMsg || "录入失败" }, { status: 500 });
    }
}
