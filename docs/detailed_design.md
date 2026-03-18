# 详细设计 (Detailed Design)

> 更新日期: 2026-03-17

## 1. 后端数据模式 (Directus Schema)

### 1.1 `companies` (企业画像主表 - Tier A)
| 字段名 | 类型 | 描述 | 校验/逻辑 |
| --- | --- | --- | --- |
| status | String | 审核状态 | draft, pending_review, published, rejected |
| company_name | String | 企业全称 | 唯一 |
| credit_code | String | 统一社会信用代码 | 18 位正则校验 |
| mature_level | String | 成熟度等级 | A, B, C (由管理员评定) |
| user_created | UUID | 创建用户 | 用于 RLS 数据隔离隔离 |

### 1.1.2 `org_verified_data` (工商底盘数据 - Tier B)
| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| companies_id | UUID | O2O 关联 `companies` |
| registered_capital | Integer | 注册资本 |
| employee_count | Integer | 参保人数 |
| legal_risks | Text | 涉诉及经营异常记录 |

### 1.1.3 `org_internal_investigations` (内部实地尽调 - Tier C)
| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| company_id | UUID | M2O 关联 `companies` |
| investigator | String | 尽调专员姓名 |
| internal_notes | Text | 核心内部评价与避坑指南 (高密) |
| cooperation_willingness | String | 意愿度 (High, Medium, Low) |

### 1.2 `products` (产品/能力清单)
| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| company_id | UUID | M2O 关联 `companies` |
| product_name | String | 产品名称 |
| core_ability | Text | 核心能力描述 |
| tech_stack | String | 依赖的技术架构/底座模型 |

### 1.3 `case_studies` (标杆应用案例)
| 字段名 | 类型 | 描述 |
| --- | --- | --- |
| company_id | UUID | M2O 关联 `companies` |
| case_name | String | 案例名称 |
| sector | String | 落地行业 (政务, 工业, 医疗等) |
| impact | Text | 带来的量化效益描述 |

## 2. 前端路由与权限控制

### 2.1 路由结构 (`app/`)
- `(marketing)/services`: 全新产品与服务动态展示大厅。
- `(auth)/register`: 自助注册入口。
- `(protected)/dashboard`: 分步表单视图 (企业端)。
- `(protected)/admin`: 管理员专属大屏与企业审批台 (秘书处端)。

### 2.2 角色权限地图 (RBAC)
配置于 `auth.config.ts` 的 `rolesMap` 对象中：
- `Admin UUID` → `ADMIN` (对应系统管理员)。
- `User UUID` → `USER` (对应普通企业成员)。

## 3. 核心 API 交互封装

### 3.1 鉴权上下文
Server Component 通过 `getCurrentUser()` 获取会话。
API 调用统一使用 `lib/directus.ts` 中的 `client` 实例：
```typescript
const client = createDirectus(url).with(staticToken(token)).with(rest());
```

### 3.2 数据回填 (Pre-fetching)
在 `/dashboard` 页面初始化时，通过 `readItems` 获取 `companies` 及关联的 `products`, `case_studies` 等子表数据，并压入表单状态。

## 4. UI 规范
- **分步导航**: 使用封装的 `Steps` 组件，展示 4 个标准业务节。
- **状态反馈**: 全站使用 `Sonner` 提供即时 Toast 反馈。
- **加载状态**: 所有 Server Action 均配套 `isPending` 透明遮罩。
