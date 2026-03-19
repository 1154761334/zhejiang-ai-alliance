import * as z from "zod";

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码").optional(),
  newPassword: z.string().min(8, "密码长度至少为 8 位").max(100),
  confirmPassword: z.string().min(1, "请确认新密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输出的密码不一致",
  path: ["confirmPassword"],
});

export type PasswordChangeData = z.infer<typeof passwordChangeSchema>;
