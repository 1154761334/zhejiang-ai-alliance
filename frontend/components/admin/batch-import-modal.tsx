"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ExcelJS from "exceljs";
import { SHEET_NAMES } from "@/lib/excel-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Upload, AlertCircle, FileSpreadsheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getExcelTemplate } from "@/actions/export-actions";
import { Icons } from "@/components/shared/icons";

export function BatchImportModal() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const result = await getExcelTemplate();
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
        link.download = result.filename || "template.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("模板下载成功，请按格式填报。");
      } else {
        toast.error("下载模板失败: " + result.message);
      }
    } catch (err) {
      toast.error("网络异常，请稍后重试");
    } finally {
      setDownloadingTemplate(false);
    }
  };
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("请先选择文件");
      return;
    }

    setUploading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      const mainSheet = workbook.getWorksheet(SHEET_NAMES.MAIN);
      const prodSheet = workbook.getWorksheet(SHEET_NAMES.PRODUCTS);
      const caseSheet = workbook.getWorksheet(SHEET_NAMES.CASES);

      if (!mainSheet) {
        throw new Error(`未找到 "${SHEET_NAMES.MAIN}" 工作表`);
      }

      // Helper to extract rows
      const getRows = (sheet: ExcelJS.Worksheet | undefined) => {
        if (!sheet) return [];
        const rows: any[] = [];
        const headers: string[] = [];
        sheet.getRow(1).eachCell((cell, colNumber) => {
          headers[colNumber] = cell.text;
        });

        sheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const rowData: any = {};
          row.eachCell((cell, colNumber) => {
            rowData[headers[colNumber]] = cell.text;
          });
          rows.push(rowData);
        });
        return rows;
      };

      const companiesRaw = getRows(mainSheet);
      const productsRaw = getRows(prodSheet);
      const casesRaw = getRows(caseSheet);

      // Chunking logic (20 companies per chunk)
      const chunkSize = 20;
      for (let i = 0; i < companiesRaw.length; i += chunkSize) {
        const chunkCompanies = companiesRaw.slice(i, i + chunkSize);
        const chunkCreditCodes = chunkCompanies.map(c => c["统一社会信用代码"]);
        
        const chunkProducts = productsRaw.filter(p => chunkCreditCodes.includes(p["所属企业信用代码"]));
        const chunkCases = casesRaw.filter(c => chunkCreditCodes.includes(c["所属企业信用代码"]));

        const response = await fetch("/api/admin/import/chunk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companies: chunkCompanies,
            products: chunkProducts,
            cases: chunkCases,
            index: i / chunkSize,
            total: Math.ceil(companiesRaw.length / chunkSize)
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Chunk ${i/chunkSize + 1} failed`);
        }
      }

      toast.success("批量导入成功！数据已同步。");
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error("导入失败: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Icons.add className="mr-2 h-4 w-4" />
          批量导入
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:w-[425px]">
        <DialogHeader>
          <DialogTitle>批量导入企业档案</DialogTitle>
          <DialogDescription>
            请上传符合模板格式的 Excel 文件 (.xlsx 或 .xls)。系统将自动创建待认领账号。
          </DialogDescription>
        </DialogHeader>
          <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
            <div className="flex gap-3">
              <Download className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">下载标准模板 (1表3Sheet)</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">包含主表、产品池、案例库关系映射，支持下拉选择。</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-white" 
              onClick={handleDownloadTemplate}
              disabled={downloadingTemplate}
            >
              {downloadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : "立即下载"}
            </Button>
          </div>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="file">Excel 文件</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            提示：表头应包含“企业全称”、“信用代码”、“联系人”、“联系邮箱”、“细分赛道”。
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={uploading}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || !file}>
            {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "开始导入"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
