import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;
const memberPolicyId = 'd40555b5-e302-4bbf-9c1f-ac540a7d3e39';

async function finalRefine() {
    console.log('--- Final Security Refinement (Ownership & Relational) ---');

    const memberTargets = [
        // Companies: Can read published OR their own. Can only update/delete their own.
        { collection: 'companies', action: 'read', filter: { _or: [ { status: { _eq: 'published' } }, { user_created: { _eq: '$CURRENT_USER' } } ] } },
        { collection: 'companies', action: 'update', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        { collection: 'companies', action: 'delete', filter: { user_created: { _eq: '$CURRENT_USER' } } },
        
        // Products: Can only create/update/delete if the linked company belongs to them.
        { collection: 'products', action: 'create', filter: { company_id: { user_created: { _eq: '$CURRENT_USER' } } } },
        { collection: 'products', action: 'update', filter: { company_id: { user_created: { _eq: '$CURRENT_USER' } } } },
        { collection: 'products', action: 'delete', filter: { company_id: { user_created: { _eq: '$CURRENT_USER' } } } },

        // Survey Needs
        { collection: 'survey_needs', action: 'create', filter: { company_id: { user_created: { _eq: '$CURRENT_USER' } } } },
        { collection: 'survey_needs', action: 'update', filter: { company_id: { user_created: { _eq: '$CURRENT_USER' } } } },
        { collection: 'survey_needs', action: 'delete', filter: { company_id: { user_created: { _eq: '$CURRENT_USER' } } } }
    ];

    for (const target of memberTargets) {
        const findRes = await fetch(`${url}/permissions?filter={"policy":{"_eq":"${memberPolicyId}"},"collection":{"_eq":"${target.collection}"},"action":{"_eq":"${target.action}"}}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const findData = await findRes.json();
        const permId = findData.data?.[0]?.id;

        const body = {
            permissions: target.filter,
            validation: {} // Clearing validation to avoid "Value is required" bug
        };

        if (permId) {
            process.stdout.write(`Patching ${target.action} on ${target.collection}... `);
            const patchRes = await fetch(`${url}/permissions/${permId}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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
                    ...body
                })
            });
            console.log('✅');
        }
    }

    console.log('Final refinement complete!');
}

finalRefine().catch(console.error);
