"use client";

import * as React from "react";
import { toast } from "sonner";
import { updateMatchmakingNeed } from "@/actions/matchmaking-actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { flattenNeedLabels, getTicketStatusInfo } from "@/lib/member-ops";

interface NeedsItem {
    id: string;
    company_id: {
        id: string;
        company_name: string;
        region?: string;
        role?: string;
    };
    financing_need: string[];
    market_need?: string[];
    market_needs?: string[];
    compute_pain_points: string[];
    tech_need: string[];
    tech_needs?: string[];
    policy_intent?: string[];
    tech_complement_desc?: string;
    ticket_status: string;
    assignee: string | null;
    tags: string[] | null;
    date_created?: string;
}

export function MatchmakingBoard({ initialItems }: { initialItems: NeedsItem[] }) {
    const [data, setData] = React.useState<NeedsItem[]>(initialItems || []);
    const [statusFilter, setStatusFilter] = React.useState("all");
    const [typeFilter, setTypeFilter] = React.useState("all");

    const updateStatus = async (id: string, newStatus: string) => {
        const previous = data;
        setData((items) =>
            items.map((item) =>
                item.id === id ? { ...item, ticket_status: newStatus } : item,
            ),
        );
        const result = await updateMatchmakingNeed(id, { ticket_status: newStatus });
        if (result.status === "success") {
            toast.success("状态已更新");
        } else {
            setData(previous);
            toast.error(result.message || "更新失败");
        }
    };

    const updateAssignee = async (id: string, newAssignee: string) => {
        const previous = data;
        setData((items) =>
            items.map((item) =>
                item.id === id ? { ...item, assignee: newAssignee } : item,
            ),
        );
        const result = await updateMatchmakingNeed(id, { assignee: newAssignee });
        if (result.status === "success") {
            toast.success("跟进人已更新");
        } else {
            setData(previous);
            toast.error(result.message || "更新失败");
        }
    };

    const filteredData = React.useMemo(() => {
        return data.filter((item) => {
            if (statusFilter !== "all" && (item.ticket_status || "pending") !== statusFilter) {
                return false;
            }

            if (typeFilter === "all") return true;
            return flattenNeedLabels(item).some((group) => group.label === typeFilter);
        });
    }, [data, statusFilter, typeFilter]);

    const stats = React.useMemo(() => {
        return {
            total: data.length,
            pending: data.filter((item) => ["pending", "open", undefined, null].includes(item.ticket_status)).length,
            inProgress: data.filter((item) => item.ticket_status === "in_progress").length,
            resolved: data.filter((item) => item.ticket_status === "resolved").length,
        };
    }, [data]);

    return (
        <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-xs text-muted-foreground">需求总数</p>
                    <p className="mt-1 text-2xl font-bold">{stats.total}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-xs text-muted-foreground">待处理</p>
                    <p className="mt-1 text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-xs text-muted-foreground">跟进中</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <p className="text-xs text-muted-foreground">已解决</p>
                    <p className="mt-1 text-2xl font-bold text-green-600">{stats.resolved}</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 rounded-lg border bg-white p-3 lg:flex-row lg:items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full lg:w-[160px]">
                        <SelectValue placeholder="处理状态" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部状态</SelectItem>
                        <SelectItem value="pending">待处理</SelectItem>
                        <SelectItem value="in_progress">跟进中</SelectItem>
                        <SelectItem value="resolved">已解决</SelectItem>
                        <SelectItem value="closed">已关闭</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full lg:w-[160px]">
                        <SelectValue placeholder="需求类型" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">全部类型</SelectItem>
                        <SelectItem value="融资">融资</SelectItem>
                        <SelectItem value="算力">算力</SelectItem>
                        <SelectItem value="市场">市场</SelectItem>
                        <SelectItem value="技术">技术</SelectItem>
                        <SelectItem value="政策">政策</SelectItem>
                    </SelectContent>
                </Select>
                <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                        setStatusFilter("all");
                        setTypeFilter("all");
                    }}
                >
                    重置筛选
                </Button>
            </div>

        <div className="mt-4 overflow-x-auto rounded-md border bg-white">
            <Table className="min-w-[900px]">
                <TableHeader>
                    <TableRow>
                        <TableHead>企业名称</TableHead>
                        <TableHead>核心需求</TableHead>
                        <TableHead>处理状态</TableHead>
                        <TableHead>跟进人</TableHead>
                        <TableHead>标签</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                暂无需求记录
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData.map((item) => {
                            const statusInfo = getTicketStatusInfo(item.ticket_status);
                            const needGroups = flattenNeedLabels(item);

                            return (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    <div className="flex flex-col">
                                        <span>{item.company_id?.company_name || '未知企业'}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {[item.company_id?.region, item.company_id?.role].filter(Boolean).join(" · ") || "未标注区域/角色"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex max-w-[300px] flex-col gap-1">
                                        {needGroups.map((group) => (
                                            <div className="text-sm" key={group.label}>
                                                <span className="font-semibold text-slate-500">{group.label}:</span>{" "}
                                                {group.values.join(", ")}
                                            </div>
                                        ))}
                                        {item.tech_complement_desc && (
                                            <div className="text-xs text-muted-foreground">
                                                补充说明: {item.tech_complement_desc}
                                            </div>
                                        )}
                                        {needGroups.length === 0 && !item.tech_complement_desc && (
                                            <span className="italic text-slate-400">无明确痛点</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="mb-2">
                                        <Badge className={statusInfo.badgeClass}>{statusInfo.label}</Badge>
                                    </div>
                                    <Select
                                        defaultValue={item.ticket_status || 'pending'}
                                        onValueChange={(val) => updateStatus(item.id, val)}
                                    >
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">待处理</SelectItem>
                                            <SelectItem value="in_progress">跟进中</SelectItem>
                                            <SelectItem value="resolved">已解决</SelectItem>
                                            <SelectItem value="closed">已关闭</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        defaultValue={item.assignee || ''}
                                        placeholder="输入姓名回车"
                                        className="h-9 w-[120px]"
                                        onBlur={(e) => {
                                            if (e.target.value !== item.assignee) {
                                                updateAssignee(item.id, e.target.value);
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {item.tags && item.tags.length > 0 ? (
                                            item.tags.map((tag, i) => (
                                                <Badge key={i} variant="outline">{tag}</Badge>
                                            ))
                                        ) : (
                                            <span className="text-xs text-slate-400">无标签</span>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )})
                    )}
                </TableBody>
            </Table>
        </div>
        </div>
    );
}
