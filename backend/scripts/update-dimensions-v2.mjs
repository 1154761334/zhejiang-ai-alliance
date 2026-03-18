import { createDirectus, rest, authentication, readFields, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function updateSchema() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        const existingFields = await directus.request(readFields('companies'));
        const fieldNames = existingFields.map(f => f.field);

        const newFields = [
            { field: 'company_description', type: 'text', meta: { interface: 'input-multiline', note: '企业简介' } },
            { field: 'awards_honors', type: 'text', meta: { interface: 'input-multiline', note: '曾获荣誉' } },
            { field: 'info_provider_name_position', type: 'string', meta: { interface: 'input', note: '信息提供人姓名与职务' } },
            { field: 'confidentiality_commitment', type: 'boolean', meta: { interface: 'boolean', note: '涉密与保密承诺' }, schema: { default_value: false } },
            { field: 'delivery_risks', type: 'text', meta: { interface: 'input-multiline', note: '主要交付风险点' } },
            { field: 'risk_mitigation', type: 'text', meta: { interface: 'input-multiline', note: '风险缓解措施' } },
            { field: 'industry_tags', type: 'json', meta: { interface: 'tags', note: '行业标签' } },
            { field: 'capability_tags', type: 'json', meta: { interface: 'tags', note: '能力标签' } },
            { field: 'tech_stack_tags', type: 'json', meta: { interface: 'tags', note: '技术栈标签' } },
            { field: 'maturity_level', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: "A(可规模化)", value: "A" }, { text: "B(可交付)", value: "B" }, { text: "C(研发验证)", value: "C" }] }, note: '成熟度等级' } },
            
            // Secretariat/Admin fields
            { field: 'secretariat_comments', type: 'text', meta: { interface: 'input-multiline', note: '秘书处评语' } },
            { field: 'recommended_scenarios', type: 'json', meta: { interface: 'tags', note: '推荐场景方向' } },
            { field: 'completion_rate', type: 'float', meta: { interface: 'input', note: '必填字段完成率' } },
            { field: 'credit_code_status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: "已核验", value: "verified" }, { text: "未核验", value: "unverified" }] }, note: '信用代码核验状态' } },
            { field: 'evidence_status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: "已核验", value: "verified" }, { text: "未核验", value: "unverified" }] }, note: '案例佐证核验状态' } },
            { field: 'contact_status', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: "双渠道可达", value: "both" }, { text: "单渠道", value: "single" }, { text: "不可达", value: "none" }] }, note: '联系人触达状态' } },

            // Empowerment Needs
            { field: 'financing_need', type: 'json', meta: { interface: 'tags', note: '融资与资金需求' } },
            { field: 'market_need', type: 'json', meta: { interface: 'tags', note: '市场拓展需求' } },
            { field: 'tech_need', type: 'json', meta: { interface: 'tags', note: '全要素技术与生态需求' } },
            { field: 'compute_pain_points', type: 'json', meta: { interface: 'tags', note: '当前算力使用痛点' } },
            { field: 'tech_complement_desc', type: 'text', meta: { interface: 'input-multiline', note: '寻求技术互补的具体描述' } },
            { field: 'policy_intent', type: 'json', meta: { interface: 'tags', note: '政策/服务意向勾选' } },
        ];

        for (const fieldDef of newFields) {
            if (!fieldNames.includes(fieldDef.field)) {
                console.log(`Creating field: ${fieldDef.field}`);
                await directus.request(createField('companies', fieldDef));
            } else {
                console.log(`Field ${fieldDef.field} already exists.`);
            }
        }

        console.log("Schema update complete!");
    } catch (error) {
        console.error("Error updating schema:", error.errors || error);
    }
}

updateSchema();
