"use client";

import { useFormContext } from "react-hook-form";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { SurveyFormValues } from "./schema";

export function BasicInfoStep() {
    const { control } = useFormContext<SurveyFormValues>();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                    control={control}
                    name="company_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>单位全称 <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="请填写营业执照上的完整名称" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="credit_code"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>统一社会信用代码 <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="18 位代码" maxLength={18} {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="established_date"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>成立时间 <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="date" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="region"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>所在区域 <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="选择所在城市" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    {["杭州市", "宁波市", "温州市", "嘉兴市", "湖州市", "绍兴市", "金华市", "衢州市", "舟山市", "台州市", "丽水市", "省外/其他"].map(city => (
                                        <SelectItem key={city} value={city}>{city}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="address"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>详细办公地址 <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="省市区街道..." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="website"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>官网地址</FormLabel>
                            <FormControl><Input placeholder="http://" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="company_type"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>企业性质 <span className="text-red-500">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="选择性质" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="private">民营</SelectItem>
                                    <SelectItem value="state_owned">国企</SelectItem>
                                    <SelectItem value="institution">事业单位</SelectItem>
                                    <SelectItem value="university">高校院所</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="employee_count"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>员工规模(人) <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="rnd_count"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>研发人数(人) <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="revenue_range"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>最近一年营收(万元)</FormLabel>
                            <FormControl><Input placeholder="选填" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="mt-8 space-y-6">
                <FormField
                    control={control}
                    name="tracks"
                    render={() => (
                        <FormItem>
                            <FormLabel>细分赛道 (多选) <span className="text-red-500">*</span></FormLabel>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {["智能制造", "智慧政务", "金融科技", "医疗健康", "教育科研", "数字安防", "智能家居", "跨境电商", "现代农业", "元宇宙/数字人"].map((item) => (
                                    <FormField
                                        key={item}
                                        control={control}
                                        name="tracks"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(item)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                                ? field.onChange([...(field.value || []), item])
                                                                : field.onChange((field.value || []).filter((v) => v !== item));
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="cursor-pointer font-normal flex-1">{item}</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>企业角色定位 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {["基础模型层", "工具/平台层", "应用解决方案层", "算力设施层"].map((item) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors" key={item}>
                                            <FormControl><RadioGroupItem value={item} /></FormControl>
                                            <FormLabel className="cursor-pointer font-normal flex-1">{item}</FormLabel>
                                        </FormItem>
                                    ))}
                                </RadioGroup>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 border-t pt-6 md:grid-cols-2">
                <FormField control={control} name="contact_name" render={({ field }) => (
                    <FormItem><FormLabel>对接人姓名 <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="姓名" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="contact_position" render={({ field }) => (
                    <FormItem><FormLabel>职务 <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="CEO / 市场总监" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="contact_phone" render={({ field }) => (
                    <FormItem><FormLabel>手机号 <span className="text-red-500">*</span></FormLabel><FormControl><Input placeholder="11位手机号" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="contact_email" render={({ field }) => (
                    <FormItem><FormLabel>常用邮箱 <span className="text-red-500">*</span></FormLabel><FormControl><Input type="email" placeholder="email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={control} name="contact_preference" render={({ field }) => (
                    <FormItem>
                        <FormLabel>首选对接偏好 <span className="text-red-500">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="选择" /></SelectTrigger></FormControl>
                            <SelectContent>
                                <SelectItem value="phone">电话</SelectItem>
                                <SelectItem value="wechat">微信</SelectItem>
                                <SelectItem value="email">邮件</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )} />
            </div>
        </div>
    );
}
