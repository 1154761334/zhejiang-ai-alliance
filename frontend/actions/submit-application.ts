"use server";

import { directus } from "@/lib/directus";
import { createItem } from "@directus/sdk";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const applicationSchema = z.object({
    company_name: z.string().min(2, "公司名称至少2个字符"),
    contact_person: z.string().min(2, "联系人姓名至少2个字符"),
    phone: z.string().min(8, "请输入有效的电话号码"),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export async function submitApplication(data: ApplicationFormData) {
    try {
        const validatedData = applicationSchema.parse(data);

        await directus.request(
            // @ts-ignore
            createItem('applications' as any, {
                company_name: validatedData.company_name,
                contact_person: validatedData.contact_person,
                phone: validatedData.phone,
                status: 'pending'
            } as any)
        );

        revalidatePath("/join");
        return { success: true };
    } catch (error) {
        console.error("Submission error:", error);
        return { success: false, error: "提交失败，请稍后再试" };
    }
}
