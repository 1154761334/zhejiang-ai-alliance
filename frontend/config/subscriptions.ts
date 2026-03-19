import { PlansRow, SubscriptionPlan } from "types";

export const pricingData: SubscriptionPlan[] = [
  {
    title: "观察员",
    description: "适合个人开发者与初创团队",
    benefits: [
      "获取联盟最新资讯",
      "参与公开技术沙龙",
      "访问基础开源模型库",
    ],
    limitations: [
      "无选举表决权",
      "不可参与标准制定",
      "无专属算力补贴",
      "无投融资对接服务",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
  },
  {
    title: "普通成员",
    description: "适合成长型智能体企业",
    benefits: [
      "享有选举权与被选举权",
      "优先参与行业供需对接会",
      "获取算力券补贴资格",
      "专属技术专家支持",
      "产品入驻联盟展示中心",
    ],
    limitations: [
      "不参与核心决策",
      "无理事会席位",
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
  },
  {
    title: "理事单位",
    description: "适合行业领军企业与机构",
    benefits: [
      "拥有一票否决权",
      "牵头制定行业标准",
      "共享联盟生态核心资源",
      "定制化投融资服务",
      "联合举办年度产业峰会",
    ],
    limitations: [],
    prices: {
      monthly: 0,
      yearly: 0,
    },
  },
];

export const plansColumns = [
  "observer",
  "member",
  "council",
] as const;

export const comparePlans: PlansRow[] = [
  {
    feature: "算力补贴",
    observer: false,
    member: "基础额度",
    council: "优先调度",
    tooltip: "所有成员均可申请基础算力支持。",
  },
  {
    feature: "投融资对接",
    observer: null,
    member: "季度路演",
    council: "专属顾问",
    tooltip: "理事单位享有专属财务顾问服务。",
  },
  {
    feature: "标准制定权",
    observer: null,
    member: "建议权",
    council: "起草权/投票权",
  },
  {
    feature: "市场推广",
    observer: null,
    member: "官网展示",
    council: "全渠道推广",
    tooltip:
      "理事单位可联合联盟举办发布会。",
  },
  {
    feature: "人才培养",
    observer: "公开课",
    member: "专项培训",
    council: "联合实验室",
    tooltip: "高级别人才计划优先向理事单位倾斜。",
  },
];
