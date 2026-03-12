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
        title: "会费管理",
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
