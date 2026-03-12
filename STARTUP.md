# 浙江省 AI 智能体产业发展联盟 — 快速启动指南

## 前置条件
- Docker Desktop 已安装并运行
- Node.js v18+ 已安装

## 1. 启动后端 (Directus)
在项目根目录运行：
```powershell
docker-compose up -d
```
- Directus 管理后台: http://localhost:8055
- 管理员账号: `admin@example.com` / `password`

## 2. 启动前端 (Next.js)
```powershell
cd frontend
npm install      # 首次运行或依赖更新时执行
npm run dev

```
- 门户网站: http://localhost:3000

## 3. 可用页面

| 页面 | 地址 | 说明 |
|------|------|------|
| 首页 | http://localhost:3000 | 联盟落地页 |
| 新闻动态 | http://localhost:3000/blog | 从 Directus `articles` 集合动态拉取 |
| 入会权益 | http://localhost:3000/pricing | 联盟成员权益说明 |
| 申请入会 | http://localhost:3000/join | 提交入会申请，数据写入 Directus `applications` |
| 联盟企业名录 | http://localhost:3000/members | 展示审核通过 (`published`) 的优质 AI 企业 |
| 秘书处大厅 | http://localhost:3000/admin | 管理端企业档案审批入口 |
| 供需撮合工作台 | http://localhost:3000/admin/matchmaking | 集中处理企业的融资、算力和技术需求对接 (需Admin权限) |
| 联盟手册 | http://localhost:3000/docs | 文档说明 |

## 4. 录入测试数据
```powershell
cd frontend
node seed-test-data.mjs
```
该脚本会通过 Directus API 自动录入 3 篇测试文章、5 个测试成员和 1 条测试申请。

## 5. 升级进阶能力阶段 (Tier-C) 数据结构
当您需要体验新增的【供需撮合工作台】或【联盟企业公示墙】时，请先执行以下初始化脚本配置数据库及权限：
```powershell
cd frontend
node patch-matchmaking-fields.mjs
node patch-public-permissions.mjs
```
- `patch-matchmaking-fields.mjs`: 为 `survey_needs` （合规与需求集合）添加跟进状态和标签属性。
- `patch-public-permissions.mjs`: 开放审核通过的 `companies` (基础档案) 和 `products` (产品库) 外网读取权限。

## 6. 关键目录结构
```
zhejiang-ai-alliance/
├── docker-compose.yml      # Directus 容器编排
├── database/               # SQLite 数据库文件 (Docker 挂载)
├── uploads/                # 上传文件存储 (Docker 挂载)
├── docs/                   # 项目文档
├── frontend/               # Next.js 前端项目
│   ├── app/                #   页面路由
│   ├── components/         #   UI 组件
│   ├── lib/directus.ts     #   Directus SDK 客户端配置
│   ├── actions/            #   Server Actions (表单提交等)
│   ├── config/             #   站点/导航/博客配置
│   ├── seed-test-data.mjs  #   测试数据录入脚本
│   ├── patch-matchmaking-fields.mjs # 新增: 更新供需撮合数据结构的脚本
│   └── patch-public-permissions.mjs # 新增: 配置公示墙数据读取公开权限的脚本
└── STARTUP.md              # 本文件
```
