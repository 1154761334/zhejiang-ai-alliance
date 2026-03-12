import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "浙江省 AI 智能体产业发展联盟",
  description:
    "由浙江省经信厅指导，联合阿里云、西湖大学等200余家单位发起，致力于构建'政产学研金用'协同创新生态，加速AI智能体产业化落地。",
  url: site_url,
  ogImage: `${site_url}/_static/og.jpg`,
  links: {
    twitter: "#",
    github: "#",
  },
  mailSupport: "contact@zj-ai-alliance.org",
};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "关于联盟",
    items: [
      { title: "联盟介绍", href: "/docs" },
      { title: "章程与协议", href: "/terms" },
      { title: "隐私政策", href: "/privacy" },
    ],
  },
  {
    title: "产品与服务",
    items: [
      { title: "算力网络", href: "/services#compute" },
      { title: "模型精调", href: "/services#fine-tuning" },
      { title: "标杆案例", href: "/services#cases" },
    ],
  },
  {
    title: "联盟指导",
    items: [
      { title: "入会指南", href: "/docs/membership" },
    ],
  },
];
