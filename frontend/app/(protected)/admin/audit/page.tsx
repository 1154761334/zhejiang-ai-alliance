import { redirect } from "next/navigation";
import { createDirectus, readItems, rest, staticToken } from "@directus/sdk";
import { ShieldCheck } from "lucide-react";

import { getCurrentUser } from "@/lib/session";
import { constructMetadata } from "@/lib/utils";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const metadata = constructMetadata({
  title: "审计日志 – 浙江省AI智能体产业联盟",
  description: "Secretariat audit trail.",
});

const actionLabels: Record<string, string> = {
  SUBMIT_SURVEY: "企业提交档案",
  UPDATE_COMPANY: "更新企业档案",
  ADD_INVESTIGATION: "新增尽调记录",
  EXPORT_COMPANIES: "导出企业数据",
  ACCOUNT_CLAIM: "账号认领",
};

export default async function AuditPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/login");

  const client = createDirectus(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055",
  )
    .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
    .with(rest());

  let logs: any[] = [];
  try {
    logs = await client.request(
      readItems("audit_logs", {
        fields: [
          "id",
          "action",
          "user_id",
          "target_type",
          "target_id",
          "details",
          "ip_address",
          "created_at",
        ],
        sort: ["-created_at"],
        limit: 100,
      }),
    );
  } catch (error) {
    console.error("AuditPage fetch failed:", error);
  }

  return (
    <>
      <DashboardHeader
        heading="审计日志"
        text="查看企业档案、尽调、导出和账号相关的关键操作留痕。"
      />

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-5 text-green-600" />
              最近 100 条关键操作
            </CardTitle>
            <Badge variant="outline">{logs.length} 条</Badge>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>时间</TableHead>
                    <TableHead>操作</TableHead>
                    <TableHead>对象</TableHead>
                    <TableHead>操作者</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>详情</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        暂无审计记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => (
                      <TableRow key={log.id || `${log.action}-${log.created_at}`}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {log.created_at
                            ? new Date(log.created_at).toLocaleString("zh-CN")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {actionLabels[log.action] || log.action || "-"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div>{log.target_type || "-"}</div>
                          <div className="text-muted-foreground">
                            {log.target_id || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{log.user_id || "-"}</TableCell>
                        <TableCell className="text-xs">{log.ip_address || "-"}</TableCell>
                        <TableCell className="max-w-[320px] truncate text-xs text-muted-foreground">
                          {typeof log.details === "string"
                            ? log.details
                            : JSON.stringify(log.details || {})}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
