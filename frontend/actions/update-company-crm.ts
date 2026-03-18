"use server";

import { auth } from "@/auth";
import { createDirectus, rest, staticToken, updateItem, createItem, deleteItems, readItems } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { companyTierASchema, internalInvestigationSchema } from "@/lib/validations/crm";

interface Schema {
    companies: any[];
    products: any[];
    case_studies: any[];
    survey_needs: any[];
    compliance_risks: any[];
    org_internal_investigations: any[];
    audit_logs: any[];
}

const adminClient = createDirectus<Schema>(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

async function logAuditEvent(action: string, targetType: string, targetId: string, userId: string, details: any) {
  try {
    await adminClient.request(createItem('audit_logs', {
      id: crypto.randomUUID(),
      action,
      target_type: targetType,
      target_id: targetId,
      user_id: userId || 'unknown',
      details: JSON.stringify(details),
      ip_address: 'server',
      created_at: new Date().toISOString()
    }));
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
}

export async function updateCompanyTierA(companyId: string, data: any) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // We use a partial of the survey schema for admin updates to allow flexibility
    // but maintain the same data dimensions.
    // surveyFormSchema.partial().parse(data);

    await adminClient.request(updateItem('companies', companyId, {
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
        company_description: data.company_description,
        awards_honors: data.awards_honors,
        info_provider_name_position: data.info_provider_name_position,
        maturity_level: data.maturity_level,
        industry_tags: data.industry_tags,
        capability_tags: data.capability_tags,
        tech_stack_tags: data.tech_stack_tags,
        core_business: data.core_business,
        expected_resources: data.expected_resources,
        key_clients_claimed: data.key_clients_claimed,
        rejection_reason: data.rejection_reason,
        status: data.status,
        info_updated_at: new Date().toISOString().split('T')[0],
    }));

    // Update Survey Needs (handle both nested and flattened formats)
    await adminClient.request(deleteItems("survey_needs", { filter: { company_id: { _eq: companyId } } }));
    
    // In the new unified form, these are flattened
    const needsPayload = {
        company_id: companyId,
        financing_need: data.financing_need || data.survey_needs?.[0]?.financing_need,
        market_need: data.market_need || data.survey_needs?.[0]?.market_need,
        tech_need: data.tech_need || data.survey_needs?.[0]?.tech_need,
        compute_pain_points: data.compute_pain_points || data.survey_needs?.[0]?.compute_pain_points,
        policy_intent: data.policy_intent || data.survey_needs?.[0]?.policy_intent,
        tech_complement_desc: data.tech_complement_desc || data.survey_needs?.[0]?.tech_complement_desc,
    };
    
    if (Object.values(needsPayload).some(v => Array.isArray(v) ? v.length > 0 : !!v)) {
        await adminClient.request(createItem('survey_needs', needsPayload));
    }

    // Update Compliance Risks
    await adminClient.request(deleteItems("compliance_risks", { filter: { company_id: { _eq: companyId } } }));
    
    const risksPayload = {
        company_id: companyId,
        data_security_measures: data.data_security_measures || data.compliance_risks?.[0]?.data_security_measures,
        has_mlps_certification: data.has_mlps_certification ?? data.compliance_risks?.[0]?.has_mlps_certification,
        processes_pii: data.processes_pii ?? data.compliance_risks?.[0]?.processes_pii,
    };

    if (risksPayload.data_security_measures || risksPayload.has_mlps_certification || risksPayload.processes_pii) {
        await adminClient.request(createItem('compliance_risks', risksPayload));
    }

    // Update Products
    if (data.products) {
        await adminClient.request(deleteItems("products", { filter: { company_id: { _eq: companyId } } }));
        for (const p of data.products) {
            await adminClient.request(createItem("products", { 
              ...p, 
              id: crypto.randomUUID(), 
              company_id: companyId 
            }));
        }
    }

    // Update Case Studies
    if (data.case_studies) {
        await adminClient.request(deleteItems("case_studies", { filter: { company_id: { _eq: companyId } } }));
        for (const c of data.case_studies) {
            await adminClient.request(createItem("case_studies", { 
              ...c, 
              id: crypto.randomUUID(), 
              company_id: companyId, 
              is_live: c.is_live || false 
            }));
        }
    }

    await logAuditEvent('UPDATE_COMPANY', 'companies', companyId, session.user.id || 'unknown', {
      status: data.status,
      rejection_reason: data.rejection_reason
    });

    revalidatePath(`/admin/companies/${companyId}`);
    return { status: "success" };
  } catch (error: any) {
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
  
      internalInvestigationSchema.parse(data);
  
      const investigationId = crypto.randomUUID();
      await adminClient.request(createItem('org_internal_investigations', {
          id: investigationId,
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

      await logAuditEvent('ADD_INVESTIGATION', 'org_internal_investigations', investigationId, session.user.id || 'unknown', {
        company_id: companyId,
        risk_level: data.risk_level
      });
  
      revalidatePath(`/admin/companies/${companyId}`);
      return { status: "success" };
    } catch (error: any) {
      console.error("Action error (addInternalInvestigation):", error);
      return { status: "error", message: error.message };
    }
}