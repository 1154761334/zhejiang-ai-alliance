export interface EvaluationResult {
  healthScore: number;
  discrepancies: {
    field: string;
    description: string;
    severity: "low" | "medium" | "high";
  }[];
  recommendation: string;
}

export function evaluateCompanyData(company: any): EvaluationResult {
  const discrepancies: EvaluationResult["discrepancies"] = [];
  let score = 100;

  const investigation = company.org_internal_investigations?.[0];
  
  if (!investigation) {
    return {
      healthScore: 0,
      discrepancies: [{ field: "audit", description: "尚未进行实地尽调核验", severity: "high" }],
      recommendation: "核对缺失：请尽快安排秘书处人员进行实地走访。"
    };
  }

  // 1. Compare Team Size
  if (company.employee_count && investigation.actual_team_size) {
    const ratio = investigation.actual_team_size / company.employee_count;
    if (ratio < 0.5) {
      discrepancies.push({
        field: "employee_count",
        description: `规模水分较大：自报 ${company.employee_count} 人，核实仅 ${investigation.actual_team_size} 人`,
        severity: "high"
      });
      score -= 30;
    } else if (ratio < 0.8) {
      discrepancies.push({
        field: "employee_count",
        description: "规模略有浮夸",
        severity: "medium"
      });
      score -= 10;
    }
  }

  // 2. Evaluate Tech Maturity
  if (investigation.tech_maturity_score < 3) {
    discrepancies.push({
        field: "tech_maturity",
        description: "技术成熟度较低，自研能力存疑",
        severity: "medium"
    });
    score -= 15;
  }

  // 3. Cooperation Willingness Penalty
  if (investigation.cooperation_willingness === "C") {
    score -= 20;
    discrepancies.push({
        field: "willingness",
        description: "合作意向度较低，仅为入库挂名",
        severity: "low"
    });
  } else if (investigation.cooperation_willingness === "D") {
    score = 0;
    discrepancies.push({
        field: "willingness",
        description: "建议列入黑名单",
        severity: "high"
    });
  }

  // 4. Compliance Check
  const compliance = company.compliance_risks?.[0];
  if (compliance && compliance.processes_pii && !compliance.has_mlps_certification) {
    discrepancies.push({
        field: "security",
        description: "合规风险：处理敏感数据但无等保认证",
        severity: "high"
    });
    score -= 20;
  }

  let recommendation = "数据基本一致，建议正式入库。";
  if (score < 50) recommendation = "风险较高，建议暂缓入库，补强尽调或约谈。";
  else if (score < 80) recommendation = "存在一定瑕疵，建议补充证明材料后入库。";

  return {
    healthScore: Math.max(0, score),
    discrepancies,
    recommendation
  };
}
