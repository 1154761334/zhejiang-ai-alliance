export const BLOG_CATEGORIES: {
  title: string;
  slug: "news" | "education";
  description: string;
}[] = [
    {
      title: "新闻动态",
      slug: "news",
      description: "来自联盟的最新动态与行业资讯。",
    },
    {
      title: "产业洞察",
      slug: "education",
      description: "关于 AI 智能体产业发展的深度分析。",
    },
  ];

export const BLOG_AUTHORS = {
  alliance_admin: {
    name: "联盟秘书处",
    image: "/_static/avatars/alliance.png",
    twitter: "zjai_alliance",
  },
  mickasmt: {
    name: "mickasmt",
    image: "/_static/avatars/mickasmt.png",
    twitter: "miickasmt",
  },
  shadcn: {
    name: "shadcn",
    image: "/_static/avatars/shadcn.jpeg",
    twitter: "shadcn",
  },
};
