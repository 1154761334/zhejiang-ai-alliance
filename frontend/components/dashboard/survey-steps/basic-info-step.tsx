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
import { DatePicker } from "@/components/ui/date-picker";
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
                        <FormItem className="md:col-span-2">
                            <FormLabel>单位全称 <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="请填写营业执照上的完整名称" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="company_description"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>企业简介 <span className="text-red-500">*</span></FormLabel>
                            <FormControl><Input placeholder="简要描述企业核心业务与定位" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={control}
                    name="awards_honors"
                    render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>曾获荣誉 / 资质</FormLabel>
                            <FormControl><Input placeholder="例如：国家高新技术企业、省专精特新等" {...field} /></FormControl>
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
                        <FormItem className="flex flex-col">
                            <FormLabel className="mb-2">成立时间 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <DatePicker 
                                    value={field.value} 
                                    onChange={field.onChange}
                                    placeholder="请选择成立日期"
                                />
                            </FormControl>
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
                                <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="private">民营企业</SelectItem>
                                    <SelectItem value="state_owned">国有企业</SelectItem>
                                    <SelectItem value="institution">事业单位</SelectItem>
                                    <SelectItem value="academic">高校院所</SelectItem>
                                    <SelectItem value="other">其他</SelectItem>
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
                            <FormLabel>员工规模 (人) <span className="text-red-500">*</span></FormLabel>
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
                            <FormLabel>研发人数 (人) <span className="text-red-500">*</span></FormLabel>
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
                            <FormLabel>最近一年营收区间 (万元)</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="0-500">500万以下</SelectItem>
                                    <SelectItem value="500-2000">500万-2000万</SelectItem>
                                    <SelectItem value="2000-5000">2000万-5000万</SelectItem>
                                    <SelectItem value="5000-10000">5000万-1亿</SelectItem>
                                    <SelectItem value="10000+">1亿以上</SelectItem>
                                </SelectContent>
                            </Select>
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
                        <FormItem className="md:col-span-2">
                            <FormLabel>细分赛道 (可多选) <span className="text-red-500">*</span></FormLabel>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                                {["智能制造", "智慧政务", "智慧康养", "新能源", "金融科技", "智慧物流", "文娱教育", "其他"].map((track) => (
                                    <FormField
                                        key={track}
                                        control={control}
                                        name="tracks"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value?.includes(track)}
                                                        onCheckedChange={(checked) => checked ? field.onChange([...(field.value || []), track]) : field.onChange(field.value?.filter((v) => v !== track))}
                                                    />
                                                </FormControl>
                                                <FormLabel className="font-normal">{track}</FormLabel>
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
                        <FormItem className="md:col-span-2">
                            <FormLabel>企业角色定位 <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {["基础模型层", "工具平台层", "应用解决方案层", "算力设施层"].map((roleItem) => (
                                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-md border p-3 hover:bg-slate-50 transition-colors" key={roleItem}>
                                            <FormControl><RadioGroupItem value={roleItem} /></FormControl>
                                            <FormLabel className="cursor-pointer font-normal flex-1">{roleItem}</FormLabel>
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
                <FormField control={control} name="info_provider_name_position" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                        <FormLabel>信息提供人姓名与职务</FormLabel>
                        <FormControl><Input placeholder="例如：张三 办公室主任" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormItem className="md:col-span-2">
                    <FormLabel>信息更新时间</FormLabel>
                    <FormControl><Input readOnly value={new Date().toISOString().split('T')[0]} className="bg-slate-50" /></FormControl>
                    <p className="text-[10px] text-slate-400 mt-1">系统将自动记录填报日期</p>
                </FormItem>
            </div>
        </div>
    );
}
