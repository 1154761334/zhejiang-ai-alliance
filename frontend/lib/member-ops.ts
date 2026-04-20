export const companyStatusMap: Record<
  string,
  { label: string; description: string; badgeClass: string }
> = {
  draft: {
    label: "草稿",
    description: "资料尚未提交，企业可继续完善能力档案。",
    badgeClass: "bg-gray-100 text-gray-800",
  },
  pending_review: {
    label: "审核中",
    description: "秘书处正在核验资料、评估入库条件和后续服务需求。",
    badgeClass: "bg-yellow-100 text-yellow-800",
  },
  published: {
    label: "已入库",
    description: "企业已纳入联盟成员库，公开名片可用于生态展示。",
    badgeClass: "bg-green-100 text-green-800",
  },
  rejected: {
    label: "退回补正",
    description: "资料需按秘书处意见修改后重新提交。",
    badgeClass: "bg-red-100 text-red-800",
  },
  archived: {
    label: "已归档",
    description: "该档案已归档，不参与当前入库流程。",
    badgeClass: "bg-slate-100 text-slate-800",
  },
};

export const ticketStatusMap: Record<
  string,
  { label: string; badgeClass: string; description: string }
> = {
  pending: {
    label: "待处理",
    badgeClass: "bg-yellow-100 text-yellow-800",
    description: "秘书处尚未开始处理该需求。",
  },
  open: {
    label: "待处理",
    badgeClass: "bg-yellow-100 text-yellow-800",
    description: "秘书处尚未开始处理该需求。",
  },
  in_progress: {
    label: "跟进中",
    badgeClass: "bg-blue-100 text-blue-800",
    description: "秘书处已分配跟进人，正在推进资源对接。",
  },
  resolved: {
    label: "已解决",
    badgeClass: "bg-green-100 text-green-800",
    description: "需求已完成处理或已有明确对接结果。",
  },
  closed: {
    label: "已关闭",
    badgeClass: "bg-slate-100 text-slate-800",
    description: "需求暂不继续推进。",
  },
};

export function getStatusInfo(status?: string | null) {
  if (!status) return companyStatusMap.draft;
  return companyStatusMap[status] || {
    label: status,
    description: "当前状态待秘书处确认。",
    badgeClass: "bg-gray-100 text-gray-800",
  };
}

export function getTicketStatusInfo(status?: string | null) {
  if (!status) return ticketStatusMap.pending;
  return ticketStatusMap[status] || {
    label: status,
    description: "当前需求状态待秘书处确认。",
    badgeClass: "bg-gray-100 text-gray-800",
  };
}

export function getMaturityLabel(level?: string | null) {
  const levelMap: Record<string, string> = {
    A: "A级 · 标杆企业",
    B: "B级 · 成长企业",
    C: "C级 · 孵化企业",
  };
  return level ? levelMap[level] || level : "待评定";
}

export function calculateDataQuality(company: any) {
  const checks = [
    { key: "company_name", label: "企业名称" },
    { key: "credit_code", label: "统一社会信用代码" },
    { key: "contact_name", label: "联系人" },
    { key: "contact_email", label: "联系邮箱" },
    { key: "company_description", label: "企业简介" },
    { key: "role", label: "生态角色" },
    { key: "region", label: "所在区域" },
  ];

  const missing = checks
    .filter(({ key }) => {
      const value = company?.[key];
      return Array.isArray(value) ? value.length === 0 : !value;
    })
    .map(({ label }) => label);

  const hasProducts = Array.isArray(company?.products) && company.products.length > 0;
  const hasCases =
    Array.isArray(company?.case_studies) && company.case_studies.length > 0;
  const total = checks.length + 2;
  const completed = checks.length - missing.length + (hasProducts ? 1 : 0) + (hasCases ? 1 : 0);

  return {
    score: Math.round((completed / total) * 100),
    missing,
    hasProducts,
    hasCases,
  };
}

export function flattenNeedLabels(need: any) {
  const groups = [
    { label: "融资", values: need?.financing_need },
    { label: "算力", values: need?.compute_pain_points },
    { label: "市场", values: need?.market_need || need?.market_needs },
    { label: "技术", values: need?.tech_need || need?.tech_needs },
    { label: "政策", values: need?.policy_intent },
  ];

  return groups
    .map((group) => ({
      label: group.label,
      values: Array.isArray(group.values)
        ? group.values.filter(Boolean)
        : group.values
          ? [group.values]
          : [],
    }))
    .filter((group) => group.values.length > 0);
}

type MemberMessage = {
  title: string;
  description: string;
  tone: "success" | "warning" | "info";
};

export function buildMemberMessages(company: any, needs: any[] = []) {
  const messages: MemberMessage[] = [];
  const statusInfo = getStatusInfo(company?.status);

  if (!company) {
    messages.push({
      title: "请先完成企业能力档案",
      description: "提交后秘书处才能审核入库资格并安排后续资源对接。",
      tone: "warning",
    });
    return messages;
  }

  messages.push({
    title: `当前入库状态：${statusInfo.label}`,
    description: statusInfo.description,
    tone: company.status === "published" ? "success" : "info",
  });

  if (company.status === "rejected" && company.rejection_reason) {
    messages.push({
      title: "资料被退回，请按意见补正",
      description: company.rejection_reason,
      tone: "warning",
    });
  }

  const openNeeds = needs.filter((need) =>
    ["pending", "open", "in_progress", undefined, null].includes(
      need?.ticket_status,
    ),
  );
  if (openNeeds.length > 0) {
    messages.push({
      title: `有 ${openNeeds.length} 条生态需求正在跟进`,
      description: "可在“我的需求”中查看融资、算力、市场或技术对接进展。",
      tone: "info",
    });
  }

  const quality = calculateDataQuality(company);
  if (quality.score < 80) {
    messages.push({
      title: `档案完整度 ${quality.score}%`,
      description: `建议补充：${quality.missing.concat(quality.hasProducts ? [] : ["产品能力"]).join("、")}`,
      tone: "warning",
    });
  }

  return messages;
}
