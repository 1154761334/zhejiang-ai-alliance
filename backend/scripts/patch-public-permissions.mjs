import { createDirectus, rest, authentication, readRoles, createPermission, readPermissions, updatePermission } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function configurePublicPermissions() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully to update permissions.");

        // 1. D11 requires a policy. Let's find the public policy.
        const policies = await directus.request(() => ({ path: '/policies', method: 'GET' }));
        // Usually there's a policy named 'Public' or we can pick the first one if it's the only one.
        const publicPolicy = policies.data.find(p => p.name === 'Public') || policies.data[0];
        
        if (!publicPolicy) {
            console.error("No policy found in Directus. Please create a policy first.");
            return;
        }
        console.log(`Using policy: ${publicPolicy.name} (${publicPolicy.id})`);

        const allPerms = await directus.request(readPermissions());

        const setupPublishedRead = async (collection) => {
            const existing = allPerms.find(p => p.collection === collection && p.action === 'read' && p.policy === publicPolicy.id);
            const permissionsRules = {
                _and: [
                    { status: { _eq: 'published' } }
                ]
            };

            const allowedFields = collection === 'companies'
                ? ['id', 'company_name', 'logo', 'description', 'region', 'company_type', 'tracks', 'role', 'status', 'website', 'core_business', 'expected_resources']
                : ['id', 'company_id', 'name', 'form_factor', 'maturity_stage', 'description'];

            if (existing) {
                console.log(`Updating Public read permissions for ${collection}...`);
                await directus.request(updatePermission(existing.id, {
                    permissions: permissionsRules,
                    fields: allowedFields,
                    policy: publicPolicy.id
                }));
            } else {
                console.log(`Creating Public read permissions for ${collection}...`);
                await directus.request(createPermission({
                    policy: publicPolicy.id,
                    collection: collection,
                    action: 'read',
                    permissions: permissionsRules,
                    fields: allowedFields
                }));
            }
        };

        await setupPublishedRead('companies');
        await setupPublishedRead('products');

        console.log("Public permissions configured successfully!");
    } catch (error) {
        console.error("Error setting up permissions:", error.errors || error);
    }
}

configurePublicPermissions();
