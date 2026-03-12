# Directus 数据库模型设置指南

为了使前端表单正常工作，请在 Directus 管理后台 (`http://localhost:8055`) 手动创建以下集合与字段：

## 1. 集合: `companies`
- **字段**:
    - `company_name`: Type `String` (Required)
    - `region`: Type `String`
    - `tracks`: Type `JSON` (Array of strings)
    - `role`: Type `String`
    - `financing_need`: Type `String`
    - `market_needs`: Type `JSON`
    - `tech_needs`: Type `JSON`
    - `tech_complement_desc`: Type `Text`
    - `surveyor`: Type `String`
    - `status`: Type `String` (Default: `published`)

## 2. 集合: `products`
- **字段**:
    - `name`: Type `String` (Required)
    - `type`: Type `String` (Copilot, Autonomous, Multi-Agent)
    - `function_desc`: Type `String`
    - `maturity`: Type `String`
    - `company_id`: Type `M2O` (Many-to-One) → Related to `companies`

## 3. 集合: `contacts`
- **字段**:
    - `name`: Type `String`
    - `position`: Type `String`
    - `phone`: Type `String`
    - `policy_interests`: Type `JSON`
    - `company_id`: Type `M2O` (Many-to-One) → Related to `companies`

---

### 重要事项：权限配置
请前往 **Settings** → **User Roles & Permissions** → **Public**:
1.  找到以上三个集合。
2.  为 **Public** 角色开启 **Create** (写入) 权限，确保访客可以提交表单。
3.  (可选) 开启 **Read** 权限以便于调试。
