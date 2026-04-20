import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import { Badge } from "@/components/ui/badge";
import { getMaturityLabel, getStatusInfo } from "@/lib/member-ops";

export const metadata = constructMetadata({
  title: "我的会员状态 – 浙江省AI智能体产业联盟",
  description: "查看您的联盟入库状态与权益等级。",
});

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user || !user.id || user.role !== "USER") {
    redirect("/login");
  }

  // Fetch real company data for this user
  const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let company: any = null;
  try {
    const companies = await client.request(
      readItems("companies", {
        filter: {
          _or: [
            { user_created: { _eq: user.id } },
            { contact_email: { _eq: user.email } },
          ],
        },
        fields: ["id", "company_name", "status", "maturity_level", "role"],
        limit: 1,
      })
    );
    company = companies?.[0] || null;
  } catch (err) {
    console.error("Billing: Failed to fetch company data:", err);
  }

  const statusInfo = company ? getStatusInfo(company.status) : null;

  return (
    <>
      <DashboardHeader
        heading="我的会员状态"
        text="查看您在联盟中的入库状态与权益等级。"
      />
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>入库状态</CardTitle>
            <CardDescription>
              {company
                ? `您的企业「${company.company_name || "未命名"}」当前状态如下：`
                : "您尚未提交企业资料，请先前往控制台完成填报。"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {company ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">审核状态：</span>
                  <Badge className={cn("text-xs", statusInfo?.badgeClass)}>
                    {statusInfo?.label}
                  </Badge>
                </div>
                {company.maturity_level && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-muted-foreground">成熟度评级：</span>
                    <span className="text-sm font-semibold">
                      {getMaturityLabel(company.maturity_level)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-muted-foreground">生态角色：</span>
                  <span className="text-sm">{company.role || "未定义"}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                暂无企业数据。请先前往控制台提交您的企业能力档案。
              </p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col items-center space-y-2 border-t bg-accent py-2 md:flex-row md:justify-between md:space-y-0">
            <p className="text-sm font-medium text-muted-foreground">
              {company ? "如需升级权益等级，请联系秘书处。" : "完成填报后即可申请入库审核。"}
            </p>
            <Link
              href={company ? "/pricing" : "/dashboard"}
              className={cn(buttonVariants())}
            >
              {company ? "查看权益详情" : "前往填报"}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
