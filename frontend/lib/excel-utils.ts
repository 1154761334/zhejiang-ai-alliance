/**
 * Excel Mapping Utility for Relational Import/Export (3-Sheet Standard)
 */

export const SHEET_NAMES = {
  MAIN: "企业主表",
  PRODUCTS: "核心产品库",
  CASES: "场景案例库"
};

// Dictionaries for mapping Chinese labels (Excel) to internal values (DB)
export const DICTIONARIES = {
  company_type: {
    "民营": "private",
    "国企": "state_owned",
    "事业单位": "institution",
    "高校院所": "university"
  },
  contact_preference: {
    "电话": "phone",
    "微信": "wechat",
    "邮件": "email"
  },
  financing_need: {
    "暂无融资需求": "none",
    "需股权融资(找VC)": "equity",
    "需债权融资/银行贷款": "debt",
    "需政府产业基金扶持": "gov_fund"
  },
  market_need: {
    "大客户对接联络": "clients",
    "政策申报与解读": "policy",
    "品牌声量与媒体曝光": "brand",
    "海外出海咨询": "global"
  },
  compute_pain_points: {
    "缺推理算力资源": "inference",
    "缺大规模训练集群": "training",
    "异构国产算力适配难": "heterogeneous",
    "商业算力成本过高": "cost"
  },
  form_factor: {
    "软件平台": "software",
    "行业应用": "app",
    "智能体": "agent",
    "硬件终端": "hardware",
    "一体机": "all_in_one"
  },
  maturity_stage: {
    "Demo演示级": "Demo",
    "试运行 / 小规模": "Trial",
    "规模化商用": "Commercial"
  },
  pricing_model: {
    "SaaS订阅": "subscription",
    "项目制买断": "project",
    "按量计费 (API等)": "pay_as_you_go"
  },
  evidence_type: {
    "验收报告": "report",
    "中标公告原文/链接": "bid",
    "公开媒体报道": "news",
    "客户证明信": "certificate",
    "暂无公开材料": "none"
  }
};

// Inverse dictionaries for Export (Internal -> Chinese)
export const INVERSE_DICTIONARIES = Object.fromEntries(
  Object.entries(DICTIONARIES).map(([key, dict]) => [
    key,
    Object.fromEntries(Object.entries(dict).map(([k, v]) => [v, k]))
  ])
);

// Column Mappings for each Sheet
export const COLUMN_MAPPINGS = {
  MAIN: [
    { header: "统一社会信用代码", key: "credit_code", required: true },
    { header: "单位全称", key: "company_name", required: true },
    { header: "成立时间", key: "established_date", type: "date" },
    { header: "所在区域", key: "region" },
    { header: "详细办公地址", key: "address" },
    { header: "官网地址", key: "website" },
    { header: "企业性质", key: "company_type", dict: "company_type" },
    { header: "员工规模(人)", key: "employee_count", type: "number" },
    { header: "研发人数(人)", key: "rnd_count", type: "number" },
    { header: "最近一年营收(万元)", key: "revenue_range" },
    { header: "细分赛道", key: "tracks", type: "array" },
    { header: "企业角色定位", key: "role" },
    { header: "对接人姓名", key: "contact_name" },
    { header: "职务", key: "contact_position" },
    { header: "手机号", key: "contact_phone" },
    { header: "常用邮箱", key: "contact_email" },
    { header: "首选对接偏好", key: "contact_preference", dict: "contact_preference" },
    { header: "融资需求", key: "financing_need", dict: "financing_need", type: "array" },
    { header: "市场拓展需求", key: "market_need", dict: "market_need", type: "array" },
    { header: "技术方案需求", key: "tech_need", type: "array" },
    { header: "算力痛点", key: "compute_pain_points", dict: "compute_pain_points", type: "array" },
    { header: "技术互补描述", key: "tech_complement_desc" },
    { header: "近期活动意向", key: "policy_intent", type: "array" },
    { header: "企业数据安全管控措施概述", key: "data_security_measures" },
    { header: "等保认证", key: "has_mlps_certification", type: "boolean" },
    { header: "PII涉密", key: "processes_pii", type: "boolean" }
  ],
  PRODUCTS: [
    { header: "所属企业信用代码", key: "credit_code", required: true },
    { header: "产品/能力名称", key: "name", required: true },
    { header: "产品形态", key: "form_factor", dict: "form_factor" },
    { header: "成熟度阶段", key: "maturity_stage", dict: "maturity_stage" },
    { header: "核心能力描述", key: "description" },
    { header: "模型选型偏好", key: "model_preference", type: "array" },
    { header: "平均交付周期(月)", key: "delivery_cycle_months", type: "number" },
    { header: "定价方式", key: "pricing_model", dict: "pricing_model" }
  ],
  CASES: [
    { header: "所属企业信用代码", key: "credit_code", required: true },
    { header: "案例标题", key: "title", required: true },
    { header: "实施地点", key: "location" },
    { header: "交付/上线时间", key: "implementation_date" },
    { header: "客户面临的核心痛点", key: "pain_points" },
    { header: "解决方案概述", key: "solution" },
    { header: "是否稳定运行", key: "is_live", type: "boolean" },
    { header: "佐证材料类型", key: "evidence_type", dict: "evidence_type" },
    { header: "量化业务效果指标", key: "quantified_results" }
  ]
};

/**
 * Transforms a raw row from Excel to an internal object for DB
 */
export function transformRowToInternal(row: any, mapping: any[]) {
  const result: any = {};
  mapping.forEach(col => {
    let val = row[col.header];
    
    if (val === undefined || val === null || val === "") {
      result[col.key] = col.type === "array" ? [] : (col.type === "boolean" ? false : null);
      return;
    }

    if (col.type === "number") {
      result[col.key] = Number(val);
    } else if (col.type === "boolean") {
      result[col.key] = val === "是" || val === "Yes" || val === true || val === 1;
    } else if (col.type === "array") {
      const items = val.toString().split(/[,，]/).map((s: string) => s.trim()).filter(Boolean);
      if (col.dict) {
        const dict = (DICTIONARIES as any)[col.dict];
        result[col.key] = items.map((i: string) => dict[i] || i);
      } else {
        result[col.key] = items;
      }
    } else if (col.dict) {
      const dict = (DICTIONARIES as any)[col.dict];
      result[col.key] = dict[val] || val;
    } else {
      result[col.key] = val;
    }
  });
  return result;
}

/**
 * Transforms an internal DB object to an Excel row
 */
export function transformInternalToRow(data: any, mapping: any[]) {
  const row: any = {};
  mapping.forEach(col => {
    let val = data[col.key];
    
    if (val === undefined || val === null) {
      row[col.header] = "";
      return;
    }

    if (col.type === "boolean") {
      row[col.header] = val ? "是" : "否";
    } else if (col.type === "array") {
      if (Array.isArray(val)) {
        if (col.dict) {
          const invDict = (INVERSE_DICTIONARIES as any)[col.dict];
          row[col.header] = val.map(v => invDict[v] || v).join(", ");
        } else {
          row[col.header] = val.join(", ");
        }
      } else {
        row[col.header] = "";
      }
    } else if (col.dict) {
      const invDict = (INVERSE_DICTIONARIES as any)[col.dict];
      row[col.header] = invDict[val] || val;
    } else {
      row[col.header] = val;
    }
  });
  return row;
}
