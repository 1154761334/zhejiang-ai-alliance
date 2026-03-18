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

export function ProductsStep() {
    const { control } = useFormContext<SurveyFormValues>();
    const { fields, append, remove } = useFieldArray({
        name: "products",
        control: control,
    });

    return (
        <div className="space-y-6">
            <div className="mb-4">
                <h3 className="text-lg font-medium">产品与能力池配置</h3>
                <p className="text-sm text-slate-500">请添加贵公司的核心产品、系统或解决方案，可添加多个。</p>
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
                            disabled={fields.length === 1}
                        >
                            删除该项
                        </Button>
                    </div>

                    <h4 className="mb-4 font-semibold">产品/能力项 #{index + 1}</h4>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <FormField
                            control={control}
                            name={`products.${index}.name`}
                            render={({ field }) => (
                                <FormItem><FormLabel>产品/能力名称 <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="输入名称" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.form_factor`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>产品形态 <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="software">软件平台</SelectItem>
                                            <SelectItem value="app">行业应用</SelectItem>
                                            <SelectItem value="agent">智能体</SelectItem>
                                            <SelectItem value="hardware">硬件终端</SelectItem>
                                            <SelectItem value="all_in_one">一体机</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.maturity_stage`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>成熟度阶段 <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Demo">Demo演示级</SelectItem>
                                            <SelectItem value="Trial">试运行 / 小规模</SelectItem>
                                            <SelectItem value="Commercial">规模化商用</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.description`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>核心能力描述 (200字内) <span className="text-red-500">*</span></FormLabel><FormControl><Textarea placeholder="描述产品主要解决什么核心问题" className="h-20" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.tech_stack`}
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"><FormLabel>关键技术栈</FormLabel><FormControl><Input placeholder="大模型类型（自研或合作）" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.model_preference`}
                            render={() => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>模型选型与应用偏好 (多选)</FormLabel>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                                        {[
                                            "依赖商用闭源API", 
                                            "开源或国产模型本地化部署", 
                                            "混合模式"
                                        ].map((opt) => (
                                            <FormField
                                                key={opt}
                                                control={control}
                                                name={`products.${index}.model_preference`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(opt)}
                                                                onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), opt]) : field.onChange((field.value || []).filter((v) => v !== opt))}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{opt}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.agent_capabilities`}
                            render={() => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>智能体相关能力 (多选)</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                        {["编排", "规划", "工具调用", "多智能体协同"].map((opt) => (
                                            <FormField
                                                key={opt}
                                                control={control}
                                                name={`products.${index}.agent_capabilities`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(opt)}
                                                                onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), opt]) : field.onChange((field.value || []).filter((v) => v !== opt))}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{opt}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.data_capabilities`}
                            render={() => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>数据能力 (多选)</FormLabel>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                        {["采集", "标注", "治理", "数据集建设"].map((opt) => (
                                            <FormField
                                                key={opt}
                                                control={control}
                                                name={`products.${index}.data_capabilities`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={field.value?.includes(opt)}
                                                                onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), opt]) : field.onChange((field.value || []).filter((v) => v !== opt))}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">{opt}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.delivery_cycle_months`}
                            render={({ field }) => (
                                <FormItem><FormLabel>交付周期典型值 (月)</FormLabel><FormControl><Input type="number" placeholder="数字" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.pricing_model`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>定价方式</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="subscription">订阅制</SelectItem>
                                            <SelectItem value="project">项目制</SelectItem>
                                            <SelectItem value="usage">按量计费</SelectItem>
                                            <SelectItem value="other">其他</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.pilot_mode`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>可提供的试点方式</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="free_poc">免费 PoC</SelectItem>
                                            <SelectItem value="paid_poc">付费 PoC</SelectItem>
                                            <SelectItem value="pilot">小规模试点</SelectItem>
                                            <SelectItem value="production">直接落地</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name={`products.${index}.prerequisites`}
                            render={({ field }) => (
                                <FormItem><FormLabel>交付所需客户侧条件</FormLabel><FormControl><Input placeholder="数据/网络/权限/设备等" {...field} /></FormControl><FormMessage /></FormItem>
                            )}
                        />
                    </div>
                </div>
            ))}

            <Button
                type="button"
                variant="outline"
                className="w-full border-2 border-dashed bg-transparent hover:bg-slate-50"
                onClick={() => append({ name: "", form_factor: "", maturity_stage: "", description: "" })}
            >
                + 增加一项产品 / 能力
            </Button>
        </div>
    );
}
