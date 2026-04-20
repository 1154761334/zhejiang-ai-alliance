// Removed Prisma import

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "功能菜单",
    items: [
      {
        href: "/admin",
        icon: "laptop",
        title: "管理后台",
        authorizeOnly: "ADMIN",
      },
      { href: "/dashboard", icon: "dashboard", title: "控制台" },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "会员状态与权益",
        authorizeOnly: "USER",
      },
      {
        href: "/dashboard/messages",
        icon: "messages",
        title: "消息中心",
        authorizeOnly: "USER",
      },
      {
        href: "/dashboard/needs",
        icon: "package",
        title: "我的需求",
        authorizeOnly: "USER",
      },
      {
        href: "/dashboard/preview",
        icon: "page",
        title: "公开名片预览",
        authorizeOnly: "USER",
      },
      { href: "/dashboard/charts", icon: "lineChart", title: "联盟数据概览" },
      {
        href: "/admin/companies",
        icon: "package",
        title: "企业材料审批台",
        badge: 2,
        authorizeOnly: "ADMIN",
      },
      {
        href: "/admin/tasks",
        icon: "warning",
        title: "秘书处待办中心",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/admin/users",
        icon: "user",
        title: "账号管理",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/admin/matchmaking",
        icon: "messages",
        title: "供需撮合工单",
        authorizeOnly: "ADMIN",
      },
      {
        href: "/admin/audit",
        icon: "warning",
        title: "审计日志",
        authorizeOnly: "ADMIN",
      },
    ],
  },
  {
    title: "系统设置",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "账号设置" },
      { href: "/", icon: "home", title: "返回首页" },
    ],
  },
];
