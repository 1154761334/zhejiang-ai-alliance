import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  CheckCircle2,
  Clock,
  FileText,
  Users,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export const metadata = constructMetadata({
  title: "秘书处工作大厅 – 浙江省AI智能体产业联盟",
  description: "Secretariat operational cockpit for membership and matchmaking management.",
});

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  // 1. Fetch Key Metrics
  let metrics = {
    pending: 0,
    published: 0,
    total: 0,
    needs: 0
  };

  try {
    const companies = await client.request(readItems('companies', { fields: ['status'] }));
    metrics.total = companies.length;
    metrics.pending = companies.filter(c => c.status === 'pending_review').length;
    metrics.published = companies.filter(c => c.status === 'published').length;

    const needs = await client.request(readItems('survey_needs', { fields: ['id'] }));
    metrics.needs = needs.length;
  } catch (err) {
    console.error("Dashboard metrics fetch failed:", err);
  }

  // 2. Fetch Recent Submissions
  let recentSubmissions: any[] = [];
  try {
    recentSubmissions = await client.request(readItems('companies', {
      fields: ['id', 'company_name', 'status', 'date_created', 'role'],
      sort: ['-date_created'],
      limit: 5
    }));
  } catch (err) {
    console.error("Recent submissions fetch failed:", err);
  }

  // 3. Fetch Data for Charts
  let chartData: any[] = [];
  try {
    chartData = await client.request(readItems('companies', {
      fields: ['region', 'role'],
      limit: -1
    }));
  } catch (err) {
    console.error("Chart data fetch failed:", err);
  }

  return (
    <>
      <DashboardHeader
        heading="秘书处运营驾驶舱"
        text="欢迎回来！这是联盟数字化管理中心，您可以快速处理入库申请并跟进企业需求。"
      />

      <div className="flex flex-col gap-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">待预审档案</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.pending}</div>
              <p className="text-xs text-muted-foreground">需尽快完成材料质检</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">正式入库企业</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.published}</div>
              <p className="text-xs text-muted-foreground">已纳入联盟生态名录</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃需求单</CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.needs}</div>
              <p className="text-xs text-muted-foreground">涉及算力/投融资/技术撮合</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">联盟总规模</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">覆盖全省 AI 智能体产业链</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <DashboardCharts companies={chartData} />

        {/* Action Queue */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>最新提交申请</CardTitle>
              <CardDescription>
                最近 5 家发起入库申请或更新档案的企业。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((company) => (
                    <div key={company.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{company.company_name || '未命名企业'}</p>
                        <p className="text-xs text-muted-foreground">{company.role || '未定赛道'}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {company.status === 'pending_review' ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">待审批</Badge>
                        ) : (
                          <Badge variant="outline">{company.status}</Badge>
                        )}
                        <Link href={`/admin/companies/${company.id}`} className="text-xs text-blue-600 hover:underline flex items-center">
                          去处理 <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">暂无新申请</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>秘书处快捷工具</CardTitle>
              <CardDescription>常用操作一键直达。</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Link href="/admin/companies">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" /> 进入企业材料审批台
                </Button>
              </Link>
              <Link href="/dashboard/charts">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" /> 查看全联盟数据概览
                </Button>
              </Link>
              <Link href="/admin/matchmaking">
                <Button variant="outline" className="w-full justify-start text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100">
                  <FileText className="mr-2 h-4 w-4" /> 供需撮合工作台
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
