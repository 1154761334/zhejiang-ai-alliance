"use server";

import { auth } from "@/auth";
import { createDirectus, rest, staticToken, updateItem, createItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { companyTierASchema, internalInvestigationSchema } from "@/lib/validations/crm";

const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function updateCompanyTierA(companyId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const validated = companyTierASchema.partial().parse(data);

    // @ts-ignore
    await client.request(updateItem('companies', companyId, {
        company_name: data.company_name,
        credit_code: data.credit_code,
        established_date: data.established_date,
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
        core_business: data.core_business,
        expected_resources: data.expected_resources,
        key_clients_claimed: data.key_clients_claimed,
        status: data.status
    }));

    if (data.survey_needs && data.survey_needs.length > 0) {
       const needsData = data.survey_needs[0];
       const needsPayload = {
           financing_need: needsData.financing_need,
           market_need: needsData.market_need,
           compute_pain_points: needsData.compute_pain_points,
           policy_intent: needsData.policy_intent,
           tech_complement_desc: needsData.tech_complement_desc,
       };
       // @ts-ignore
       if (needsData.id) await client.request(updateItem('survey_needs', needsData.id, needsPayload));
       // @ts-ignore
       else await client.request(createItem('survey_needs', { ...needsPayload, company_id: companyId }));
    }

    if (data.compliance_risks && data.compliance_risks.length > 0) {
       const riskData = data.compliance_risks[0];
       const riskPayload = {
           data_security_measures: riskData.data_security_measures,
           has_mlps_certification: riskData.has_mlps_certification,
           processes_pii: riskData.processes_pii,
       };
       // @ts-ignore
       if (riskData.id) await client.request(updateItem('compliance_risks', riskData.id, riskPayload));
       // @ts-ignore
       else await client.request(createItem('compliance_risks', { ...riskPayload, company_id: companyId }));
    }

    revalidatePath(`/admin/companies/${companyId}`);
    return { status: "success" };
  } catch (error) {
    console.error("Action error (updateCompanyTierA):", error);
    return { status: "error", message: error.message };
  }
}

export async function addInternalInvestigation(companyId: string, data: any) {
    try {
      const session = await auth();
      if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }
  
      const validated = internalInvestigationSchema.parse(data);
  
      // @ts-ignore
      await client.request(createItem('org_internal_investigations', {
          id: crypto.randomUUID(),
          company_id: companyId,
          investigator: session.user.name || "Admin",
          investigation_date: new Date().toISOString(),
          actual_capacity: data.actual_capacity,
          technical_team_eval: data.technical_team_eval,
          real_key_clients: data.real_key_clients,
          cooperation_willingness: data.cooperation_willingness,
          internal_notes: data.internal_notes,
          structured_tags: data.structured_tags,
          actual_team_size: data.actual_team_size,
          tech_maturity_score: data.tech_maturity_score,
          market_influence_score: data.market_influence_score,
          risk_level: data.risk_level
      }));
  
      revalidatePath(`/admin/companies/${companyId}`);
      return { status: "success" };
    } catch (error) {
      console.error("Action error (addInternalInvestigation):", error);
      return { status: "error", message: error.message };
    }
}
