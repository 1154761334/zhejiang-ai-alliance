"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getAllCompaniesForExport } from "@/actions/export-actions";
import { toast } from "sonner";

export function ExportCsvButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllCompaniesForExport();
      if (result.status === "success" && result.data) {
        const companies = result.data;
        
        // Flatten and transform data for CSV
        const headers = [
          "企业名称", "信用代码", "状态", "区域", "类型", "角色", 
          "营收范围", "人数规模", "研发人数", "主要业务", "对接人", 
          "手机", "邮箱", "需求建议", "内部评价", "实地产能", "技术评分", 
          "合规风险", "创建时间"
        ];

        const rows = companies.map((c: any) => [
          c.company_name || "",
          c.credit_code || "",
          c.status || "",
          c.region || "",
          c.company_type || "",
          c.role || "",
          c.revenue_range || "",
          c.employee_count || "",
          c.rnd_count || "",
          (c.core_business || "").replace(/\n/g, " "),
          c.contact_name || "",
          c.contact_phone || "",
          c.contact_email || "",
          (c.expected_resources || "").replace(/\n/g, " "),
          (c.org_internal_investigations?.[0]?.internal_notes || "").replace(/\n/g, " "),
          (c.org_internal_investigations?.[0]?.actual_capacity || "").replace(/\n/g, " "),
          c.org_internal_investigations?.[0]?.tech_maturity_score || "",
          c.compliance_risks?.[0]?.data_security_measures || "",
          c.date_created || ""
        ]);

        const csvContent = [
          "\uFEFF" + headers.join(","), // Add BOM for Excel UTF-8 support
          ...rows.map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
        ].join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `浙江AI联盟企业全景数据_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("导出成功！共计 " + companies.length + " 条数据");
      } else {
        toast.error("导出失败: " + result.message);
      }
    } catch (err) {
      toast.error("网络异常，请稍后重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      导出全量全景数据 (CSV)
    </Button>
  );
}
