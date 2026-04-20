import { redirect } from "next/navigation";
import Link from "next/link";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { Handshake, UserRound } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { flattenNeedLabels, getTicketStatusInfo } from "@/lib/member-ops";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "我的需求 – 浙江省AI智能体产业联盟",
  description: "Track matchmaking and service requests.",
});

export default async function NeedsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "USER") redirect("/login");

  const client = createDirectus(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let company: any = null;
  let needs: any[] = [];

  try {
    const companies = await client.request(
      readItems("companies", {
        filter: {
          _or: [
            { user_created: { _eq: user.id } },
            { contact_email: { _eq: user.email } },
          ],
        },
        fields: ["id", "company_name"],
        limit: 1,
      }),
    );
    company = companies?.[0] || null;

    if (company?.id) {
      needs = await client.request(
        readItems("survey_needs", {
          filter: { company_id: { _eq: company.id } },
          fields: [
            "id",
            "financing_need",
            "market_need",
            "market_needs",
            "compute_pain_points",
            "tech_need",
            "tech_needs",
            "policy_intent",
            "tech_complement_desc",
            "ticket_status",
            "assignee",
            "date_created",
          ],
          sort: ["-date_created"],
          limit: -1,
        }),
      );
    }
  } catch (error) {
    console.error("NeedsPage fetch failed:", error);
  }

  return (
    <>
      <DashboardHeader
        heading="我的需求"
        text="查看融资、算力、市场、技术和政策诉求的秘书处跟进状态。"
      >
        <Link href="/dashboard">
          <Button>更新能力档案</Button>
        </Link>
      </DashboardHeader>

      <div className="grid gap-4">
        {!company ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              尚未找到企业档案。请先完成能力档案填报，系统会自动生成需求记录。
            </CardContent>
          </Card>
        ) : needs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              暂无需求记录。可在能力档案的“合规与需求”步骤补充生态诉求。
            </CardContent>
          </Card>
        ) : (
          needs.map((need) => {
            const statusInfo = getTicketStatusInfo(need.ticket_status);
            const groups = flattenNeedLabels(need);

            return (
              <Card key={need.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Handshake className="size-5 text-blue-600" />
                    {company.company_name || "企业需求"}
                  </CardTitle>
                  <Badge className={statusInfo.badgeClass}>
                    {statusInfo.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    {groups.length > 0 ? (
                      groups.map((group) => (
                        <div key={group.label} className="text-sm">
                          <span className="font-medium">{group.label}：</span>
                          <span className="text-muted-foreground">
                            {group.values.join("、")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        暂无明确分类需求。
                      </p>
                    )}
                    {need.tech_complement_desc && (
                      <p className="text-sm text-muted-foreground">
                        补充说明：{need.tech_complement_desc}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-muted-foreground">
                      {statusInfo.description}
                    </span>
                    <span className="flex items-center gap-1 font-medium">
                      <UserRound className="size-4" />
                      跟进人：{need.assignee || "待分配"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </>
  );
}
