"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { getAllCompaniesForExport } from "@/actions/export-actions";
import { toast } from "sonner";

export function ExportExcelButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await getAllCompaniesForExport();
      if (result.status === "success" && result.data) {
        const byteCharacters = atob(result.data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.filename || "export.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success("导出成功！" + (result.masked ? "已自动对敏感字段脱敏。" : ""));
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
      导出全量全景数据 (Excel)
    </Button>
  );
}
