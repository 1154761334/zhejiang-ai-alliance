import { NextResponse } from "next/server";
import { createDirectus, rest, staticToken, createItem, createUser, readRoles } from "@directus/sdk";
import { env } from "@/env.mjs";
import * as XLSX from "xlsx";
import { auth } from "@/auth";
import { logAuditAction } from "@/lib/audit";

export async function POST(req: Request) {
    try {
        const session = await auth();
        
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "请上传一个 Excel 文件" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet) as any[];

        const adminToken = process.env.DIRECTUS_STATIC_TOKEN;
        const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(rest())
            .with(staticToken(adminToken || ""));

        const roles = await client.request(readRoles({
            filter: { name: { _eq: 'User' } }
        }));
        const userRoleId = roles[0]?.id;

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const row of data) {
            try {
                // Tier A - Essential Lead Fields
                const companyName = row["企业全称"] || row["Enterprise Name"] || row["company_name"];
                const creditCode = row["信用代码"] || row["Credit Code"] || row["credit_code"];
                const contactEmail = row["联系邮箱"] || row["Email"] || row["email"];
                const contactPerson = row["联系人"] || row["Contact"] || row["contact_person"];
                const contactPhone = row["联系电话"] || row["手机号"] || row["Phone"];
                const contactPosition = row["职务"] || row["Position"];
                const sector = row["细分赛道"] || row["Sector"];
                const region = row["地区"] || row["区域"];
                
                // Tier A - Advanced Info
                const address = row["详细地址"] || row["Address"];
                const website = row["官网地址"] || row["Website"];
                const establishedDate = row["成立时间"] || row["Established Date"];
                const employeeCount = parseInt(row["人员规模"] || row["Employees"] || "0");
                const rndCount = parseInt(row["研发人数"] || row["R&D Count"] || "0");

                // Tier C - Internal Investigation (Optional)
                const actualCapacity = row["实地产能"] || row["Actual Capacity"];
                const techEval = row["技术团队评估"] || row["Tech Evaluation"];
                const realClients = row["大客户核查"] || row["Real Clients"];
                const internalNotes = row["避坑指南"] || row["Internal Notes"];
                const riskLevel = row["风险等级"] || row["Risk Level"] || "Low";
                const coopWillingness = row["合作意愿"] || row["Willingness"] || "B";
                const techScore = parseInt(row["技术成熟度"] || "3");
                const marketScore = parseInt(row["市场影响力"] || "3");
                const actualTeamSize = parseInt(row["核实人数"] || row["Actual Team Size"] || "0");

                if (!companyName || !contactEmail) {
                    throw new Error(`行缺失必填字段 (企业名称/邮箱)`);
                }

                // 1. Create User
                const user = await client.request(createUser({
                    email: contactEmail,
                    first_name: contactPerson,
                    role: userRoleId,
                    status: 'invited',
                }));

                // 2. Create Company profile (Tier A)
                const company = await client.request(createItem('companies', {
                    company_name: companyName,
                    credit_code: creditCode,
                    contact_name: contactPerson,
                    contact_email: contactEmail,
                    contact_phone: contactPhone,
                    contact_position: contactPosition,
                    region: region,
                    address: address,
                    website: website,
                    established_date: establishedDate || null,
                    employee_count: employeeCount,
                    rnd_count: rndCount,
                    role: sector, 
                    tracks: sector ? (Array.isArray(sector) ? sector : [sector]) : [],
                    user_created: user.id,
                    source: 'batch_imported',
                    status: 'draft'
                })) as any;

                // 3. Optional: Create Tier C Record if any Tier C data is present
                if (actualCapacity || techEval || internalNotes || realClients) {
                    await client.request(createItem('org_internal_investigations', {
                        company_id: company.id,
                        investigator: session.user.name || "Admin (Batch)",
                        investigation_date: new Date().toISOString(),
                        actual_capacity: actualCapacity,
                        technical_team_eval: techEval,
                        real_key_clients: realClients,
                        internal_notes: internalNotes,
                        risk_level: riskLevel,
                        cooperation_willingness: coopWillingness,
                        tech_maturity_score: techScore,
                        market_influence_score: marketScore,
                        actual_team_size: actualTeamSize
                    }));
                }

                results.success++;
            } catch (err: any) {
                results.failed++;
                const errMsg = err.errors?.[0]?.message || err.message;
                results.errors.push(`${row["企业全称"] || "未知企业"}: ${errMsg}`);
            }
        }

        await logAuditAction({
            action: 'BATCH_IMPORT_COMPREHENSIVE',
            userId: session.user.id,
            details: `全维度批量导入: 成功 ${results.success}, 失败 ${results.failed}`,
            req
        });

        return NextResponse.json(results);
    } catch (error: any) {
        console.error("Import Error:", error);
        return NextResponse.json({ error: "导入处理失败，请检查文件格式" }, { status: 500 });
    }
}
