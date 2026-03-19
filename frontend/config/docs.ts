import { DocsConfig } from "types";

export const docsConfig: DocsConfig = {
  mainNav: [
    {
      title: "开发文档",
      href: "/docs",
    },
    {
      title: "操作指南",
      href: "/guides",
    },
  ],
  sidebarNav: [
    {
      title: "入门指南",
      items: [
        {
          title: "简介",
          href: "/docs",
        },
        {
          title: "安装",
          href: "/docs/installation",
        },
      ],
    },
    {
      title: "配置与集成",
      items: [
        {
          title: "身份认证",
          href: "/docs/configuration/authentification",
        },
        {
          title: "博客系统",
          href: "/docs/configuration/blog",
        },
        {
          title: "UI 组件",
          href: "/docs/configuration/components",
        },
        {
          title: "配置文件",
          href: "/docs/configuration/config-files",
        },
        {
          title: "数据库",
          href: "/docs/configuration/database",
        },
        {
          title: "邮件服务",
          href: "/docs/configuration/email",
        },
        {
          title: "布局系统",
          href: "/docs/configuration/layouts",
        },
        {
          title: "Markdown",
          href: "/docs/configuration/markdown-files",
        },
        {
          title: "订阅服务",
          href: "/docs/configuration/subscriptions",
        },
      ],
    },
  ],
};
