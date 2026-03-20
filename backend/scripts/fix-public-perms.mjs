import { createDirectus, rest, authentication, createPermission, readPermissions } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function fixPublicPerms() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
        const collections = ['articles', 'members', 'companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];

        const existingPerms = await directus.request(readPermissions({
            filter: {
                policy: { _eq: publicPolicyId },
                action: { _eq: 'read' }
            }
        }));
        const permittedCollections = existingPerms.map(p => p.collection);

        for (const collection of collections) {
            if (!permittedCollections.includes(collection)) {
                console.log(`Granting public read on ${collection}...`);
                await directus.request(createPermission({
                    policy: publicPolicyId,
                    collection: collection,
                    action: 'read',
                    fields: ['*']
                }));
            } else {
                console.log(`Public read on ${collection} already exists.`);
            }
        }

        console.log("Public permissions fixed!");

    } catch (error) {
        console.error("Error fixing public perms:", error.errors || error);
    }
}

fixPublicPerms();
