import { createDirectus, rest, authentication, readCollections, createCollection, readFields, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function setupCRMCollections() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully to set up CRM collections.");

        // We check if collections exist first
        const collections = await directus.request(readCollections());
        const collectionNames = collections.map(c => c.collection);

        // 1. Create 'companies' collection if it doesn't exist
        if (!collectionNames.includes('companies')) {
            console.log("Creating 'companies' collection...");
            await directus.request(createCollection({
                collection: 'companies',
                meta: { collection: 'companies', icon: 'business', note: '入驻企业详情' },
                schema: { name: 'companies' },
                fields: [
                    { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true }, schema: { is_primary_key: true, has_auto_increment: false } }
                ]
            }));
            // Refresh collection list
            const updatedCollections = await directus.request(readCollections());
            collectionNames.push(...updatedCollections.map(c => c.collection));
        }

        // Update 'companies' collection with new fields
        console.log("Updating 'companies' A-Tier collection fields...");
        try {
            const existingCompanyFields = await directus.request(readFields('companies'));
            const companyFieldNames = existingCompanyFields.map(f => f.field);

            const companyFieldsToAdd = [
                { field: 'company_name', type: 'string', meta: { interface: 'input', note: '单位对外全称' } },
                { field: 'credit_code', type: 'string', meta: { interface: 'input', note: '统一社会信用代码' } },
                { field: 'established_date', type: 'date', meta: { interface: 'datetime', note: '成立时间' } },
                { field: 'region', type: 'string', meta: { interface: 'input', note: '所在区域' } },
                { field: 'address', type: 'text', meta: { interface: 'input', note: '详细地址' } },
                { field: 'website', type: 'string', meta: { interface: 'input', note: '官网' } },
                { field: 'company_type', type: 'string', meta: { interface: 'select-dropdown', note: '企业性质' } },
                { field: 'employee_count', type: 'integer', meta: { interface: 'input', note: '员工规模' } },
                { field: 'rnd_count', type: 'integer', meta: { interface: 'input', note: '研发人数' } },
                { field: 'revenue_range', type: 'string', meta: { interface: 'input', note: '营收范围' } },
                { field: 'tracks', type: 'json', meta: { interface: 'tags', note: '细分赛道' } },
                { field: 'role', type: 'string', meta: { interface: 'select-dropdown', note: '企业角色定位' } },
                { field: 'contact_name', type: 'string', meta: { interface: 'input', note: '对接人姓名' } },
                { field: 'contact_position', type: 'string', meta: { interface: 'input', note: '对接人职务' } },
                { field: 'contact_phone', type: 'string', meta: { interface: 'input', note: '手机号' } },
                { field: 'contact_email', type: 'string', meta: { interface: 'input', note: '邮箱' } },
                { field: 'contact_preference', type: 'string', meta: { interface: 'select-dropdown', note: '首选对接偏好' } },
                { field: 'core_business', type: 'string', meta: { interface: 'input', note: '主营业务(企业自填)' } },
                { field: 'expected_resources', type: 'text', meta: { interface: 'input-multiline', note: '期望对接资源' } },
                { field: 'key_clients_claimed', type: 'json', meta: { interface: 'tags', note: '主张拥有的头部客户资源(选填)' } },
            ];

            for (const fieldDef of companyFieldsToAdd) {
                if (!companyFieldNames.includes(fieldDef.field)) {
                    console.log(`Creating missing field on companies: ${fieldDef.field}`);
                    await directus.request(createField('companies', fieldDef));
                }
            }
        } catch (err) {
            console.log("Could not update companies fields, is the collection existing?", err.errors || err);
        }

        // 2. Create 'org_verified_data' collection (B-Tier: Third Party API Data)
        if (!collectionNames.includes('org_verified_data')) {
            console.log("Creating 'org_verified_data' B-Tier collection...");
            await directus.request(createCollection({
                collection: 'org_verified_data',
                meta: { collection: 'org_verified_data', icon: 'verified', note: '权威底盘数据(工商/第三方)' },
                schema: { name: 'org_verified_data' },
                fields: [
                    { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true }, schema: { is_primary_key: true, has_auto_increment: false } },
                    { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', note: '关联企业' }, schema: { is_primary_key: false, foreign_key_table: 'companies', foreign_key_column: 'id' } },
                    { field: 'registered_capital', type: 'string', meta: { interface: 'input', note: '注册资本' } },
                    { field: 'paid_in_capital', type: 'string', meta: { interface: 'input', note: '实缴资本' } },
                    { field: 'employee_count', type: 'integer', meta: { interface: 'input', note: '参保人数' } },
                    { field: 'certifications', type: 'json', meta: { interface: 'tags', note: '资质认证(专精特新等)' } },
                    { field: 'patent_count', type: 'integer', meta: { interface: 'input', note: '核心专利数' } },
                    { field: 'legal_risks', type: 'text', meta: { interface: 'input-multiline', note: '涉诉风险提示' } }
                ]
            }));
        } else {
            console.log("Collection 'org_verified_data' already exists.");
        }

        // 3. Create 'org_internal_investigations' collection (C-Tier: Field Survey Data)
        if (!collectionNames.includes('org_internal_investigations')) {
            console.log("Creating 'org_internal_investigations' C-Tier collection...");
            await directus.request(createCollection({
                collection: 'org_internal_investigations',
                meta: { collection: 'org_internal_investigations', icon: 'policy', note: '深度尽调与内部核验层' },
                schema: { name: 'org_internal_investigations' },
                fields: [
                    { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true }, schema: { is_primary_key: true, has_auto_increment: false } },
                    { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o', note: '关联企业' }, schema: { is_primary_key: false, foreign_key_table: 'companies', foreign_key_column: 'id' } },
                    { field: 'investigator', type: 'string', meta: { interface: 'input', note: '尽调员' } },
                    { field: 'investigation_date', type: 'date', meta: { interface: 'datetime', note: '尽调日期' } },
                    { field: 'actual_capacity', type: 'text', meta: { interface: 'input-multiline', note: '实际有效产能评价' } },
                    { field: 'technical_team_eval', type: 'text', meta: { interface: 'input-multiline', note: '技术团队真实评估' } },
                    { field: 'real_key_clients', type: 'text', meta: { interface: 'input-multiline', note: '核实验证的核心客户清单' } },
                    { field: 'cooperation_willingness', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: "高(A级节点)", value: "High" }, { text: "中", value: "Medium" }, { text: "低", value: "Low" }] }, note: '合作意愿度评分' } },
                    { field: 'internal_notes', type: 'text', meta: { interface: 'input-rich-text-html', note: '内部避坑指南/随记' } },
                    { field: 'structured_tags', type: 'json', meta: { interface: 'tags', note: '结构化核验标签(用于匹配引擎)' } }
                ]
            }));
        } else {
            console.log("Collection 'org_internal_investigations' already exists.");
        }

        console.log("CRM Collections setup complete!");

    } catch (error) {
        console.error("Error setting up CRM Collections:", error.errors || error);
    }
}

setupCRMCollections();
