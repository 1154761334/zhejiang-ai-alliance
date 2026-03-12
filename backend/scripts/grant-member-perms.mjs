import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;
const policyId = 'd40555b5-e302-4bbf-9c1f-ac540a7d3e39'; // The ID we just created

async function grantPermissions() {
    process.stdout.write(`Using Policy ID: ${policyId}\n`);
    const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];
    const actions = ['create', 'read', 'update', 'delete'];

    for (const collection of collections) {
        for (const action of actions) {
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
                if (err.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
                    console.log('Already exists.');
                } else {
                    console.log('❌', err.errors?.[0]?.message || res.statusText);
                }
            }
        }
    }
    console.log('All permissions granted to Member Policy!');
}
grantPermissions().catch(console.error);
