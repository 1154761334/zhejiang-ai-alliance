import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function patch() {
    console.log('Patching Member role permissions (Policy-based)...');
    
    // 1. Get Member Role
    const rolesRes = await fetch(`${url}/roles`, { headers: { 'Authorization': `Bearer ${token}` } });
    const rolesData = await rolesRes.json();
    const memberRole = rolesData.data.find(r => r.name === 'Member');
    if (!memberRole) {
        console.error('Member role not found!');
        return;
    }
    console.log('Member Role ID:', memberRole.id);

    // 2. Check for Member Policy
    const pRes = await fetch(`${url}/policies`, { headers: { 'Authorization': `Bearer ${token}` } });
    const pData = await pRes.json();
    let memberPolicy = pData.data.find(p => p.name === 'Member Policy');

    if (!memberPolicy) {
        console.log('Creating Member Policy...');
        const createPRes = await fetch(`${url}/policies`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Member Policy',
                app_access: true,
                admin_access: false,
                roles: [ memberRole.id ]
            })
        });
        const createdP = await createPRes.json();
        if (createPRes.ok) {
            memberPolicy = createdP.data;
            console.log('Successfully created Member Policy:', memberPolicy.id);
        } else {
            console.error('Failed to create policy:', JSON.stringify(createdP));
        }
    } else {
        console.log('Member Policy already exists:', memberPolicy.id);
        // Ensure it's linked to the role if not already
        if (!memberPolicy.roles.includes(memberRole.id)) {
            console.log('Linking Member Policy to Role...');
            await fetch(`${url}/policies/${memberPolicy.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ roles: [...memberPolicy.roles, memberRole.id] })
            });
        }
    }

    if (!memberPolicy) {
        console.error('Failed to create/identify Member Policy');
        return;
    }

    const policyId = memberPolicy.id;
    console.log('Using Policy ID:', policyId);

    // 3. Grant Permissions to this Policy
    const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];
    const actions = ['create', 'read', 'update', 'delete'];

    const permsRes = await fetch(`${url}/permissions?filter={"policy":{"_eq":"${policyId}"}}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const permsData = await permsRes.json();
    const existing = permsData.data || [];

    for (const collection of collections) {
        for (const action of actions) {
            const hasPerm = existing.find(p => p.collection === collection && p.action === action);
            if (!hasPerm) {
                process.stdout.write(`Granting ${action} on ${collection}... `);
                const res = await fetch(`${url}/permissions`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        policy: policyId,
                        collection: collection,
                        action: action,
                        fields: ['*'],
                        permissions: {},
                        validation: {}
                    })
                });
                if (res.ok) console.log('✅');
                else {
                    const err = await res.json();
                    console.log('❌', err.errors?.[0]?.message || res.statusText);
                }
            } else {
                console.log(`Permission ${action} on ${collection} already exists.`);
            }
        }
    }
    console.log('Done!');
}

patch().catch(console.error);
