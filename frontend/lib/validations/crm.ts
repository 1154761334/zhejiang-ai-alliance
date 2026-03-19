import * as z from "zod";

export const companyTierASchema = z.object({
  company_name: z.string().min(2, "公司名称至少 2 个字符").max(100),
  credit_code: z.string().min(18, "信用代码应为 18 位").max(18),
  region: z.string().min(1, "请选择区域"),
  employee_count: z.coerce.number().min(0, "人数不能为负数").max(1000000),
  rnd_count: z.coerce.number().min(0, "研发人数不能为负数"),
  revenue_range: z.string().optional(),
  contact_phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  contact_email: z.string().email("请输入有效的邮箱"),
  status: z.enum(["draft", "pending_review", "published", "rejected"]),
});

export const internalInvestigationSchema = z.object({
  actual_team_size: z.coerce.number().min(0, "实际人数不能为负数").max(1000000),
  tech_maturity_score: z.coerce.number().min(1).max(5),
  market_influence_score: z.coerce.number().min(1).max(5),
  risk_level: z.enum(["Low", "Medium", "High"]),
  cooperation_willingness: z.enum(["A", "B", "C", "D"]),
  actual_capacity: z.string().max(1000, "内容过长").optional(),
  internal_notes: z.string().max(2000, "备注过长").optional(),
});
