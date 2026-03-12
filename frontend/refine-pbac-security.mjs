import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;
const memberPolicyId = 'd40555b5-e302-4bbf-9c1f-ac540a7d3e39';

async function refineSecurity() {
    console.log('--- Ownership-Based Security Refinement (Directus v11) ---');

    const memberTargets = [
        { collection: 'companies', action: 'create', filter: {} },
        { collection: 'companies', action: 'update', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        { collection: 'companies', action: 'delete', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        
        { collection: 'products', action: 'create', filter: {} },
        { collection: 'products', action: 'update', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        { collection: 'products', action: 'delete', filter: { user_created: { _eq: '$CURRENT_USER' } } },

        { collection: 'case_studies', action: 'create', filter: {} },
        { collection: 'case_studies', action: 'update', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        { collection: 'case_studies', action: 'delete', filter: { user_created: { _eq: '$CURRENT_USER' } } },

        { collection: 'survey_needs', action: 'create', filter: {} },
        { collection: 'survey_needs', action: 'update', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        { collection: 'survey_needs', action: 'delete', filter: { user_created: { _eq: '$CURRENT_USER' } } },

        { collection: 'compliance_risks', action: 'create', filter: {} },
        { collection: 'compliance_risks', action: 'update', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        { collection: 'compliance_risks', action: 'delete', filter: { user_created: { _eq: '$CURRENT_USER' } } }
    ];

    for (const target of memberTargets) {
        const findRes = await fetch(`${url}/permissions?filter={"policy":{"_eq":"${memberPolicyId}"},"collection":{"_eq":"${target.collection}"},"action":{"_eq":"${target.action}"}}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const findData = await findRes.json();
        const permId = findData.data?.[0]?.id;

        if (permId) {
            process.stdout.write(`Patching ${target.action} on ${target.collection}... `);
            const patchRes = await fetch(`${url}/permissions/${permId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    permissions: target.filter,
                    validation: {} // Relying on permissions filter for ownership
                })
            });
            if (patchRes.ok) console.log('✅');
            else console.log('❌');
        } else {
             process.stdout.write(`Creating ${target.action} on ${target.collection}... `);
             await fetch(`${url}/permissions`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    policy: memberPolicyId,
                    collection: target.collection,
                    action: target.action,
                    fields: ['*'],
                    permissions: target.filter
                })
            });
            console.log('✅');
        }
    }

    console.log('Ownership-based refinement complete!');
}

refineSecurity().catch(console.error);
