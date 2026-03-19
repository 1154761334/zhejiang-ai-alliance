import * as z from "zod"

export const userAuthSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入密码"),
})

export const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string()
    .min(8, "密码至少需要 8 个字符")
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "密码需包含大写字母、小写字母、数字和特殊字符"),
})
