import { createDirectus, rest, authentication, readFields, createField } from '@directus/sdk';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const directus = createDirectus(url)
    .with(rest())
    .with(authentication('json'));

async function updateSchema() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        const existingFields = await directus.request(readFields('org_internal_investigations'));
        const fieldNames = existingFields.map(f => f.field);

        const fieldsToAdd = [
            { field: 'actual_team_size', type: 'integer', meta: { interface: 'input', note: '核实后的真实人员规模' } },
            { field: 'tech_maturity_score', type: 'integer', meta: { interface: 'slider', options: { min: 1, max: 5, step: 1 }, note: '技术成熟度评分 (1-5)' } },
            { field: 'market_influence_score', type: 'integer', meta: { interface: 'slider', options: { min: 1, max: 5, step: 1 }, note: '市场影响力评分 (1-5)' } },
            { field: 'risk_level', type: 'string', meta: { interface: 'select-dropdown', options: { choices: [{ text: "低风险", value: "Low" }, { text: "中等风险", value: "Medium" }, { text: "高风险", value: "High" }] }, note: '潜在合规或经营风险等级' } },
        ];

        for (const fieldDef of fieldsToAdd) {
            if (!fieldNames.includes(fieldDef.field)) {
                console.log(`Creating missing field: ${fieldDef.field}`);
                await directus.request(createField('org_internal_investigations', fieldDef));
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
