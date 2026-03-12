import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { ExportCsvButton } from "@/components/admin/export-csv-button";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = constructMetadata({
  title: "企业管理台 – 浙江省AI智能体产业联盟",
  description: "Enterprise management and approval portal.",
});

export default async function CompaniesPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let companies: any[] = [];
  try {
    // @ts-ignore
    companies = await client.request(readItems('companies', {
      fields: ['id', 'company_name', 'status', 'region', 'role', 'date_created'],
      sort: ['-date_created'],
      limit: -1
    }));
  } catch (err) {
    console.error("Failed to fetch companies:", err);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline" className="text-gray-500">草稿中</Badge>;
      case 'pending_review': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">待审批/尽调</Badge>;
      case 'published': return <Badge variant="default" className="bg-green-600 hover:bg-green-700">正式入库</Badge>;
      case 'rejected': return <Badge variant="destructive">已退回</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  }

  const renderTable = (filteredCompanies: any[]) => {
    if (filteredCompanies.length === 0) {
      return (
        <div className="p-8 text-center text-slate-500 bg-white border rounded-md">
           当前分类下暂无企业数据。
        </div>
      );
    }
    return (
      <div className="rounded-md border bg-card overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            <TableRow>
              <TableHead>企业名称</TableHead>
              <TableHead>档案状态</TableHead>
              <TableHead>所在区域</TableHead>
              <TableHead>生态角色</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCompanies.map((company) => (
              <TableRow key={company.id}>
                <TableCell className="font-medium text-base">{company.company_name || '未填写公司名称'}</TableCell>
                <TableCell>{getStatusBadge(company.status)}</TableCell>
                <TableCell>{company.region || '-'}</TableCell>
                <TableCell>{company.role || '-'}</TableCell>
                <TableCell className="text-right">
                  <a href={`/admin/companies/${company.id}`} className="text-sm text-blue-600 hover:underline">
                    详情/综合管理
                  </a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <>
      <DashboardHeader
        heading="企业综合管理台"
        text="秘书处专属：审批、清洗、管理全省入驻企业档案库。"
      >
        <ExportCsvButton />
      </DashboardHeader>

      {companies.length === 0 ? (
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="package" />
          <EmptyPlaceholder.Title>暂无企业数据</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            目前还没有任何企业在系统中注册或提交档案。
          </EmptyPlaceholder.Description>
        </EmptyPlaceholder>
      ) : (
        <Tabs defaultValue="pending_review" className="w-full mt-4">
          <TabsList>
            <TabsTrigger value="pending_review">待审批 / 尽调</TabsTrigger>
            <TabsTrigger value="published">正式入库 (全景展现)</TabsTrigger>
            <TabsTrigger value="draft">企业草稿箱</TabsTrigger>
            <TabsTrigger value="all">全量库</TabsTrigger>
          </TabsList>
          <TabsContent value="pending_review" className="mt-4">
            {renderTable(companies.filter(c => c.status === 'pending_review'))}
          </TabsContent>
          <TabsContent value="published" className="mt-4">
            {renderTable(companies.filter(c => c.status === 'published'))}
          </TabsContent>
          <TabsContent value="draft" className="mt-4">
            {renderTable(companies.filter(c => c.status === 'draft'))}
          </TabsContent>
          <TabsContent value="all" className="mt-4">
            {renderTable(companies)}
          </TabsContent>
        </Tabs>
      )}
    </>
  );
}
