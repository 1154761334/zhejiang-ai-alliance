import * as z from "zod";

export const surveyFormSchema = z.object({
  // Step 1: Basic Info
  company_name: z.string().min(2, "单位名称至少需要2个字符"),
  company_description: z.string().min(1, "请填写企业简介"),
  awards_honors: z.string().optional(),
  credit_code: z.string().length(18, "请输入18位统一社会信用代码"),
  established_date: z.string().min(1, "请填写成立时间"),
  region: z.string({ required_error: "请选择所在区域" }),
  address: z.string().min(1, "请填写详细办公地址"),
  website: z
    .string()
    .url("请输入有效的网址，包含 http:// 或 https://")
    .or(z.literal("")),
  company_type: z.string({ required_error: "请选择企业性质" }),
  employee_count: z.coerce.number().min(1, "请输入员工规模"),
  rnd_count: z.coerce.number().min(0, "请输入研发人数"),
  revenue_range: z.string().optional(),
  tracks: z.array(z.string()).min(1, "请至少选择一个细分赛道"),
  role: z.string({ required_error: "请选择企业角色定位" }),
  contact_name: z.string().min(2, "对接人姓名必填"),
  contact_position: z.string().min(1, "联系人职务必填"),
  contact_phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  contact_email: z.string().email("请输入正确的邮箱"),
  contact_preference: z.string({ required_error: "请选择对接偏好" }),
  info_provider_name_position: z.string().optional(),

  // Step 2: Products
  products: z
    .array(
      z.object({
        name: z.string().min(1, "产品名称必填"),
        form_factor: z.string({ required_error: "请选择形态" }),
        maturity_stage: z.string({ required_error: "请选择成熟度阶段" }),
        description: z.string().max(200, "描述不能超过200字"),
        advantages: z.string().optional(),
        category: z.string().optional(),
        tech_stack: z.string().optional(),
        model_preference: z.array(z.string()).optional(),
        agent_capabilities: z.array(z.string()).optional(),
        data_capabilities: z.array(z.string()).optional(),
        engineering_capabilities: z.array(z.string()).optional(),
        integration_capabilities: z.array(z.string()).optional(),
        delivery_cycle_months: z.coerce.number().optional(),
        prerequisites: z.string().optional(),
        pricing_model: z.string().optional(),
        pilot_mode: z.string().optional(),
        case_industries: z.array(z.string()).optional(),
      }),
    )
    .min(1, "请至少添加一个产品或能力"),

  // Step 3: Cases
  case_studies: z
    .array(
      z.object({
        title: z.string().min(1, "案例标题必填"),
        location: z.string().min(1, "实施地点必填"),
        implementation_date: z.string().min(1, "实施时间必填"),
        pain_points: z.string().min(1, "客户痛点必填"),
        solution: z.string().min(1, "解决方案必填"),
        data_types: z.array(z.string()).optional(),
        is_live: z.boolean().default(false),
        quantified_results: z.string().optional(),
        evidence_type: z.string().optional(),
        reusability: z.string().optional(),
      }),
    )
    .optional(),

  // Step 4: Needs & Compliance
  financing_need: z.array(z.string()).optional(),
  market_need: z.array(z.string()).optional(),
  tech_need: z.array(z.string()).optional(),
  compute_pain_points: z.array(z.string()).optional(),
  tech_complement_desc: z.string().optional(),
  policy_intent: z.array(z.string()).optional(),

  data_security_measures: z.string().min(1, "请简述数据安全措施"),
  has_mlps_certification: z.boolean().default(false),
  processes_pii: z.boolean().default(false),
  confidentiality_commitment: z.boolean().default(false),

  delivery_risks: z.string().optional(),
  risk_mitigation: z.string().optional(),
  industry_tags: z.array(z.string()).optional(),
  capability_tags: z.array(z.string()).optional(),
  tech_stack_tags: z.array(z.string()).optional(),
  maturity_level: z.string().optional(),
});

export type SurveyFormValues = z.infer<typeof surveyFormSchema>;
