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
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, UserCog, Ban, CheckCircle, Shield } from "lucide-react";

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
import { toast } from "sonner";
import { updateUserAccount } from "@/actions/user-actions";
import { EditUserSheet } from "./edit-user-sheet";
import { UserRecord } from "@/types/user";

export const columns: ColumnDef<UserRecord>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          用户邮箱
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("email")}</div>,
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
                {companyId && <span className="text-[10px] text-muted-foreground font-mono uppercase">ID: {String(companyId).substring(0, 8)}</span>}
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
        
        return <Badge variant={variant} className="flex items-center gap-1 w-fit">
            <Shield className="h-3 w-3" />
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
        case "invited": return <Badge variant="outline" className="text-blue-600 border-blue-600">待认领</Badge>;
        case "suspended": return <Badge variant="destructive">已封禁</Badge>;
        case "inactive": return <Badge variant="secondary">未激活</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
      }
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>管理操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => meta?.onEdit(user)}>
              <UserCog className="mr-2 h-4 w-4" /> 编辑用户信息
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === 'active' ? (
                <DropdownMenuItem className="text-destructive" onClick={() => handleStatusToggle('suspended')}>
                    <Ban className="mr-2 h-4 w-4" /> 封禁账号
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem className="text-green-600" onClick={() => handleStatusToggle('active')}>
                    <CheckCircle className="mr-2 h-4 w-4" /> 恢复正常
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UserTable({ data }: { data: UserRecord[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  
  const [editingUser, setEditingUser] = React.useState<UserRecord | null>(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
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
    },
  });

  return (
    <div className="w-full">
      <EditUserSheet 
        user={editingUser} 
        open={editOpen} 
        onOpenChange={setEditOpen} 
      />
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="搜索邮箱或企业名称..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              列显示 <ChevronDown className="ml-2 h-4 w-4" />
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
