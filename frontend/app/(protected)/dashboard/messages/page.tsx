import { redirect } from "next/navigation";
import type React from "react";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { Bell, CheckCircle2, Clock, TriangleAlert } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { buildMemberMessages, getStatusInfo } from "@/lib/member-ops";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "消息中心 – 浙江省AI智能体产业联盟",
  description: "Membership notifications and operating reminders.",
});

export default async function MessagesPage() {
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
        fields: [
          "id",
          "company_name",
          "status",
          "rejection_reason",
          "company_description",
          "credit_code",
          "contact_name",
          "contact_email",
          "role",
          "region",
          "products.*",
          "case_studies.*",
        ],
        limit: 1,
      }),
    );
    company = companies?.[0] || null;

    if (company?.id) {
      needs = await client.request(
        readItems("survey_needs", {
          filter: { company_id: { _eq: company.id } },
          fields: ["id", "ticket_status"],
          limit: -1,
        }),
      );
    }
  } catch (error) {
    console.error("MessagesPage fetch failed:", error);
  }

  const messages = buildMemberMessages(company, needs);
  const statusInfo = getStatusInfo(company?.status);

  const iconMap: Record<string, React.ReactNode> = {
    success: <CheckCircle2 className="size-5 text-green-600" />,
    warning: <TriangleAlert className="size-5 text-amber-600" />,
    info: <Clock className="size-5 text-blue-600" />,
  };

  return (
    <>
      <DashboardHeader
        heading="消息中心"
        text="集中查看入库状态、退回补正、需求跟进和资料完整度提醒。"
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="size-5" />
              当前状态
            </CardTitle>
            <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {company
              ? `企业：${company.company_name || "未命名企业"}`
              : "尚未找到绑定的企业档案。"}
          </CardContent>
        </Card>

        {messages.map((message) => (
          <Card key={`${message.title}-${message.description}`}>
            <CardContent className="flex gap-3 p-4">
              <div className="mt-0.5">{iconMap[message.tone] || iconMap.info}</div>
              <div>
                <h3 className="font-medium">{message.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {message.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
