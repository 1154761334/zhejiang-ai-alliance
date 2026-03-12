"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { SurveyFormValues } from "./schema";

export function CasesStep() {
    const { control } = useFormContext<SurveyFormValues>();
    const { fields, append, remove } = useFieldArray({
        name: "case_studies",
        control: control,
    });

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium">场景案例库与量化效果</h3>
                <p className="text-sm text-slate-500">请补充贵公司的落地标杆案例，用于联盟案例集汇编（选填）。</p>
            </div>

            {fields.map((item, index) => (
                <div key={item.id} className="relative rounded-lg border bg-slate-50/50 p-6 dark:bg-slate-900/50">
                    <div className="absolute right-4 top-4">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:bg-red-50"
                            onClick={() => remove(index)}
                        >
                            删除该项
                        </Button>
                    </div>

                    <h4 className="mb-4 font-semibold">标杆案例 #{index + 1}</h4>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={control}
                            name={`case_studies.${index}.title`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>案例标题 <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="例如：某市公安局大模型警务助手辅助生成审讯笔录" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.location`}
                            render={({ field }) => (
                                <FormItem><FormLabel>实施地点 (省市) <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="输入省份和城市" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.implementation_date`}
                            render={({ field }) => (
                                <FormItem><FormLabel>交付/上线时间 <span className="text-red-500">*</span></FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.pain_points`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>客户面临的核心痛点 <span className="text-red-500">*</span></FormLabel><FormControl><Textarea className="h-20" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.solution`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>解决方案概述 <span className="text-red-500">*</span></FormLabel><FormControl><Textarea className="h-20" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.is_live`}
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0 p-2">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <FormLabel className="font-normal text-base">目前是否稳定上线运行？</FormLabel>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.evidence_type`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>可供核查的佐证材料类型</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="report">验收报告</SelectItem>
                                            <SelectItem value="bid">中标公告原文/链接</SelectItem>
                                            <SelectItem value="news">公开媒体报道</SelectItem>
                                            <SelectItem value="certificate">客户证明信</SelectItem>
                                            <SelectItem value="none">暂无公开材料</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`case_studies.${index}.quantified_results`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>量化业务效果指标 (例: 降本XX, 准确率提升XX)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-dashed bg-transparent hover:bg-slate-50"
                onClick={() => append({ title: "", location: "", implementation_date: "", pain_points: "", solution: "", is_live: false })}
            >
                + 增加一个场景案例
            </Button>
        </div>
    );
}
