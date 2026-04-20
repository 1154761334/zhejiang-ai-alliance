import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { CapabilityForm } from "@/components/dashboard/capability-form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Eye, Handshake, MessagesSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { calculateDataQuality, getStatusInfo } from "@/lib/member-ops";

export const metadata = constructMetadata({
  title: "控制台 – 浙江省AI智能体产业联盟",
  description: "Create and manage content.",
});

import { env } from "@/env.mjs";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  let initialData: any = null;

  try {
    const client = createDirectus(env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
      .with(staticToken(env.DIRECTUS_STATIC_TOKEN || "static_ebdfd517a183459c82972b87d2d5ec3f"))
      .with(rest());

    const res = await client.request(readItems('companies', {
      filter: {
        _or: [
          { user_created: { _eq: user.id } },
          { contact_email: { _eq: user.email } }
        ]
      },
      fields: ['*', 'products.*', 'case_studies.*', 'survey_needs.*', 'compliance_risks.*'],
      limit: 1
    })) as any[];
    initialData = res?.[0] || null;
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
  }

  const isPendingReview = initialData?.status === 'pending_review' || initialData?.status === 'published';
  const statusInfo = getStatusInfo(initialData?.status);
  const dataQuality = calculateDataQuality(initialData);

  return (
    <>
      <DashboardHeader
        heading="会员专属工作台"
        text={
          isPendingReview
            ? "您的资料已提交，目前处于锁定状态。正在等待秘书处审核或已正式收录。"
            : initialData?.status === 'rejected' 
              ? "您的资料已被退回，请根据下方的建议进行修润后重新提交。"
              : "欢迎加入浙江省 AI 智能体产业发展联盟。请完成以下表格以协助我们摸底全省智能体企业家底。"
        }
      />
      
      {initialData?.status === 'rejected' && initialData?.rejection_reason && (
        <div className="mx-1 mb-6">
          <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 animate-in fade-in slide-in-from-top-2">
            <div className="mt-0.5 rounded-full bg-red-100 p-1.5">
              <svg className="size-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          <div>
              <h4 className="mb-1 text-sm font-bold text-red-900">退回建议自查室：</h4>
              <p className="text-xs font-medium leading-relaxed text-red-700">
                {initialData.rejection_reason}
              </p>
            </div>
          </div>
        </div>
      )}

      {initialData && (
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">入库状态</p>
                <p className="mt-1 text-sm font-medium">{statusInfo.description}</p>
              </div>
              <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-xs text-muted-foreground">档案完整度</p>
                <p className="mt-1 text-2xl font-bold">{dataQuality.score}%</p>
              </div>
              <Link href="/dashboard/preview">
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 size-4" /> 名片预览
                </Button>
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center justify-end gap-2 p-4">
              <Link href="/dashboard/messages">
                <Button variant="outline" size="sm">
                  <MessagesSquare className="mr-1 size-4" /> 消息中心
                </Button>
              </Link>
              <Link href="/dashboard/needs">
                <Button variant="outline" size="sm">
                  <Handshake className="mr-1 size-4" /> 我的需求
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8 pb-10">
        <CapabilityForm initialData={initialData} isLocked={isPendingReview} />
      </div>
    </>
  );
}
