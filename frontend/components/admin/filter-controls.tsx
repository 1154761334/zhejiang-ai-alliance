"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterControlsProps {
  statusFilter: string;
  roleFilter: string;
  companyFilter: string;
  onStatusFilterChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onCompanyFilterChange: (value: string) => void;
  onClearFilters: () => void;
  roles: Array<{ id: string; name: string }>;
  companies: Array<{ id: string; company_name: string }>;
}

export function FilterControls({
  statusFilter,
  roleFilter,
  companyFilter,
  onStatusFilterChange,
  onRoleFilterChange,
  onCompanyFilterChange,
  onClearFilters,
  roles,
  companies,
}: FilterControlsProps) {
  // 判断是否有活跃的筛选
  const hasActiveFilters = statusFilter || roleFilter || companyFilter;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 状态筛选 */}
      <Select
        value={statusFilter || "all"}
        onValueChange={(value) => onStatusFilterChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="全部状态" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部状态</SelectItem>
          <SelectItem value="invited">待认领</SelectItem>
          <SelectItem value="active">正常</SelectItem>
          <SelectItem value="suspended">已封禁</SelectItem>
          <SelectItem value="inactive">未激活</SelectItem>
        </SelectContent>
      </Select>

      {/* 角色筛选 */}
      <Select
        value={roleFilter || "all"}
        onValueChange={(value) => onRoleFilterChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="全部角色" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部角色</SelectItem>
          {roles.map((role) => (
            <SelectItem key={role.id} value={role.id}>
              {role.name === "ADMIN" ? "管理员" : role.name === "Member" ? "成员" : role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 企业筛选 */}
      <Select
        value={companyFilter || "all"}
        onValueChange={(value) => onCompanyFilterChange(value === "all" ? "" : value)}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="全部企业" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全部企业</SelectItem>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.company_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 清空筛选按钮 */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="h-9 gap-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
          清空筛选
        </Button>
      )}
    </div>
  );
}
