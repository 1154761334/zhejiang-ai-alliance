# 快速启动指南 (Getting Started)

本指南旨在帮助开发人员和秘书处运营团队快速搭建并运行浙江省 AI 智能体产业发展联盟平台。

## 🛠️ 前置要求

在开始之前，请确保您的本地环境已安装以下工具：
- **Docker Desktop**: 用于运行后端 Directus 和数据库。
- **Node.js 20+**: 用于运行前端开发服务器和管理脚本。
- **Git**: 用于克隆代码库。

---

## 🚀 启动步骤

### 1. 克隆项目
```bash
git clone <repository-url>
cd zhejiang-ai-alliance
```

### 2. 环境配置
1. 在 `frontend/` 目录下，复制 `.env.example` 为 `.env`。
2. 根据实际需求修改 `.env` 中的 API 地址和认证密钥（本地开发通常可保持默认）。

### 3. 启动全栈服务

本项目支持两种启动方式：

#### 方案 A：混合开发模式 (推荐)
适用于需要实时调整前端代码的场景。
1. **启动后端 (Docker)**：
   在项目根目录运行：
   ```bash
   docker-compose up -d
   ```
2. **启动前端 (Next.js)**：
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

#### 方案 B：全量容器化模式
适用于环境预览或演示。
1. 在根目录运行：
   ```bash
   docker-compose up -d  # 需确保 docker-compose.yml 包含 frontend 服务定义
   ```

---

### 4. 初始化数据结构
第一次启动或数据库清空后，需要执行以下初始化脚本：
```bash
cd backend/scripts
node setup-survey-schema.mjs
node enable-registration.mjs
node seed-articles.mjs
```

### 5. 访问地址
- **前端门户**: [http://localhost:3000](http://localhost:3000)
- **Directus 管理后台**: [http://localhost:8055](http://localhost:8055)
- **管理端企业档案审批**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📁 关键业务脚本参考

脚本路径均位于 `backend/scripts/`：

| 脚本名 | 作用 | 运行频率 |
| :--- | :--- | :--- |
| `setup-survey-schema.mjs` | 创建企业填报所需的集合与字段 | 仅初始化或结构变更时 |
| `enable-registration.mjs` | 开启 Directus 公开注册与 RBAC 权限 | 仅初始化 |
| `seed-test-data.mjs` | 录入演示用的企业、产品和新闻 | 建议首次启动时 |
| `patch-matchmaking-fields.mjs` | 升级供需撮合模块的数据结构 | 升级 Tier-C 时 |

---

## ❓ 常见问题

**Q: 为什么我有两个 node_modules？**
A: 本项目采用前后端分离结构。主代码位于 `frontend/`，因此该目录下有 `node_modules`。根目录不应包含 `node_modules`（如误装请删除）。

**Q: 如何重置数据库？**
A: 停止容器后，删除根目录下的 `database/data.db` 文件，并重新执行上述所有初始化脚本。
