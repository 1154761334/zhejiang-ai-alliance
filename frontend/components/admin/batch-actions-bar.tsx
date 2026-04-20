"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, Settings, X, CheckCircle, Ban } from "lucide-react";
import { toast } from "sonner";

interface BatchActionsBarProps {
  selectedCount: number;
  onBatchUpdateRole: (roleId: string | null) => Promise<void>;
  onBatchUpdateStatus: (status: string) => Promise<void>;
  onBatchExport: () => Promise<void>;
  onClearSelection: () => void;
  roles: Array<{ id: string; name: string }>;
}

export function BatchActionsBar({
  selectedCount,
  onBatchUpdateRole,
  onBatchUpdateStatus,
  onBatchExport,
  onClearSelection,
  roles,
}: BatchActionsBarProps) {
  const [loading, setLoading] = useState(false);

  if (selectedCount === 0) return null;

  const handleRoleChange = async (roleId: string) => {
    setLoading(true);
    try {
      await onBatchUpdateRole(roleId === "clear" ? null : roleId);
      toast.success(`已成功更新 ${selectedCount} 个用户的角色`);
    } catch (error: any) {
      toast.error("更新失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    setLoading(true);
    try {
      await onBatchUpdateStatus(status);
      const statusText = status === "active" ? "恢复正常" : status === "suspended" ? "封禁" : "更新";
      toast.success(`已成功${statusText} ${selectedCount} 个用户`);
    } catch (error: any) {
      toast.error("操作失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      await onBatchExport();
      toast.success("导出成功");
    } catch (error: any) {
      toast.error("导出失败: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
        已选中 {selectedCount} 个用户
      </span>

      {/* 批量修改角色 */}
      <Select onValueChange={handleRoleChange} disabled={loading}>
        <SelectTrigger className="h-9 w-[180px] bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1">
            <Settings className="size-4" />
            <span>修改角色</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="clear">清空角色</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name === "ADMIN" ? "管理员" : role.name === "Member" ? "成员" : role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 批量修改状态 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" disabled={loading} className="h-9">
            修改状态
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleStatusChange("active")} className="text-green-600">
            <CheckCircle className="mr-2 size-4" />
            恢复正常
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange("suspended")} className="text-red-600">
            <Ban className="mr-2 size-4" />
            封禁账号
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 批量导出 */}
      <Button variant="secondary" size="sm" onClick={handleExport} disabled={loading} className="h-9">
        <Download className="mr-2 size-4" />
        导出选中
      </Button>

      {/* 取消选择 */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        disabled={loading}
        className="ml-auto h-9 text-muted-foreground hover:text-foreground"
      >
        <X className="mr-1 size-4" />
        取消选择
      </Button>
    </div>
  );
}
