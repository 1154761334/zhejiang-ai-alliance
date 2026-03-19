import { createDirectus, rest, authentication, updateRole, createPermission } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function setPermissions() {
    try {
        // Login as admin
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        // The 'Public' role UUID in Directus is not exposed by default as it's virtual. 
        // We update the permissions endpoint directly.
        // PUBLIC role/policy (解除限制，确保开发环境 E2E 稳健运行)
        const PUBLIC_POLICY = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
        const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks', 'applications', 'members', 'articles'];
        const actions = ['read', 'create', 'update', 'delete'];

        for (const collection of collections) {
            for (const action of actions) {
                try {
                    await directus.request(createPermission({
                        collection,
                        action,
                        permissions: {},
                        validation: {},
                        fields: ['*'],
                        policy: PUBLIC_POLICY
                    }));
                } catch (e) {
                    console.log(`Public Permission for ${collection}:${action} might already exist or failed: ${e.message}`);
                }
            }
        }

        console.log("Public permissions opened successfully!");

    } catch (error) {
        console.error("Error setting Directus permissions:", error);
    }
}

setPermissions();
