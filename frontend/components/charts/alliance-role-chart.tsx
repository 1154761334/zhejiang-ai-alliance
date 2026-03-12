"use client";

import { Pie, PieChart, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function AllianceRoleChart({ data }: { data: { name: string; count: number }[] }) {
    const chartConfig = {
        count: { label: "企业数" }
    } satisfies ChartConfig;

    return (
        <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
                <CardTitle>生态角色分布</CardTitle>
                <CardDescription>联盟成员在产业链中的位置</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0 mt-4 h-[300px]">
                <ChartContainer config={chartConfig} className="mx-auto w-full h-[250px]">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="name"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
