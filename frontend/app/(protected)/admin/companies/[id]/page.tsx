import { redirect } from "next/navigation";
import {
  createDirectus,
  readItem,
  readItems,
  rest,
  staticToken,
} from "@directus/sdk";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { CompanyCrmView } from "@/components/admin/company-crm-view";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "企业全景档案 – 秘书处业务台",
  description: "Enterprise full-profile CRM view.",
});

interface CompanyPageProps {
  params: {
    id: string;
  };
}

export default async function CompanyCrmPage({ params }: CompanyPageProps) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const client = createDirectus<any>(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  // Fetch Tier A data
  let companyData: any = null;
  try {
    companyData = await client.request(
      readItem("companies", params.id, {
        fields: [
          "*",
          "products.*",
          "case_studies.*",
          "survey_needs.*",
          "compliance_risks.*",
          "org_internal_investigations.*",
        ],
      }),
    );
  } catch (err) {
    console.error("Failed to fetch company (Tier A):", err);
  }

  if (!companyData) {
    return <div>找不到该企业资料</div>;
  }

  // Fetch Tier C data manually because of missing alias
  let investigations: any[] = [];
  try {
    investigations = await client.request(
      readItems("org_internal_investigations", {
        filter: { company_id: { _eq: params.id } },
        sort: ["-investigation_date"],
      }),
    );
  } catch (err) {
    console.error("Failed to fetch investigations (Tier C):", err);
  }

  if (companyData) {
    companyData.org_internal_investigations = investigations;
  }

  // We'll pass the initial tier A data and ID to the client-side component where
  // you might do interactive fetches/updates.

  return (
    <>
      <DashboardHeader
        heading="企业全景档案与尽调台"
        text="支持秘书处快速提取、梳理与提纯企业信息（含涉密资料）"
      />
      <div className="mt-4">
        <CompanyCrmView
          companyId={params.id}
          initialCompanyData={companyData}
        />
      </div>
    </>
  );
}
