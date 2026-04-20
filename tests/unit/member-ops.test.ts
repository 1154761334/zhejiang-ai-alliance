import {
  buildMemberMessages,
  calculateDataQuality,
  flattenNeedLabels,
  getMaturityLabel,
  getStatusInfo,
  getTicketStatusInfo,
} from "../../frontend/lib/member-ops";

describe("member operations helpers", () => {
  it("maps company statuses to user-facing labels", () => {
    expect(getStatusInfo("pending_review").label).toBe("审核中");
    expect(getStatusInfo("published").label).toBe("已入库");
    expect(getStatusInfo("unknown").label).toBe("unknown");
  });

  it("maps ticket statuses to secretary workflow labels", () => {
    expect(getTicketStatusInfo("pending").label).toBe("待处理");
    expect(getTicketStatusInfo("in_progress").label).toBe("跟进中");
    expect(getTicketStatusInfo("closed").label).toBe("已关闭");
  });

  it("uses maturity_level labels consistently", () => {
    expect(getMaturityLabel("A")).toBe("A级 · 标杆企业");
    expect(getMaturityLabel("B")).toBe("B级 · 成长企业");
    expect(getMaturityLabel()).toBe("待评定");
  });

  it("calculates company data quality from public profile fields", () => {
    const quality = calculateDataQuality({
      company_name: "测试企业",
      credit_code: "91330100TEST00001X",
      contact_name: "张三",
      contact_email: "demo@example.com",
      company_description: "智能体产品服务商",
      role: "解决方案商",
      region: "杭州",
      products: [{ id: "p1" }],
      case_studies: [{ id: "c1" }],
    });

    expect(quality.score).toBe(100);
    expect(quality.missing).toEqual([]);
    expect(quality.hasProducts).toBe(true);
    expect(quality.hasCases).toBe(true);
  });

  it("reports missing fields for low quality company records", () => {
    const quality = calculateDataQuality({
      company_name: "资料缺口企业",
      products: [],
      case_studies: [],
    });

    expect(quality.score).toBeLessThan(80);
    expect(quality.missing).toEqual(
      expect.arrayContaining(["统一社会信用代码", "联系人", "联系邮箱"]),
    );
  });

  it("flattens all demand dimensions for matchmaking display", () => {
    const groups = flattenNeedLabels({
      financing_need: ["股权融资"],
      compute_pain_points: ["推理成本高"],
      market_need: ["政企客户"],
      tech_need: ["多智能体编排"],
      policy_intent: ["政策申报"],
    });

    expect(groups.map((group) => group.label)).toEqual([
      "融资",
      "算力",
      "市场",
      "技术",
      "政策",
    ]);
  });

  it("builds member messages for rejected and open-need states", () => {
    const messages = buildMemberMessages(
      {
        status: "rejected",
        rejection_reason: "请补充产品案例",
        company_name: "测试企业",
      },
      [{ ticket_status: "in_progress" }],
    );

    expect(messages.map((message) => message.title)).toEqual(
      expect.arrayContaining([
        "当前入库状态：退回补正",
        "资料被退回，请按意见补正",
        "有 1 条生态需求正在跟进",
      ]),
    );
  });
});
