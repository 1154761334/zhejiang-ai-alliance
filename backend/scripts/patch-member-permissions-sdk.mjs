import { createDirectus, rest, authentication } from '@directus/sdk';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';

async function patch() {
    const client = createDirectus(url).with(authentication('json')).with(rest());
    
    try {
        await client.login('admin@example.com', 'password');
        console.log('Logged in successfully via SDK');
    } catch (e) {
        // Try object-based login if positional fails
        try {
            await client.login({ email: 'admin@example.com', password: 'password' });
            console.log('Logged in successfully via SDK (object-based)');
        } catch (e2) {
            console.error('SDK Login failed:', e2.message);
            return;
        }
    }

    try {
        const { readRoles, createPolicy, createPermission } = await import('@directus/sdk');
        
        const roles = await client.request(readRoles());
        const memberRole = roles.find(r => r.name === 'Member');
        if (!memberRole) return console.error('Member role not found');

        console.log('Creating Member Policy...');
        const newPolicy = await client.request(createPolicy({
            name: 'Member Policy',
            app_access: true,
            admin_access: false,
            roles: [ memberRole.id ]
        }));
        console.log('Policy created:', newPolicy.id);

        const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];
        const actions = ['create', 'read', 'update', 'delete'];

        for (const collection of collections) {
            for (const action of actions) {
                try {
                    await client.request(createPermission({
                        policy: newPolicy.id,
                        collection,
                        action,
                        fields: ['*']
                    }));
                    console.log(`Granted ${action} on ${collection}`);
                } catch (e) {
                    console.log(`Error granting ${action} on ${collection}:`, e.message);
                }
            }
        }
    } catch (e) {
        console.error('Process failed:', e);
    }
}

patch().catch(console.error);
