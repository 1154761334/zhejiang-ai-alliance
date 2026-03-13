import { auth } from "@/auth";
import { createDirectus, rest, staticToken, createItem, updateItem, readItem, deleteItems, readItems } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { surveyFormSchema } from "@/components/dashboard/survey-steps/schema";

// Custom schema to match lib/directus.ts
interface Schema {
    companies: any[];
    products: any[];
    case_studies: any[];
    survey_needs: any[];
    compliance_risks: any[];
}

const client = createDirectus<any>(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function submitSurvey(rawValues: any, status: "draft" | "pending_review", initialId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    // 1. Server-side Validation
    const data = surveyFormSchema.parse(rawValues);

    const payload: any = {
      status: status,
      company_name: data.company_name,
      credit_code: data.credit_code,
      established_date: data.established_date || null,
      region: data.region,
      address: data.address,
      website: data.website,
      company_type: data.company_type,
      employee_count: data.employee_count,
      rnd_count: data.rnd_count,
      revenue_range: data.revenue_range,
      tracks: data.tracks,
      role: data.role,
      contact_name: data.contact_name,
      contact_position: data.contact_position,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      contact_preference: data.contact_preference,
    };

    let companyId = initialId;

    if (initialId) {
      // 2. Ownership & IDOC Check
      const existing = await client.request(readItem("companies", initialId, { fields: ["user_created"] }));
      if (!existing || existing.user_created !== session.user.id) {
        throw new Error("Forbidden: You do not own this record");
      }

      // Update existing
      await client.request(updateItem("companies", initialId, payload));

      // 3. Sync Child Entities (Wipe and Re-create for nested tables to ensure consistency)
      // Products
      await client.request(deleteItems("products", { filter: { company_id: { _eq: initialId } } }));
      // Case Studies
      await client.request(deleteItems("case_studies", { filter: { company_id: { _eq: initialId } } }));
      // Needs (Using readItems because we filter by company_id)
      const existingNeeds = await client.request(readItems("survey_needs", { 
        filter: { company_id: { _eq: initialId } },
        limit: 1
      }));
      if (existingNeeds && (existingNeeds as any[]).length > 0) {
        await client.request(deleteItems("survey_needs", { filter: { company_id: { _eq: initialId } } }));
      }
      // Compliance
      await client.request(deleteItems("compliance_risks", { filter: { company_id: { _eq: initialId } } }));

    } else {
      // 2.5 Check if user already has a company record (One Company per User constraint)
      const existingCompany = await client.request(readItems("companies", {
        filter: { user_created: { _eq: session.user.id } },
        limit: 1,
        fields: ["id"]
      }));

      if (existingCompany && (existingCompany as any[]).length > 0) {
        throw new Error("You already have an established company profile. Please update the existing one.");
      }

      // Create new - 显式传递 UUID 避免数据库默认值问题
      payload.user_created = session.user.id;
      payload.id = crypto.randomUUID();
      const company = await client.request(createItem("companies", payload)) as any;
      companyId = company.id;
    }

    // 4. Populate/Update Child Entities
    if (companyId) {
      // Products
      if (data.products && data.products.length > 0) {
        for (const p of data.products) {
          await client.request(createItem("products", { 
            ...p, 
            id: crypto.randomUUID(),
            company_id: companyId 
          }));
        }
      }

      // Cases
      if (data.case_studies && data.case_studies.length > 0) {
        for (const c of data.case_studies) {
          await client.request(createItem("case_studies", { 
            ...c, 
            id: crypto.randomUUID(),
            company_id: companyId, 
            is_live: c.is_live || false 
          }));
        }
      }

      // Needs
      await client.request(createItem("survey_needs", {
        id: crypto.randomUUID(),
        company_id: companyId,
        financing_need: data.financing_need,
        market_need: data.market_need,
        tech_need: data.tech_need,
        compute_pain_points: data.compute_pain_points,
        tech_complement_desc: data.tech_complement_desc,
        policy_intent: data.policy_intent
      }));

      // Compliance
      await client.request(createItem("compliance_risks", {
        id: crypto.randomUUID(),
        company_id: companyId,
        data_security_measures: data.data_security_measures,
        has_mlps_certification: data.has_mlps_certification,
        processes_pii: data.processes_pii
      }));
    }

    revalidatePath("/dashboard");
    return { status: "success", id: companyId };
  } catch (error: any) {
    console.error("Action error (submitSurvey):", error);
    return { status: "error", message: error.message };
  }
}
