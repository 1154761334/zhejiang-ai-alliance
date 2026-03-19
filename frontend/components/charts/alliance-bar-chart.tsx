"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export function AllianceBarChart({ title, desc, data, dataKey, layout = "horizontal" }: { title: string, desc: string, data: { name: string; count: number }[], dataKey: string, layout?: "horizontal" | "vertical" }) {
    const chartConfig = {
        count: { label: "企业数", color: "hsl(var(--chart-1))" }
    } satisfies ChartConfig;

    return (
        <Card className="flex flex-col">
            <CardHeader className="pb-0">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{desc}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-4 mt-6">
                <ChartContainer config={chartConfig} className="w-full h-[300px]">
                    <BarChart accessibilityLayer data={data} layout={layout} margin={{ left: layout === 'vertical' ? 20 : 0 }}>
                        <CartesianGrid vertical={false} />
                        {layout === "horizontal" ? (
                            <>
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                            </>
                        ) : (
                            <>
                                <XAxis type="number" dataKey="count" hide />
                                <YAxis type="category" dataKey="name" tickLine={false} tickMargin={10} axisLine={false} width={80} />
                            </>
                        )}

                        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                        <Bar dataKey="count" fill="var(--color-count)" radius={4} barSize={layout === 'vertical' ? 20 : 40} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
