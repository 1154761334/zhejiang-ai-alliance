# 浙江省 AI 智能体产业发展联盟 — 前端门户

基于 Next.js 14 + Directus 的联盟官方门户网站。

## 技术栈

| 层面 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router, Server Components) |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| UI 组件 | Shadcn UI (基于 Radix UI) |
| 表单 | React Hook Form + Zod |
| CMS API | `@directus/sdk` |
| 认证 | NextAuth.js v5 (Credentials → Directus) |
| 内容 | Contentlayer (静态 MDX) + Directus (动态文章/企业数据) |

## 快速开始

```bash
npm install
npm run dev
```

前提：Directus 后端需先通过 Docker 启动（见根目录 `docker-compose.yml`）。

## 核心目录结构

```
frontend/
├── app/
│   ├── (marketing)/              # 公开页面
│   │   ├── page.tsx              #   首页落地页
│   │   ├── blog/page.tsx         #   新闻动态 ← Directus articles
│   │   ├── pricing/page.tsx      #   入会权益（观察员/普通/理事）
│   │   └── join/page.tsx         #   入会申请表单
│   ├── (auth)/                   # 认证页面
│   │   ├── login/page.tsx        #   登录（Directus 认证）
│   │   └── register/page.tsx     #   自助注册 → Directus Public Registration
│   ├── (protected)/              # 需要登录
│   │   ├── dashboard/            #   成员工作台
│   │   │   ├── page.tsx          #     四步向导式企业能力档案表单
│   │   │   ├── billing/          #     会员状态（读取真实入库状态）
│   │   │   ├── charts/           #     联盟数据概览（赛道/角色/区域）
│   │   │   └── settings/         #     账号设置
│   │   └── admin/                #   秘书处管理后台 (ADMIN only)
│   │       ├── page.tsx          #     运营驾驶舱（KPI + 待办队列）
│   │       └── companies/        #     企业材料审批台 + 详情审核页
│   └── (docs)/                   # 联盟手册（MDX 静态内容）
├── config/
│   ├── site.ts                   # 站点配置 + Footer 链接
│   ├── dashboard.ts              # 侧边栏导航配置
│   ├── landing.ts                # 首页文案 + Testimonials
│   └── subscriptions.ts          # 会员等级权益定义
├── content/                      # 静态 MDX 内容
│   ├── docs/                     #   联盟简介 + 入会指南
│   └── blog/                     #   静态博客文章（与 Directus 共存）
├── auth.config.ts                # Directus 角色 → ADMIN/USER 映射
└── *.mjs                         # 各类 Directus 管理脚本
```

## Directus 集合

### 核心业务集合

| 集合 | 说明 | 关联 |
|------|------|------|
| `companies` | 企业基础档案（主表） | 1:N → products, case_studies |
| `products` | 核心产品/能力 | N:1 → companies |
| `case_studies` | 标杆应用案例 | N:1 → companies |
| `survey_needs` | 生态赋能需求（算力/融资） | N:1 → companies |
| `compliance_risks` | 合规与安全承诺 | N:1 → companies |

### 内容与运营集合

| 集合 | 说明 |
|------|------|
| `articles` | 新闻动态（Directus 后台可编辑） |
| `applications` | 入会申请（/join 页面提交） |

## 角色与权限

| 角色 | Directus UUID | 权限 |
|------|------|------|
| Administrator | `e2a58ff1-...` | 映射为 `ADMIN`，可访问秘书处后台 |
| User | `cbdd77bf-...` | 映射为 `USER`，企业成员自助填报 |

角色映射定义在 `auth.config.ts` 的 `rolesMap` 中。

## 环境变量

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_APP_URL` | 前端地址 (`http://localhost:3000`) |
| `NEXT_PUBLIC_API_URL` | Directus API (`http://localhost:8055`) |
| `DIRECTUS_STATIC_TOKEN` | 服务端 Directus 静态令牌 |
| `AUTH_SECRET` | NextAuth 加密密钥 |

## 管理脚本

| 脚本 | 用途 |
|------|------|
| `setup-survey-schema.mjs` | 一键创建所有 Directus 集合与字段 |
| `seed-articles.mjs` | 录入 5 篇种子新闻 |
| `seed-test-data.mjs` | 录入测试企业数据 |
| `enable-registration.mjs` | 开启 Directus 公开注册 + 创建 User 角色 |
| `patch-crm-fields.mjs` | 添加 mature_level/internal_feedback 字段 |

## 常见操作

### 添加新闻文章
登录 Directus 后台 → Content → articles → 新建，填写标题、slug、正文等。前端 `/blog` 自动展示。

### 审核企业申请
Admin 登录后：秘书处驾驶舱 → 企业材料审批台 → 点击企业 → 填写评级/意见 → 通过/驳回。

### 修改首页文案
编辑 `config/landing.ts`（features/infos/testimonials）。

## 测试体系
针对本项目自动化及 E2E 测试情况、CORS 等遗留项处理与下一阶段压力测试路线，详见 `../docs/test_plan.md`。

## 致谢
基于 [next-saas-stripe-starter](https://github.com/mickasmt/next-saas-stripe-starter) 模板改造。
