import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import { AllianceRoleChart } from "@/components/charts/alliance-role-chart";
import { AllianceBarChart } from "@/components/charts/alliance-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = constructMetadata({
  title: "联盟数据概览 – 浙江省AI智能体产业联盟",
  description: "Alliance enterprise data overview and statistics.",
});

export default async function AnalyticsPage() {
  // 1. Fetch data from Directus
  const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  // @ts-ignore
  const companies = await client.request(readItems('companies', {
    fields: ['role', 'tracks', 'region', 'company_type'],
    limit: -1, // Fetch all records
  }));

  // 2. Aggregate Data
  const roleCount: Record<string, number> = {};
  const trackCount: Record<string, number> = {};
  const regionCount: Record<string, number> = {};
  const typeCount: Record<string, number> = {};

  companies.forEach((company) => {
    // Role
    if (company.role) {
      roleCount[company.role] = (roleCount[company.role] || 0) + 1;
    }

    // Region
    if (company.region) {
      regionCount[company.region] = (regionCount[company.region] || 0) + 1;
    }

    // Type
    if (company.company_type) {
      typeCount[company.company_type] = (typeCount[company.company_type] || 0) + 1;
    }

    // Tracks (Multi-select JSON array)
    if (company.tracks && Array.isArray(company.tracks)) {
      company.tracks.forEach((track: string) => {
        trackCount[track] = (trackCount[track] || 0) + 1;
      });
    }
  });

  // 3. Format for Recharts
  const formatData = (obj: Record<string, number>) =>
    Object.entries(obj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

  const roleData = formatData(roleCount);
  const trackData = formatData(trackCount);
  const regionData = formatData(regionCount);
  const typeData = formatData(typeCount);

  // Translate Company Type for display
  const mapType = (t: string) => {
    const map: Record<string, string> = {
      private: "民营",
      state_owned: "国企",
      institution: "事业单位",
      university: "高校院所"
    };
    return map[t] || t;
  };
  const formattedTypeData = typeData.map(d => ({ ...d, name: mapType(d.name) }));

  return (
    <>
      <DashboardHeader
        heading="联盟数据概览"
        text="直观展现浙江省 AI 智能体产业链结构与分布。"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总入库单位</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{companies.length}</div>
            <p className="text-xs text-muted-foreground">已填写能力档案</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">覆盖热门赛道</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trackData.length}</div>
            <p className="text-xs text-muted-foreground">细分落地场景</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">覆盖地市</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{regionData.length}</div>
            <p className="text-xs text-muted-foreground">全省各区域</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AllianceRoleChart data={roleData.length > 0 ? roleData : [{ name: "暂无数据", count: 1 }]} />
        <AllianceRoleChart data={formattedTypeData.length > 0 ? formattedTypeData : [{ name: "暂无数据", count: 1 }]} />
        {/* Reusing pie chart for company type to avoid creating a new one specifically for it */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pb-10">
        <AllianceBarChart
          title="区域产业分布"
          desc="各地区申报入库的企业数量"
          data={regionData}
          dataKey="count"
          layout="vertical"
        />
        <AllianceBarChart
          title="热门应用场景赛道"
          desc="成员单位涉及最多的行业应用分布"
          data={trackData}
          dataKey="count"
          layout="horizontal"
        />
      </div>
    </>
  );
}
