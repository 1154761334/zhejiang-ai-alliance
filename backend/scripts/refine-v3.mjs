import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;
const memberPolicyId = 'd40555b5-e302-4bbf-9c1f-ac540a7d3e39';

async function refineSecurity() {
    console.log('--- Fixing B.1 Cross-Linking Vulnerability ---');

    // We use validation to explicitly block the creation of items linked to unauthorized companies
    const targets = ['products', 'case_studies', 'survey_needs', 'compliance_risks'];

    for (const collection of targets) {
        const findRes = await fetch(`${url}/permissions?filter={"policy":{"_eq":"${memberPolicyId}"},"collection":{"_eq":"${collection}"},"action":{"_eq":"create"}}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const findData = await findRes.json();
        const permId = findData.data?.[0]?.id;

        const validation = {
            "company_id": {
                "user_created": {
                    "_eq": "$CURRENT_USER"
                }
            }
        };

        if (permId) {
            process.stdout.write(`Adding Validation to ${collection} create... `);
            const patchRes = await fetch(`${url}/permissions/${permId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ validation })
            });
            if (patchRes.ok) console.log('✅');
            else console.log('❌');
        }
    }

    console.log('Refinement attempt complete!');
}

refineSecurity().catch(console.error);
