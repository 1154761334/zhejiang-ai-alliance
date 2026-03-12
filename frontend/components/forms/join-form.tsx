"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { submitApplication, type ApplicationFormData } from "@/actions/submit-application";

const formSchema = z.object({
    company_name: z.string().min(2, "公司名称至少2个字符"),
    contact_person: z.string().min(2, "联系人姓名至少2个字符"),
    phone: z.string().min(8, "请输入有效的电话号码"),
});

export function JoinForm() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            company_name: "",
            contact_person: "",
            phone: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const response = await submitApplication(values);

            if (response.success) {
                toast.success("申请提交成功！我们将尽快与您联系。");
                form.reset();
            } else {
                toast.error(response.error || "提交失败，请重试。");
            }
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="company_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>公司名称</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入您的企业全称" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="contact_person"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>联系人姓名</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入联系人姓名" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>联系电话</FormLabel>
                            <FormControl>
                                <Input placeholder="请输入手机或座机号码" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending ? "正在提交..." : "立即提交申请"}
                </Button>
            </form>
        </Form>
    );
}
