# 部署与运维指南 (Deployment Guide)

> 更新日期: 2026-03-11

## 1. 环境准备
- **Docker & Compose**: 用于整体环境一键交付。
- **Node.js 20+**: 前端构建建议。

## 2. 快速部署 (Docker 模式)

### 2.1 启动服务
```bash
docker-compose up -d
```
默认暴露端口：
- **前端门户**: 3000
- **Directus 控制台**: 8055

### 2.2 系统初始化 (关键步骤)
项目内置了多个自动化脚本，部署后请按顺序执行：

1. **结构初始化**: `node setup-survey-schema.mjs` (创建 5 大核心集合与字段)。
2. **账号初始化**: `node enable-registration.mjs` (开启公网注册，并获取 User 角色 ID)。
3. **内容填充**: `node seed-articles.mjs` (录入初始官网新闻)。

## 3. 环境变量清单

| 变量名 | 说明 | 示例 |
|------|------|------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `http://localhost:8055` |
| `DIRECTUS_STATIC_TOKEN` | 管理员持久令牌 | 从 Directus 用户界面获取 |
| `AUTH_SECRET` | 认证密钥 | 随机 UUID |

## 4. 数据备份与恢复
- **数据库**: 备份根目录 `/database/data.db`。
- **附件**: 备份根目录 `/uploads` 文件夹。

## 5. 审核工作流运维
- **新用户分配**: 当新用户注册时，Directus 会自动分配 `USER` 角色。
- **权限修正**: 若发现越权，请在 Directus Roles 页面检查 `Accountability` 配置是否开启。

## 6. 常见故障处理
- **登录 500**: 检查 `auth.config.ts` 中的 `rolesMap` 是否录入了正确的 Directus 角色 UUID。
- **表单无法保存**: 确认 `companies` 表的 `user_created` 字段权限已由脚本正确设置。
