"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  RowSelectionState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, UserCog, Ban, CheckCircle, Shield, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { updateUserAccount, batchUpdateUserRole, batchUpdateUserStatus } from "@/actions/user-actions";
import { exportUsersToExcel } from "@/actions/export-actions";
import { EditUserSheet } from "./edit-user-sheet";
import { FilterControls } from "./filter-controls";
import { BatchActionsBar } from "./batch-actions-bar";
import { UserRecord } from "@/types/user";

export const columns: ColumnDef<UserRecord>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="全选"
        className="mx-4"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="选择行"
        className="mx-4"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          用户邮箱
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("email")}</div>,
  },
  {
    id: "full_name",
    header: "姓名",
    cell: ({ row }) => {
        const first = row.original.first_name || "";
        const last = row.original.last_name || "";
        return <span>{`${first} ${last}`.trim() || "-"}</span>;
    }
  },
  {
    id: "company",
    header: "所属企业/机构",
    cell: ({ row }) => {
        const company = row.original.affiliated_company_id;
        const companyName = typeof company === 'object' ? company?.company_name : null;
        const companyId = typeof company === 'object' ? company?.id : company;

        return (
            <div className="flex flex-col">
                <span className="text-sm font-medium">{companyName || "-"}</span>
                {companyId && <span className="font-mono text-[10px] uppercase text-muted-foreground">ID: {String(companyId).substring(0, 8)}</span>}
            </div>
        );
    }
  },
  {
    accessorKey: "role",
    header: "系统角色",
    cell: ({ row }) => {
        const role = row.original.role;
        const roleName = role?.name || "USER";

        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        if (roleName === 'ADMIN') variant = "destructive";
        if (roleName === 'Member') variant = "default";

        return <Badge variant={variant} className="flex w-fit items-center gap-1">
            <Shield className="size-3" />
            {roleName === 'Member' ? 'MEMBER' : roleName}
        </Badge>;
    }
  },
  {
    accessorKey: "status",
    header: "账号状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      switch (status) {
        case "active": return <Badge className="bg-green-600">正常</Badge>;
        case "invited": return <Badge variant="outline" className="border-blue-600 text-blue-600">待认领</Badge>;
        case "suspended": return <Badge variant="destructive">已封禁</Badge>;
        case "inactive": return <Badge variant="secondary">未激活</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    accessorKey: "last_access",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          最后登录
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const lastAccess = row.getValue("last_access") as string;
      if (!lastAccess) return <span className="text-muted-foreground">-</span>;
      return <span>{new Date(lastAccess).toLocaleString("zh-CN")}</span>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const user = row.original;
      const meta = table.options.meta as any;

      const handleStatusToggle = async (newStatus: string) => {
          const res = await updateUserAccount(user.id, { status: newStatus });
          if (res.status === "success") {
              toast.success("账号状态已更新");
          } else {
              toast.error("操作失败: " + res.message);
          }
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>管理操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.onEdit(user)}>
              <UserCog className="mr-2 size-4" /> 编辑用户信息
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'active' ? (
                <DropdownMenuItem className="text-destructive" onClick={() => handleStatusToggle('suspended')}>
                    <Ban className="mr-2 size-4" /> 封禁账号
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem className="text-green-600" onClick={() => handleStatusToggle('active')}>
                    <CheckCircle className="mr-2 size-4" /> 恢复正常
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserTable({
    data,
    roles,
    companies
  }: {
    data: UserRecord[];
    roles: Array<{ id: string; name: string }>;
    companies: Array<{ id: string; company_name: string }>;
  }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [statusFilter, setStatusFilter] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [companyFilter, setCompanyFilter] = React.useState("");
  const [globalFilter, setGlobalFilter] = React.useState("");

  const [editingUser, setEditingUser] = React.useState<UserRecord | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  // 过滤数据
  const filteredData = React.useMemo(() => {
    return data.filter((user) => {
      // 全局搜索
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        const email = user.email?.toLowerCase() || "";
        const name = `${user.first_name || ""} ${user.last_name || ""}`.toLowerCase();
        const companyName = typeof user.affiliated_company_id === "object"
          ? user.affiliated_company_id?.company_name?.toLowerCase() || ""
          : "";

        if (!email.includes(searchLower) && !name.includes(searchLower) && !companyName.includes(searchLower)) {
          return false;
        }
      }

      // 状态筛选
      if (statusFilter && user.status !== statusFilter) {
        return false;
      }

      // 角色筛选
      if (roleFilter && user.role?.id !== roleFilter) {
        return false;
      }

      // 企业筛选
      if (companyFilter) {
        const userCompanyId = typeof user.affiliated_company_id === "object"
          ? user.affiliated_company_id?.id
          : user.affiliated_company_id;
        if (userCompanyId !== companyFilter) {
          return false;
        }
      }

      return true;
    });
  }, [data, globalFilter, statusFilter, roleFilter, companyFilter]);

  // 获取选中的用户ID
  const selectedUserIds = React.useMemo(() => {
    return Object.keys(rowSelection).filter((id) => rowSelection[id]);
  }, [rowSelection]);

  // 批量修改角色
  const handleBatchUpdateRole = async (roleId: string | null) => {
    if (selectedUserIds.length === 0) return;
    await batchUpdateUserRole(selectedUserIds, roleId);
    setRowSelection({});
  };

  // 批量修改状态
  const handleBatchUpdateStatus = async (status: string) => {
    if (selectedUserIds.length === 0) return;
    await batchUpdateUserStatus(selectedUserIds, status);
    setRowSelection({});
  };

  // 批量导出
  const handleBatchExport = async () => {
    const res = await exportUsersToExcel(selectedUserIds.length > 0 ? selectedUserIds : undefined);
    if (res.status === "success" && res.data && res.filename) {
      const binary = atob(res.data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("导出成功");
    } else {
      toast.error(res.message || "导出失败");
      throw new Error(res.message || "导出失败");
    }
  };

  // 清空筛选
  const handleClearFilters = () => {
    setStatusFilter("");
    setRoleFilter("");
    setCompanyFilter("");
    setGlobalFilter("");
  };

  // 清空选择
  const handleClearSelection = () => {
    setRowSelection({});
  };

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    meta: {
        onEdit: (user: UserRecord) => {
            setEditingUser(user);
            setEditOpen(true);
        }
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <EditUserSheet
        user={editingUser}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* 批量操作栏 */}
      <BatchActionsBar
        selectedCount={selectedUserIds.length}
        onBatchUpdateRole={handleBatchUpdateRole}
        onBatchUpdateStatus={handleBatchUpdateStatus}
        onBatchExport={handleBatchExport}
        onClearSelection={handleClearSelection}
        roles={roles}
      />

      <div className="flex flex-col gap-3 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="搜索邮箱、姓名或企业名称..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
          />

          <FilterControls
            statusFilter={statusFilter}
            roleFilter={roleFilter}
            companyFilter={companyFilter}
            onStatusFilterChange={setStatusFilter}
            onRoleFilterChange={setRoleFilter}
            onCompanyFilterChange={setCompanyFilter}
            onClearFilters={handleClearFilters}
            roles={roles}
            companies={companies}
          />

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBatchExport}
              className="h-9 gap-1"
            >
              <Download className="size-4" />
              导出全部
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9">
                  列显示 <ChevronDown className="ml-2 size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id === "full_name" ? "姓名" : column.id === "company" ? "企业" : column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  暂无数据。
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            下一页
          </Button>
        </div>
      </div>
    </div>
  );
}
