"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { SurveyFormValues } from "./schema";
import { Card, CardContent } from "@/components/ui/card";

export function NeedsStep() {
    const { control } = useFormContext<SurveyFormValues>();

    return (
        <div className="space-y-8">

            {/* 需求与赋能 */}
            <div className="space-y-6">
                <h3 className="text-lg font-medium border-b pb-2">核心生态需求与赋能意向</h3>
                <p className="text-sm text-slate-500 mb-6">了解您的痛点，联盟秘书处将优先为您精准匹配资源。</p>

                <FormField
                    control={control}
                    name="financing_need"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base text-black">1. 融资与资金需求 (多选)</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {[
                                    { label: "暂无融资需求", value: "none" },
                                    { label: "需股权融资(找VC)", value: "equity" },
                                    { label: "需债权融资/银行贷款", value: "debt" },
                                    { label: "需政府产业基金扶持", value: "gov_fund" }
                                ].map((item) => (
                                    <FormField
                                        key={item.value}
                                        control={control}
                                        name="financing_need"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                                <FormControl>
                                                    <Checkbox checked={field.value?.includes(item.value)} onCheckedChange={(c) => c ? field.onChange([...(field.value || []), item.value]) : field.onChange((field.value || []).filter((v) => v !== item.value))} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-sm flex-1">{item.label}</FormLabel>
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
                    name="market_need"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base text-black mt-4 block">2. 市场拓展需求 (多选)</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {[
                                    { label: "大客户对接联络", value: "clients" },
                                    { label: "政策申报与解读", value: "policy" },
                                    { label: "品牌声量与媒体曝光", value: "brand" },
                                    { label: "海外出海咨询", value: "global" }
                                ].map((item) => (
                                    <FormField
                                        key={item.value}
                                        control={control}
                                        name="market_need"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                                <FormControl>
                                                    <Checkbox checked={field.value?.includes(item.value)} onCheckedChange={(c) => c ? field.onChange([...(field.value || []), item.value]) : field.onChange((field.value || []).filter((v) => v !== item.value))} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-sm flex-1">{item.label}</FormLabel>
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
                    name="compute_pain_points"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base text-black mt-4 block">3. 当前算力痛点 (多选)</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {[
                                    { label: "缺推理算力资源", value: "inference" },
                                    { label: "缺大规模训练集群", value: "training" },
                                    { label: "异构国产算力适配难", value: "heterogeneous" },
                                    { label: "商业算力成本过高", value: "cost" }
                                ].map((item) => (
                                    <FormField
                                        key={item.value}
                                        control={control}
                                        name="compute_pain_points"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                                <FormControl>
                                                    <Checkbox checked={field.value?.includes(item.value)} onCheckedChange={(c) => c ? field.onChange([...(field.value || []), item.value]) : field.onChange((field.value || []).filter((v) => v !== item.value))} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-sm flex-1">{item.label}</FormLabel>
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
                    name="tech_complement_desc"
                    render={({ field }) => (
                        <FormItem className="mt-4"><FormLabel className="text-base text-black">4. 寻求技术互补的具体描述 (选填)</FormLabel><FormControl><Textarea placeholder="例如：急缺在金融RAG或者音视频多模态上有成熟组件的技术伙伴合作..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="policy_intent"
                    render={() => (
                        <FormItem>
                            <FormLabel className="text-base text-black mt-4 block">5. 近期希望参与的联盟活动意向 (多选)</FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                {["算力券/模型券申报专项指导", "“智能体+”行业投融资对接会", "浙江省智能体标准制定工作组", "走进省内标杆大模型企业大讲堂"].map((item) => (
                                    <FormField
                                        key={item}
                                        control={control}
                                        name="policy_intent"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4 bg-slate-50/50 hover:bg-slate-100 transition-colors">
                                                <FormControl>
                                                    <Checkbox checked={field.value?.includes(item)} onCheckedChange={(c) => c ? field.onChange([...(field.value || []), item]) : field.onChange((field.value || []).filter((v) => v !== item))} />
                                                </FormControl>
                                                <FormLabel className="font-normal cursor-pointer text-sm flex-1">{item}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        </FormItem>
                    )}
                />
            </div>

            {/* 合规与安全 */}
            <div className="space-y-6 pt-8">
                <h3 className="text-lg font-medium border-b pb-2 text-rose-600">合规与安全承诺 (必填项)</h3>

                <FormField
                    control={control}
                    name="data_security_measures"
                    render={({ field }) => (
                        <FormItem><FormLabel>企业数据安全管控措施概述 <span className="text-red-500">*</span></FormLabel><FormControl><Textarea className="h-20" placeholder="请简要说明在物理层、网络层或制度层的保护策略..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}
                />

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-4">
                    <FormField
                        control={control}
                        name="has_mlps_certification"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">等保或密评认证资质</FormLabel>
                                    <p className="text-sm text-muted-foreground">产品或系统是否已通过国家公安部门等级保护（如等保二级、三级）或密码应用安全性评估。</p>
                                </div>
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="processes_pii"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">个人信息处理 (PII) 涉密</FormLabel>
                                    <p className="text-sm text-muted-foreground">日常业务和模型训练中是否涉及采集和处理自然人的敏感个人数据。</p>
                                </div>
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-6 pt-6 border-t">
                    <FormField
                        control={control}
                        name="confidentiality_commitment"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-slate-50">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base font-semibold">涉密与保密承诺</FormLabel>
                                    <p className="text-sm text-muted-foreground text-rose-600 font-medium">承诺所提供案例及数据均已脱敏，或已获得客户授权可用于联盟内部档案。</p>
                                </div>
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="delivery_risks"
                        render={({ field }) => (
                            <FormItem><FormLabel>主要交付风险点 (选填)</FormLabel><FormControl><Textarea className="h-20" placeholder="例如：对特定硬件依赖度高、交付周期受第三方影响等..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name="risk_mitigation"
                        render={({ field }) => (
                            <FormItem><FormLabel>风险缓解措施 (选填)</FormLabel><FormControl><Textarea className="h-20" placeholder="针对上述风险，企业采取的备選或预防方案..." {...field} /></FormControl><FormMessage /></FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    );
}
