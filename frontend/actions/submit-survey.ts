"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import {
  createDirectus,
  createItem,
  deleteItems,
  readItems,
  rest,
  staticToken,
  updateItem,
} from "@directus/sdk";

import { env } from "@/env.mjs";
import { surveyFormSchema } from "@/components/dashboard/survey-steps/schema";

const adminClient = createDirectus<any>(
  env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
)
  .with(
    staticToken(
      env.DIRECTUS_STATIC_TOKEN || "static_ebdfd517a183459c82972b87d2d5ec3f",
    ),
  )
  .with(rest());

function summarizeNeeds(data: any) {
  const parts = [
    data.financing_need?.length
      ? `融资：${data.financing_need.join("、")}`
      : "",
    data.market_need?.length ? `市场：${data.market_need.join("、")}` : "",
    data.tech_need?.length ? `技术：${data.tech_need.join("、")}` : "",
    data.compute_pain_points?.length
      ? `算力：${data.compute_pain_points.join("、")}`
      : "",
    data.tech_complement_desc ? `补充：${data.tech_complement_desc}` : "",
  ].filter(Boolean);

  return parts.join("\n");
}

async function logAuditEvent(
  action: string,
  targetType: string,
  targetId: string,
  userId: string,
  details: Record<string, unknown>,
) {
  try {
    await adminClient.request(
      createItem("audit_logs", {
        id: crypto.randomUUID(),
        action,
        target_type: targetType,
        target_id: targetId,
        user_id: userId,
        details: JSON.stringify(details),
        ip_address: "server",
        created_at: new Date().toISOString(),
      }),
    );
  } catch (error) {
    console.error("[submitSurvey] Failed to write audit log:", error);
  }
}

export async function submitSurvey(
  rawValues: any,
  status: "draft" | "pending_review",
  initialId?: string,
) {
  try {
    console.log(
      `[submitSurvey] Starting submission. Status: ${status}, InitialId: ${initialId}`,
    );
    console.log(
      `[submitSurvey] Raw Products Length: ${rawValues?.products?.length || 0}`,
    );
    console.log(
      `[submitSurvey] Raw Cases Length: ${rawValues?.case_studies?.length || 0}`,
    );
    const session = await auth();
    if (!session?.user?.id) {
      console.error("[submitSurvey] No session found");
      return { success: false, error: "Not authenticated" };
    }
    console.log(`[submitSurvey] Authenticated as UserID: ${session.user.id}`);

    const data = surveyFormSchema.parse(rawValues);

    const payload: any = {
      status: status,
      company_name: data.company_name,
      credit_code: data.credit_code,
      established_date: data.established_date
        ? new Date(data.established_date).toISOString().split("T")[0]
        : null,
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
      core_business: data.company_description,
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
      expected_resources: summarizeNeeds(data),
      info_updated_at: new Date().toISOString().split("T")[0],
    };

    let companyId = initialId;

    if (companyId) {
      await adminClient.request(updateItem("companies", companyId, payload));
      // Cleanup sub-items
      try {
        await adminClient.request(
          deleteItems("products", {
            filter: { company_id: { _eq: companyId } },
          }),
        );
        await adminClient.request(
          deleteItems("case_studies", {
            filter: { company_id: { _eq: companyId } },
          }),
        );
        await adminClient.request(
          deleteItems("survey_needs", {
            filter: { company_id: { _eq: companyId } },
          }),
        );
        await adminClient.request(
          deleteItems("compliance_risks", {
            filter: { company_id: { _eq: companyId } },
          }),
        );
      } catch (e) {
        // Soft cleanup
      }
    } else {
      // Check for existing company for this user
      const existingCompany = (await adminClient.request(
        readItems("companies", {
          filter: { user_created: { _eq: session.user.id } },
          limit: 1,
        }),
      )) as any[];

      if (existingCompany && existingCompany.length > 0) {
        const existingCompanyId = existingCompany[0].id as string;
        companyId = existingCompanyId;
        await adminClient.request(updateItem("companies", companyId, payload));
      } else {
        payload.user_created = session.user.id;
        payload.id = crypto.randomUUID();
        const company = (await adminClient.request(
          createItem("companies", payload),
        )) as any;
        companyId = company.id;
      }
    }

    if (companyId) {
      // Save Products
      if (data.products && data.products.length > 0) {
        for (const p of data.products) {
          await adminClient.request(
            createItem("products", {
              id: crypto.randomUUID(),
              company_id: companyId,
              name: p.name || "",
              product_name: p.name || "",
              form_factor: p.form_factor || "",
              product_type: p.form_factor || "",
              maturity_stage: p.maturity_stage || "",
              description: p.description || "",
              product_description: p.description || "",
              advantage: p.advantages || "",
              category: p.category || "",
              tech_stack: p.tech_stack || "",
              model_preference: p.model_preference || [],
              agent_capabilities: p.agent_capabilities || [],
              data_capabilities: p.data_capabilities || [],
              engineering_capabilities: p.engineering_capabilities || [],
              integration_capabilities: p.integration_capabilities || [],
              delivery_cycle_months: p.delivery_cycle_months || null,
              prerequisites: p.prerequisites || "",
              pricing_model: p.pricing_model || "",
              pilot_mode: p.pilot_mode || "",
              case_industries: p.case_industries || [],
            }),
          );
        }
      }

      // Save Cases
      if (data.case_studies && data.case_studies.length > 0) {
        for (const c of data.case_studies) {
          await adminClient.request(
            createItem("case_studies", {
              id: crypto.randomUUID(),
              company_id: companyId,
              title: c.title || "",
              case_title: c.title || "",
              location: c.location || "",
              implementation_date: c.implementation_date || null,
              pain_points: c.pain_points || "",
              solution: c.solution || "",
              data_types: c.data_types || [],
              is_live: !!c.is_live,
              evidence_type: c.evidence_type || "none",
              quantified_results: c.quantified_results || "",
              reusability: c.reusability || "",
            }),
          );
        }
      }

      // Save Needs
      await adminClient.request(
        createItem("survey_needs", {
          id: crypto.randomUUID(),
          company_id: companyId,
          financing_need: data.financing_need || [],
          market_need: data.market_need || [],
          market_needs: data.market_need || [],
          tech_need: data.tech_need || [],
          tech_needs: data.tech_need || [],
          compute_pain_points: data.compute_pain_points || [],
          tech_complement_desc: data.tech_complement_desc || "",
          policy_intent: data.policy_intent || [],
          ticket_status: "pending",
        }),
      );

      // Save Compliance
      await adminClient.request(
        createItem("compliance_risks", {
          id: crypto.randomUUID(),
          company_id: companyId,
          data_security_measures: data.data_security_measures || "",
          has_mlps_certification: !!data.has_mlps_certification,
          processes_pii: !!data.processes_pii,
        }),
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/admin/companies");
    revalidatePath("/members");
    await logAuditEvent(
      "SUBMIT_SURVEY",
      "companies",
      companyId || "unknown",
      session.user.id,
      {
        status,
        initialId,
      },
    );
    console.log(`[submitSurvey] Success! Company ID: ${companyId}`);
    return { success: true, id: companyId };
  } catch (error: any) {
    console.error("[submitSurvey] Fatal Error:", error);
    if (error.errors) {
      console.error(
        "[submitSurvey] Directus errors:",
        JSON.stringify(error.errors, null, 2),
      );
    }
    return {
      success: false,
      error: error.message || "Failed to submit survey",
    };
  }
}
