import { createDirectus, rest, authentication, readFields, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function updateRelatedSchemas() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        // 1. Products fields
        const productFields = [
            { field: 'tech_stack', type: 'string', meta: { interface: 'input', note: '关键技术栈' } },
            { field: 'model_preference', type: 'json', meta: { interface: 'tags', note: '模型选型与应用偏好' } },
            { field: 'agent_capabilities', type: 'json', meta: { interface: 'tags', note: '智能体相关能力' } },
            { field: 'data_capabilities', type: 'json', meta: { interface: 'tags', note: '数据能力' } },
            { field: 'engineering_capabilities', type: 'json', meta: { interface: 'tags', note: '工程化能力' } },
            { field: 'integration_capabilities', type: 'json', meta: { interface: 'tags', note: '集成能力' } },
            { field: 'delivery_cycle_months', type: 'integer', meta: { interface: 'input', note: '交付周期典型值(月)' } },
            { field: 'prerequisites', type: 'string', meta: { interface: 'input', note: '交付所需客户侧条件' } },
            { field: 'pricing_model', type: 'string', meta: { interface: 'input', note: '定价方式' } },
            { field: 'pilot_mode', type: 'string', meta: { interface: 'input', note: '可提供的试点方式' } },
            { field: 'case_industries', type: 'json', meta: { interface: 'tags', note: '案例行业' } },
        ];

        // 2. Case Studies fields
        const caseStudyFields = [
            { field: 'data_types', type: 'json', meta: { interface: 'tags', note: '使用的数据类型' } },
            { field: 'reusability', type: 'text', meta: { interface: 'input-multiline', note: '可复用性说明' } },
        ];

        // 3. Companies extra fields
        const companyExtraFields = [
            { field: 'info_updated_at', type: 'date', meta: { interface: 'datetime', note: '信息更新时间' } },
        ];

        const updateCollection = async (collection, fields) => {
            console.log(`Checking fields for ${collection}...`);
            const existingFields = await directus.request(readFields(collection));
            const fieldNames = existingFields.map(f => f.field);

            for (const fieldDef of fields) {
                if (!fieldNames.includes(fieldDef.field)) {
                    console.log(`Creating field: ${collection}.${fieldDef.field}`);
                    await directus.request(createField(collection, fieldDef));
                }
            }
        };

        await updateCollection('products', productFields);
        await updateCollection('case_studies', caseStudyFields);
        await updateCollection('companies', companyExtraFields);

        console.log("Related schemas update complete!");
    } catch (error) {
        console.error("Error updating related schemas:", error.errors || error);
    }
}

updateRelatedSchemas();
