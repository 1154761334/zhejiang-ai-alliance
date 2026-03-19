"use client";

import * as React from "react";
import { createDirectus, rest, updateItem, readItems } from "@directus/sdk";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/shared/icons";

interface NeedsItem {
    id: string;
    company_id: {
        id: string;
        company_name: string;
    };
    financing_need: string[];
    compute_pain_points: string[];
    tech_need: string[];
    ticket_status: string;
    assignee: string | null;
    tags: string[] | null;
}

export function MatchmakingBoard() {
    const [data, setData] = React.useState<NeedsItem[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchNeeds = async () => {
        try {
            setLoading(true);
            const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055").with(rest());

            const response = await client.request(readItems('survey_needs', {
                fields: ['id', 'company_id.id', 'company_id.company_name', 'financing_need', 'compute_pain_points', 'tech_need', 'ticket_status', 'assignee', 'tags'],
            }));

            setData(response as unknown as NeedsItem[]);
        } catch (error) {
            console.error("Failed to fetch matchmaking needs", error);
            toast.error("获取数据失败");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNeeds();
    }, []);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055").with(rest());
            await client.request(updateItem('survey_needs', id, { ticket_status: newStatus }));
            toast.success("状态已更新");
            fetchNeeds();
        } catch (error) {
            console.error("Failed to update status", error);
            toast.error("更新失败");
        }
    };

    const updateAssignee = async (id: string, newAssignee: string) => {
        try {
            const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055").with(rest());
            await client.request(updateItem('survey_needs', id, { assignee: newAssignee }));
            toast.success("跟进人已更新");
            fetchNeeds();
        } catch (error) {
            console.error("Failed to update assignee", error);
            toast.error("更新失败");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Icons.spinner className="animate-spin h-8 w-8 text-slate-400" />
            </div>
        );
    }

    return (
        <div className="rounded-md border bg-white mt-4">
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
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                                暂无需求记录
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">
                                    {item.company_id?.company_name || '未知企业'}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 max-w-[300px]">
                                        {item.financing_need && item.financing_need.length > 0 && (
                                            <div className="text-sm"><span className="font-semibold text-slate-500">融资:</span> {Array.isArray(item.financing_need) ? item.financing_need.join(', ') : item.financing_need}</div>
                                        )}
                                        {item.compute_pain_points && item.compute_pain_points.length > 0 && (
                                            <div className="text-sm"><span className="font-semibold text-slate-500">算力:</span> {Array.isArray(item.compute_pain_points) ? item.compute_pain_points.join(', ') : item.compute_pain_points}</div>
                                        )}
                                        {item.tech_need && item.tech_need.length > 0 && (
                                            <div className="text-sm"><span className="font-semibold text-slate-500">技术:</span> {Array.isArray(item.tech_need) ? item.tech_need.join(', ') : item.tech_need}</div>
                                        )}
                                        {(!item.financing_need?.length && !item.compute_pain_points?.length && !item.tech_need?.length) && (
                                            <span className="text-slate-400 italic">无明确痛点</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
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
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                                <TableCell>
                                    <Input
                                        defaultValue={item.assignee || ''}
                                        placeholder="输入姓名回车"
                                        className="w-[120px] h-9"
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
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
