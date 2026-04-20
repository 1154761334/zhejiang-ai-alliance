"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import {
  AlertTriangle,
  ArrowUpDown,
  ChevronDown,
  Edit,
  ExternalLink,
  Mail,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface CompanyMasterRecord {
  id: string;
  company_name: string;
  credit_code: string;
  region: string;
  company_type?: string;
  tracks?: string[];
  role: string;
  status: string;
  source?: string;
  policy_intent?: string[];
  contact_email?: string;
  contact_name?: string;
  data_quality_issues?: string[];
}

export const columns: ColumnDef<CompanyMasterRecord>[] = [
  {
    accessorKey: "company_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          企业全称
          <ArrowUpDown className="ml-2 size-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="px-4 font-medium">{row.getValue("company_name")}</div>
    ),
  },
  {
    accessorKey: "region",
    header: "所在区域",
  },
  {
    accessorKey: "role",
    header: "生态角色",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return role ? <Badge variant="outline">{role}</Badge> : "-";
    },
  },
  {
    accessorKey: "data_quality_issues",
    header: "资料完整度",
    cell: ({ row }) => {
      const issues = row.getValue("data_quality_issues") as string[];
      if (!issues || issues.length === 0)
        return (
          <Badge variant="outline" className="text-emerald-700">
            完整
          </Badge>
        );
      return (
        <div className="flex flex-wrap gap-1">
          {issues.map((issue) => (
            <Badge
              key={issue}
              variant="secondary"
              className="bg-amber-50 py-0 text-[10px] text-amber-800"
            >
              <AlertTriangle className="mr-1 size-3" />
              {issue}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "档案状态",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      switch (status) {
        case "published":
          return <Badge className="bg-green-600">正式入库</Badge>;
        case "pending_review":
          return (
            <Badge
              variant="secondary"
              className="bg-yellow-100 text-yellow-800"
            >
              待审批
            </Badge>
          );
        case "draft":
          return <Badge variant="outline">草稿</Badge>;
        case "rejected":
          return (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              退回补正
            </Badge>
          );
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    accessorKey: "contact_email",
    header: "联系邮箱",
    cell: ({ row }) => {
      const email = row.getValue("contact_email") as string;
      return (
        <span className="text-xs text-muted-foreground">
          {email && email !== "-" ? email : "待补"}
        </span>
      );
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const company = row.original;

      const handleInvite = async () => {
        try {
          const res = await fetch("/api/admin/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: company.contact_email,
              companyName: company.company_name,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            toast.success("邀请链接已生成并复制");
            navigator.clipboard.writeText(data.claimLink);
          } else {
            toast.error(data.error);
          }
        } catch (err) {
          toast.error("网络错误");
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
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                (window.location.href = `/admin/companies/${company.id}`)
              }
            >
              <Edit className="mr-2 size-4" /> 编辑/审核
            </DropdownMenuItem>
            {company.contact_email && company.contact_email !== "-" && (
              <DropdownMenuItem onClick={handleInvite}>
                <Mail className="mr-2 size-4" /> 发送/重发邀约
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() =>
                window.open(
                  `https://www.qcc.com/websearch/110?key=${company.company_name}`,
                )
              }
            >
              <ExternalLink className="mr-2 size-4" /> 企查查(工商校验)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function MasterTable({ data }: { data: CompanyMasterRecord[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

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
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const regionOptions = React.useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.region).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "zh-CN"),
      ),
    [data],
  );
  const roleOptions = React.useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.role).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b, "zh-CN"),
      ),
    [data],
  );

  return (
    <div className="w-full">
      <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center">
        <Input
          placeholder="搜索企业全称..."
          value={
            (table.getColumn("company_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("company_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("status")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("status")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="档案状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending_review">待审批</SelectItem>
            <SelectItem value="published">正式入库</SelectItem>
            <SelectItem value="rejected">退回补正</SelectItem>
            <SelectItem value="draft">草稿</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            (table.getColumn("region")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("region")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full lg:w-[150px]">
            <SelectValue placeholder="所在区域" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部区域</SelectItem>
            {regionOptions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={(table.getColumn("role")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) =>
            table
              .getColumn("role")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="生态角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            {roleOptions.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
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
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
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
                            header.getContext(),
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
                        cell.getContext(),
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
        <div className="flex-1 text-sm text-muted-foreground">
          已选择 {table.getFilteredSelectedRowModel().rows.length} 条，共{" "}
          {table.getFilteredRowModel().rows.length} 条匹配记录。
        </div>
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
