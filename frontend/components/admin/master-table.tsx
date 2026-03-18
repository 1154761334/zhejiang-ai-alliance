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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Mail, Edit, ExternalLink } from "lucide-react";

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

export interface CompanyMasterRecord {
  id: string;
  company_name: string;
  credit_code: string;
  region: string;
  role: string;
  status: string;
  source?: string;
  policy_intent?: string[];
  contact_email?: string;
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => <div className="font-medium px-4">{row.getValue("company_name")}</div>,
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
    }
  },
  {
    accessorKey: "policy_intent",
    header: "拟申请特政",
    cell: ({ row }) => {
      const intent = row.getValue("policy_intent") as string[];
      if (!intent || intent.length === 0) return "-";
      return (
        <div className="flex flex-wrap gap-1">
          {intent.map((i, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] py-0">
              {i.includes("算力券") ? "算力券" : i.substring(0, 4)}
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
        case "published": return <Badge className="bg-green-600">正式入库</Badge>;
        case "pending_review": return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">待审批</Badge>;
        case "draft": return <Badge variant="outline">草稿</Badge>;
        default: return <Badge variant="outline">{status}</Badge>;
      }
    },
  },
  {
    accessorKey: "source",
    header: "来源",
    cell: ({ row }) => {
        const source = row.getValue("source") as string;
        return <span className="text-xs text-muted-foreground">{source === 'admin_created' ? '后台代录' : '自主注册'}</span>;
    }
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
            body: JSON.stringify({ email: company.contact_email, companyName: company.company_name }),
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
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>操作</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => window.location.href = `/admin/companies/${company.id}`}>
              <Edit className="mr-2 h-4 w-4" /> 编辑/审核
            </DropdownMenuItem>
            {company.source === 'admin_created' && (
              <DropdownMenuItem onClick={handleInvite}>
                <Mail className="mr-2 h-4 w-4" /> 发送/重发邀约
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.open(`https://www.qcc.com/websearch/110?key=${company.company_name}`)}>
              <ExternalLink className="mr-2 h-4 w-4" /> 企查查(工商校验)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function MasterTable({ data }: { data: CompanyMasterRecord[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
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

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-4">
        <Input
          placeholder="搜索企业全称..."
          value={(table.getColumn("company_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("company_name")?.setFilterValue(event.target.value)
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
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
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
