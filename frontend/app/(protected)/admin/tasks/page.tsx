import Link from "next/link";
import { redirect } from "next/navigation";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { AlertTriangle, ArrowRight, ClipboardCheck, Handshake } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { calculateDataQuality, getTicketStatusInfo } from "@/lib/member-ops";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "秘书处待办中心 – 浙江省AI智能体产业联盟",
  description: "Secretariat task queue for reviews, data quality and matchmaking.",
});

function sortByDateDesc(items: any[]) {
  return [...items].sort((a, b) => {
    const left = new Date(a.date_created || 0).getTime();
    const right = new Date(b.date_created || 0).getTime();
    return right - left;
  });
}

export default async function AdminTasksPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const client = createDirectus(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let companies: any[] = [];
  let needs: any[] = [];

  try {
    companies = await client.request(
      readItems("companies", {
        fields: [
          "id",
          "company_name",
          "status",
          "role",
          "region",
          "credit_code",
          "contact_name",
          "contact_email",
          "company_description",
          "date_created",
          "products.*",
          "case_studies.*",
        ],
        sort: ["-date_created"],
        limit: -1,
      }),
    );

    needs = await client.request(
      readItems("survey_needs", {
        fields: [
          "id",
          "company_id.id",
          "company_id.company_name",
          "ticket_status",
          "assignee",
          "date_created",
        ],
        sort: ["ticket_status", "-date_created"],
        limit: -1,
      }),
    );
  } catch (error) {
    console.error("AdminTasksPage fetch failed:", error);
  }

  const pendingCompanies = sortByDateDesc(
    companies.filter((company) => company.status === "pending_review"),
  ).slice(0, 8);

  const qualityTasks = companies
    .map((company) => ({
      company,
      quality: calculateDataQuality(company),
    }))
    .filter((item) => item.quality.score < 80)
    .sort((a, b) => a.quality.score - b.quality.score)
    .slice(0, 8);

  const openNeeds = needs
    .filter((need) =>
      ["pending", "open", "in_progress", undefined, null].includes(
        need.ticket_status,
      ),
    )
    .slice(0, 8);

  return (
    <>
      <DashboardHeader
        heading="秘书处待办中心"
        text="集中处理审核、资料补全和供需撮合，减少秘书处日常运营漏项。"
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待审核企业</CardTitle>
            <ClipboardCheck className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCompanies.length}</div>
            <p className="text-xs text-muted-foreground">当前列表展示前 8 条</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">资料缺口</CardTitle>
            <AlertTriangle className="size-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qualityTasks.length}</div>
            <p className="text-xs text-muted-foreground">完整度低于 80%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">待跟进需求</CardTitle>
            <Handshake className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openNeeds.length}</div>
            <p className="text-xs text-muted-foreground">含待处理与跟进中工单</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">审核队列</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingCompanies.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无待审核企业。</p>
            ) : (
              pendingCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {company.company_name || "未命名企业"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[company.region, company.role].filter(Boolean).join(" · ") ||
                        "未标注区域/角色"}
                    </p>
                  </div>
                  <Link href={`/admin/companies/${company.id}`}>
                    <Button variant="ghost" size="sm">
                      处理 <ArrowRight className="ml-1 size-3" />
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">资料补全</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {qualityTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无明显资料缺口。</p>
            ) : (
              qualityTasks.map(({ company, quality }) => (
                <div
                  key={company.id}
                  className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {company.company_name || "未命名企业"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      缺失：{quality.missing.slice(0, 3).join("、") || "产品/案例"}
                    </p>
                  </div>
                  <Badge variant="secondary">{quality.score}%</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">撮合跟进</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {openNeeds.length === 0 ? (
              <p className="text-sm text-muted-foreground">暂无待跟进需求。</p>
            ) : (
              openNeeds.map((need) => {
                const statusInfo = getTicketStatusInfo(need.ticket_status);

                return (
                  <div
                    key={need.id}
                    className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {need.company_id?.company_name || "未知企业"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        跟进人：{need.assignee || "待分配"}
                      </p>
                    </div>
                    <Badge className={statusInfo.badgeClass}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                );
              })
            )}
            {openNeeds.length > 0 && (
              <Link href="/admin/matchmaking">
                <Button variant="outline" className="w-full">
                  进入撮合工单
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
