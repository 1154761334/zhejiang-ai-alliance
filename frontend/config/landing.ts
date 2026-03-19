import { FeatureLdg, InfoLdg, TestimonialType } from "types";

export const infos: InfoLdg[] = [
  {
    title: "政产学研金用 · 协同创新平台",
    description:
      "联盟由浙江省经信厅指导，汇聚阿里云、西湖大学、科大讯飞等200余家行业领军单位，旨在打造全球领先的 AI 智能体产业生态。",
    image: "/_static/illustrations/hero1.jpg",
    list: [
      {
        title: "战略协同",
        description: "统一产业发展共识，促进产业链上下游紧密合作。",
        icon: "laptop",
      },
      {
        title: "场景赋能",
        description: "聚焦“415X”先进制造业集群，推动智能体在实体经济的深度应用。",
        icon: "settings",
      },
      {
        title: "生态共建",
        description:
          "链接政府政策、科研院校与产业资本，构建繁荣的智能体创新生态。",
        icon: "search",
      },
    ],
  },
  {
    title: "万亿级产业目标 · 浙江方案",
    description:
      "助力浙江省打造全球人工智能创新发展高地。力争2027年全省人工智能核心产业营收破 1 万亿元，2030年达 1.2 万亿元。",
    image: "/_static/illustrations/hero2.jpg",
    list: [
      {
        title: "技术攻关",
        description:
          "推动智能体关键核心技术突破，抢占产业技术制高点。",
        icon: "laptop",
      },
      {
        title: "伦理安全",
        description: "关注智能体发展中的伦理与安全，确保技术健康可持续发展。",
        icon: "search",
      },
      {
        title: "标杆打造",
        description:
          "与杭州市场景创新中心战略合作，共建全国 AI 智能体产业创新样板。",
        icon: "settings",
      },
    ],
  },
];

export const features: FeatureLdg[] = [
  {
    title: "技术攻关",
    description:
      "依托西湖大学与领军企业，攻克 Agent 核心算法与框架难题。",
    link: "/",
    icon: "laptop",
  },
  {
    title: "场景赋能",
    description:
      "深入制造、医疗、金融等行业，打造“智能体+”标杆应用场景。",
    link: "/",
    icon: "settings",
  },
  {
    title: "生态构建",
    description:
      "举办开发者大会与创新大赛，培育活跃的 AI 开发者社区。",
    link: "/",
    icon: "user",
  },
  {
    title: "标准制定",
    description:
      "参与制定智能体分级、评测与安全伦理标准，引领行业规范。",
    link: "/",
    icon: "copy",
  },
  {
    title: "产融结合",
    description:
      "联动产业基金与创投机构，为优质智能体项目注入金融活水。",
    link: "/",
    icon: "nextjs",
  },
  {
    title: "人才培育",
    description:
      "实施“AI+X”人才培养计划，建设高水平智能体人才队伍。",
    link: "/",
    icon: "google",
  },
];

export const testimonials: TestimonialType[] = [
  {
    name: "阿里云",
    job: "联盟副理事长单位",
    image: "https://img.alicdn.com/tfs/TB1Ly5oS3HqK1RjSZFgXXa7JXXa-72-72.png", // Placeholder or generic logo
    review:
      "作为发起单位之一，阿里云将开放通义千问大模型能力，全面支持浙江省智能体产业创新与生态繁荣。",
  },
  {
    name: "科大讯飞",
    job: "联盟成员单位",
    image: "https://www.iflytek.com/favicon.ico", // Placeholder
    review:
      "我们将依托星火认知大模型，赋能浙江开发者，共同探索通用人工智能在各个垂直领域的落地应用。",
  },
  {
    name: "钉钉",
    job: "联盟成员单位",
    image: "https://img.alicdn.com/imgextra/i3/O1CN01X3qL9S1s5v5x5s5x5_!!6000000005720-2-tps-72-72.png", // Placeholder
    review:
      "钉钉致力于通过 AI Agent 重塑协同办公与业务流程，这是我们加入联盟的初衷，也是未来的发力方向。",
  },
  {
    name: "中控技术",
    job: "工业智能合作伙伴",
    image: "https://www.supcon.com/favicon.ico", // Placeholder
    review:
      "在流程工业领域，智能体拥有巨大的潜力。我们期待在联盟平台下，与更多伙伴共创工业 AI 新未来。",
  },
];
