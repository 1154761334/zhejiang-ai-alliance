"use server";
import { auth } from "@/auth";
import { createDirectus, rest, staticToken, createItem, updateItem, deleteItems, readItems } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { surveyFormSchema } from "@/components/dashboard/survey-steps/schema";

const adminClient = createDirectus<any>(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function submitSurvey(rawValues: any, status: "draft" | "pending_review", initialId?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

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
      
      // Contact info in companies table
      contact_name: data.contact_name,
      contact_position: data.contact_position,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      contact_preference: data.contact_preference,
      
      company_description: data.company_description,
      awards_honors: data.awards_honors,
      info_provider_name_position: data.info_provider_name_position,
      confidentiality_commitment: data.confidentiality_commitment,
      delivery_risks: data.delivery_risks,
      risk_mitigation: data.risk_mitigation,
      industry_tags: data.industry_tags,
      capability_tags: data.capability_tags,
      tech_stack_tags: data.tech_stack_tags,
      maturity_level: data.maturity_level,
      data_security_measures: data.data_security_measures,
      info_updated_at: new Date().toISOString().split('T')[0],
    };

    let companyId = initialId;

    if (companyId) {
      await adminClient.request(updateItem("companies", companyId, payload));
      // Cleanup sub-items
      try {
        await adminClient.request(deleteItems("products", { filter: { company_id: { _eq: companyId } } }));
        await adminClient.request(deleteItems("case_studies", { filter: { company_id: { _eq: companyId } } }));
        await adminClient.request(deleteItems("survey_needs", { filter: { company_id: { _eq: companyId } } }));
        await adminClient.request(deleteItems("compliance_risks", { filter: { company_id: { _eq: companyId } } }));
      } catch (e) {
        // Soft cleanup
      }
    } else {
      // Check for existing company for this user
      const existingCompany = await adminClient.request(readItems("companies", {
        filter: { user_created: { _eq: session.user.id } },
        limit: 1
      })) as any[];

      if (existingCompany && existingCompany.length > 0) {
        companyId = existingCompany[0].id;
        await adminClient.request(updateItem("companies", companyId, payload));
      } else {
        payload.user_created = session.user.id;
        payload.id = crypto.randomUUID();
        const company = await adminClient.request(createItem("companies", payload)) as any;
        companyId = company.id;
      }
    }

    if (companyId) {
      // Save Products
      if (data.products && data.products.length > 0) {
        for (const p of data.products) {
          await adminClient.request(createItem("products", { 
            id: crypto.randomUUID(),
            company_id: companyId,
            name: p.name,
            type: p.form_factor, // Naming map
            maturity: p.maturity_stage, // Naming map
            function_desc: p.description, // Naming map
            tech_stack: p.tech_stack,
            model_preference: p.model_preference,
            agent_capabilities: p.agent_capabilities,
            data_capabilities: p.data_capabilities,
            delivery_cycle_months: p.delivery_cycle_months,
            prerequisites: p.prerequisites,
            pricing_model: p.pricing_model,
            pilot_mode: p.pilot_mode
          }));
        }
      }

      // Save Cases
      if (data.case_studies && data.case_studies.length > 0) {
        for (const c of data.case_studies) {
          await adminClient.request(createItem("case_studies", { 
            ...c, 
            id: crypto.randomUUID(),
            company_id: companyId 
          }));
        }
      }

      // Save Needs
      await adminClient.request(createItem("survey_needs", {
        id: crypto.randomUUID(),
        company_id: companyId,
        financing_need: data.financing_need,
        market_needs: data.market_need,
        tech_needs: data.tech_need,
        compute_pain_points: data.compute_pain_points,
        tech_complement_desc: data.tech_complement_desc,
        policy_intent: data.policy_intent
      }));

      // Save Compliance
      await adminClient.request(createItem("compliance_risks", {
        id: crypto.randomUUID(),
        company_id: companyId,
        data_security_measures: data.data_security_measures,
        has_mlps_certification: data.has_mlps_certification,
        processes_pii: data.processes_pii
      }));
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/companies");
    return { success: true, companyId };

  } catch (error: any) {
    console.error("[submitSurvey] Error caught in server action:", error);
    return { 
      success: false, 
      error: error.message || "Failed to submit survey" 
    };
  }
}