import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function addAuditFields() {
    const collections = ['products', 'case_studies', 'survey_needs', 'compliance_risks'];
    console.log('--- Adding Audit Fields to Collections ---');

    for (const collection of collections) {
        process.stdout.write(`Adding user_created to ${collection}... `);
        const res = await fetch(`${url}/fields/${collection}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                field: 'user_created',
                type: 'uuid',
                meta: {
                    special: ['user-created'],
                    interface: 'select-dropdown-m2o',
                    options: { template: '{{first_name}} {{last_name}}' },
                    readonly: true,
                    hidden: true
                },
                schema: {
                    foreign_key_table: 'directus_users',
                    foreign_key_column: 'id'
                }
            })
        });

        if (res.ok) console.log('✅');
        else {
            const err = await res.json();
            if (err.errors?.[0]?.extensions?.code === 'INVALID_QUERY') {
                console.log('Already exists or restricted.');
            } else {
                console.log('❌', err.errors?.[0]?.message);
            }
        }
    }
}
addAuditFields();
