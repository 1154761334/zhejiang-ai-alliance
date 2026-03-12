"use server";

import { auth } from "@/auth";
import { createDirectus, rest, staticToken, createItem, updateItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";

const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function submitSurvey(data: any, status: "draft" | "pending_review", initialId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const payload = {
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
      user_created: session.user.id, // Explicitly set owner if creating
    };

    let company;

    if (initialId) {
      // Update existing
      // @ts-ignore
      company = await client.request(updateItem("companies", initialId, payload));
    } else {
      // Create new
      // @ts-ignore
      company = await client.request(createItem("companies", payload));
    }

    if (company && company.id && !initialId) {
      // Handle nested relations for new submission
      
      // Products
      if (data.products && data.products.length > 0) {
        for (const p of data.products) {
           // @ts-ignore
           await client.request(createItem("products", { ...p, company_id: company.id }));
        }
      }

      // Cases
      if (data.case_studies && data.case_studies.length > 0) {
        for (const c of data.case_studies) {
           // @ts-ignore
           await client.request(createItem("case_studies", { ...c, company_id: company.id, is_live: c.is_live || false }));
        }
      }

      // Needs
      // @ts-ignore
      await client.request(createItem("survey_needs", {
        company_id: company.id,
        financing_need: data.financing_need,
        market_need: data.market_need,
        tech_need: data.tech_need,
        compute_pain_points: data.compute_pain_points,
        tech_complement_desc: data.tech_complement_desc,
        policy_intent: data.policy_intent
      }));

      // Compliance
      // @ts-ignore
      await client.request(createItem("compliance_risks", {
        company_id: company.id,
        data_security_measures: data.data_security_measures,
        has_mlps_certification: data.has_mlps_certification,
        processes_pii: data.processes_pii
      }));
    }

    revalidatePath("/dashboard");
    return { status: "success", id: company.id };
  } catch (error: any) {
    console.error("Action error (submitSurvey):", error);
    return { status: "error", message: error.message };
  }
}
