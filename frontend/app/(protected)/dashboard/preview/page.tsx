import { redirect } from "next/navigation";
import Link from "next/link";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { Building2, ExternalLink, PackageCheck } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import {
  calculateDataQuality,
  getMaturityLabel,
  getStatusInfo,
} from "@/lib/member-ops";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "公开名片预览 – 浙江省AI智能体产业联盟",
  description: "Preview public member profile.",
});

export default async function PublicPreviewPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "USER") redirect("/login");

  const client = createDirectus(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
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
        fields: [
          "id",
          "company_name",
          "company_description",
          "core_business",
          "region",
          "role",
          "tracks",
          "website",
          "status",
          "maturity_level",
          "products.*",
          "case_studies.*",
        ],
        limit: 1,
      }),
    );
    company = companies?.[0] || null;
  } catch (error) {
    console.error("PublicPreviewPage fetch failed:", error);
  }

  const statusInfo = getStatusInfo(company?.status);
  const quality = calculateDataQuality(company);
  const products = Array.isArray(company?.products) ? company.products : [];
  const cases = Array.isArray(company?.case_studies) ? company.case_studies : [];

  return (
    <>
      <DashboardHeader
        heading="公开名片预览"
        text="这里展示企业正式入库后可用于联盟名录和生态服务页的公开信息。"
      >
        <Link href="/dashboard">
          <Button variant="outline">返回编辑档案</Button>
        </Link>
      </DashboardHeader>

      {!company ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            尚未找到企业档案。请先完成能力档案填报。
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Building2 className="size-6 text-blue-600" />
                    {company.company_name || "未命名企业"}
                  </CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {[company.region, company.role].filter(Boolean).join(" · ") ||
                      "待补充区域和生态角色"}
                  </p>
                </div>
                <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="mb-2 font-medium">企业简介</h3>
                <p className="text-sm leading-7 text-muted-foreground">
                  {company.company_description ||
                    company.core_business ||
                    "暂未填写企业简介。"}
                </p>
              </section>

              <section>
                <h3 className="mb-2 font-medium">赛道标签</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(company.tracks) && company.tracks.length > 0 ? (
                    company.tracks.map((track: string) => (
                      <Badge key={track} variant="outline">
                        {track}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">待补充</span>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-medium">产品能力</h3>
                <div className="grid gap-3">
                  {products.length > 0 ? (
                    products.map((product: any) => (
                      <div key={product.id || product.name} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 font-medium">
                          <PackageCheck className="size-4 text-green-600" />
                          {product.name || product.product_name || "未命名产品"}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {product.description ||
                            product.product_description ||
                            "暂未填写产品描述。"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      暂未添加产品能力。
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 font-medium">标杆案例</h3>
                <div className="grid gap-3">
                  {cases.length > 0 ? (
                    cases.map((caseStudy: any) => (
                      <div key={caseStudy.id || caseStudy.title} className="rounded-lg border p-3">
                        <div className="font-medium">
                          {caseStudy.title || caseStudy.case_title || "未命名案例"}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {caseStudy.solution || "暂未填写解决方案。"}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      暂未添加公开案例。
                    </p>
                  )}
                </div>
              </section>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">公开准备度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold">{quality.score}%</div>
                <p className="text-sm text-muted-foreground">
                  {quality.score >= 80
                    ? "公开信息基本完整。"
                    : "建议补齐缺失项后再提交秘书处审核。"}
                </p>
                {quality.missing.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {quality.missing.map((item) => (
                      <Badge key={item} variant="secondary">
                        缺{item}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">会员评级</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>成熟度：{getMaturityLabel(company.maturity_level)}</p>
                {company.website && (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    访问官网 <ExternalLink className="size-3" />
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
