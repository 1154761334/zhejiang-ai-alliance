# 项目当前状态 (Project Status)

**最后更新日期**: 2026-03-12

## 1. 核心里程碑 (Completed Milestones)

- [x] **基础设施**: Docker + Directus + Next.js 环境完全就绪。
- [x] **门户网站**: 完成全站中文本地化，首页/权益页/入会流程已适配联盟文案。
- [x] **企业调研系统 (核心)**: 
    - 实现全套 Directus Schema (Companies, Products, Cases, Needs, Risks)。
    - 开发完成 **“四步向导式”向导填报表单**。
    - 实现 **草稿自动保存与回填** 机制。
- [x] **秘书处驾驶舱**:
    - 开发 `/admin` 首页，展示联盟运行 KPI。
    - 实现 `/admin/companies` 企业材料全量审批台。
    - 引入三层档案模型：Tier A (公开申报), Tier B (工商尽调核验), Tier C (内部实地走访记录)。
- [x] **产品与服务展示**:
    - 上线全新 `/services` 综合服务展示大厅。
    - 动态连通 Directus `case_studies` 表，实现“标杆案例”墙的动态生成。
- [x] **账号与安全**:
    - 打通 **企业自助注册 (Public Register)** 链路。
    - 实现 **RBAC 角色权限隔离** (Admin/User 分流)。
- [x] **平台清理 (Cleanup)**: 执行了 Tier-A/B 级体验审计，移除了所有死按钮与英文模板残留。

## 2. 模块完成度矩阵

| 模块 | 子功能 | 状态 | 备注 |
|------|--------|------|------|
| **门户** | 首页/权益/手册 | ✅ 100% | 已填充真实联盟资讯 |
| **服务大厅** | 算力/精调/案例 | ✅ 100% | 动态拉取 CRM 案例发布库 |
| **认证** | 登录/注册/权限 | ✅ 100% | 对接 Directus RBAC |
| **成员中心** | 向导填报/档案管理 | ✅ 100% | 支持多产品/多案例 |
| **生态管理台** | 驾驶舱/三层审批台/调查库 | ✅ 100% | Tier A/B/C 三段式企业管理闭环 |
| **新闻动态**| 资讯管理 | ✅ 100% | 已录入 5 篇种子新闻 |

## 3. 核心数据模型 (Directus Collections)

- `companies`: 企业画像主表Tier A (含 18 位信用代码校验)。
- `org_verified_data`: 企业底盘工商数据Tier B (一对一关联 `companies`)。
- `org_internal_investigations`: 尽调与内部拜访记录Tier C (一对多关联 `companies`)。
- `products`: 企业 AI 产品/能力清单 (一对多关联 `companies`)。
- `case_studies`: 标杆应用案例 (一对多关联 `companies`，`/services` 页面直调)。
- `survey_needs`: 生态赋能需求 (融资/算力/市场)。
- `compliance_risks`: 合规与合规安全声明。
- `articles`: 联盟新闻动态。

## 4. 下一步路线图 (Roadmap)

1. **供需撮合单系统**: 将 `/admin/orders` 路径改造为秘书处专用的“撮合单”调度中心。
2. **移动端适配**: 针对手机浏览器优化分步表单的交互体验。
3. **企业公示墙**: 增加官网公示功能，展示已“正式入库”的标杆成员。
4. **多维统计大屏**: 增强数据看板，实现三维动态产业地图展示。
