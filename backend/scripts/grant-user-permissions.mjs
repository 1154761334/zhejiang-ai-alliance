import { createDirectus, rest, authentication, createPermission, readRoles, readPolicies } from '@directus/sdk';

const directus = createDirectus('http://127.0.0.1:8055')
    .with(rest())
    .with(authentication('json'));

async function grantPermissions() {
    try {
        console.log("Logging in...");
        const loginData = await directus.login({ email: 'admin@example.com', password: 'password' });
        const token = loginData.access_token;
        console.log("✅ Logged in successfully.");

        console.log("Finding policy...");
        const policies = await directus.request(readPolicies({ filter: { name: { _eq: 'User Policy New' } } }));
        let policyId = policies[0]?.id;
        
        if (!policyId) {
            const policies2 = await directus.request(readPolicies({ filter: { name: { _contains: 'User Policy' } } }));
            policyId = policies2[0]?.id;
        }

        if (!policyId) {
            console.error("❌ User Policy not found.");
            return;
        }
        console.log(`✅ Using Policy ID: ${policyId}`);

        const collections = [
            'companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks', 'articles', 'members'
        ];

        for (const collection of collections) {
            for (const action of ['read', 'create', 'update', 'delete']) {
                try {
                    // To grant full access, we might need to delete existing restricted ones first or just update.
                    // But here we'll just try to use null for permissions.
                    await directus.request(createPermission({
                        collection,
                        action,
                        policy: policyId,
                        permissions: null, // Use null for full access
                        fields: ['*']
                    }));
                    console.log(`✅ ${action} on ${collection} [OK]`);
                } catch (e) {
                    console.log(`ℹ️ ${action} on ${collection} [SKIP]: ${e.message}`);
                }
            }
        }

        console.log("\n🎉 Permissions update complete (Full Access).");
    } catch (error) {
        console.error("❌ Error:", error);
    }
}

grantPermissions();
