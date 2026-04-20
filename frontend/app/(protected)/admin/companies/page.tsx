import { redirect } from "next/navigation";
// Instead of fetch, let's use a function that can be shared
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Mail,
  Users,
} from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BatchImportModal } from "@/components/admin/batch-import-modal";
import { ExportExcelButton } from "@/components/admin/export-csv-button";
import { ManualEntryModal } from "@/components/admin/manual-entry-modal";
import {
  CompanyMasterRecord,
  MasterTable,
} from "@/components/admin/master-table";
import { DashboardHeader } from "@/components/dashboard/header";

export const metadata = constructMetadata({
  title: "企业全量大表 – 浙江省AI智能体产业联盟",
  description:
    "Comprehensive enterprise data management and insight dashboard.",
});

async function getDashboardData() {
  const client = createDirectus(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let companies: any[] = [];

  try {
    companies = await client.request(
      readItems("companies", {
        fields: [
          "id",
          "company_name",
          "credit_code",
          "region",
          "company_type",
          "tracks",
          "role",
          "status",
          "contact_email",
          "contact_name",
          "company_description",
          "core_business",
          "expected_resources",
        ],
        limit: -1,
      }),
    );
  } catch (err) {
    console.error("Companies fetch failed:", err);
  }

  const masterData: CompanyMasterRecord[] = companies.map((c) => ({
    ...c,
    id: c.id,
    company_name: c.company_name || "Unknown",
    credit_code: c.credit_code || "-",
    region: c.region || "-",
    company_type: c.company_type || "-",
    tracks: c.tracks || [],
    role: c.role || "-",
    status: c.status || "draft",
    contact_email: c.contact_email || "-",
    contact_name: c.contact_name || "-",
    data_quality_issues: [
      !c.contact_name ? "缺联系人" : "",
      !c.contact_email ? "缺邮箱" : "",
      !c.credit_code ? "缺机构代码" : "",
      !(c.core_business || c.company_description) ? "缺能力摘要" : "",
    ].filter(Boolean),
  }));

  const missingEmail = companies.filter((c) => !c.contact_email).length;
  const missingContact = companies.filter((c) => !c.contact_name).length;
  const missingCredit = companies.filter((c) => !c.credit_code).length;
  const withCapabilities = companies.filter(
    (c) => !!(c.core_business || c.company_description),
  ).length;

  return {
    masterData,
    stats: {
      total: companies.length,
      published: companies.filter((c) => c.status === "published").length,
      missingEmail,
      missingContact,
      missingCredit,
      withCapabilities,
    },
  };
}

export default async function CompaniesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const { masterData, stats } = await getDashboardData();

  return (
    <>
      <DashboardHeader
        heading="企业全量数据大表"
        text="视角：秘书处全景洞察。包含入库状态、公开名录信息和待补资料提示。"
      >
        <div className="flex gap-2">
          <ExportExcelButton />
          <BatchImportModal />
          <ManualEntryModal />
        </div>
      </DashboardHeader>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">在册企业总数</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              正式入库: {stats.published}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">公开能力摘要</CardTitle>
            <FileText className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.withCapabilities} 家
            </div>
            <p className="text-xs text-muted-foreground">已有公开能力摘要</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待补联系方式</CardTitle>
            <Mail className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.missingEmail} 家</div>
            <p className="text-xs text-muted-foreground">
              缺联系人: {stats.missingContact} 家
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              待核验机构代码
            </CardTitle>
            {stats.missingCredit > 0 ? (
              <AlertTriangle className="size-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="size-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.missingCredit} 家</div>
            <p className="text-xs text-muted-foreground">
              用于工商核验和后续认领
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <MasterTable data={masterData} />
      </div>
    </>
  );
}
