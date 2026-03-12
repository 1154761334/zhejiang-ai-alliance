"use server";

import { auth } from "@/auth";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";

const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
  .with(rest());

export async function getAllCompaniesForExport() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    // Fetch all companies with all related data (A, B, C tiers)
    // @ts-ignore
    const companies = await client.request(readItems('companies', {
      fields: [
        '*',
        'products.*',
        'case_studies.*',
        'survey_needs.*',
        'compliance_risks.*',
        'org_verified_data.*',
        'org_internal_investigations.*'
      ],
      limit: -1
    }));

    return { status: "success", data: companies };
  } catch (error) {
    console.error("Action error (getAllCompaniesForExport):", error);
    return { status: "error", message: error.message };
  }
}
