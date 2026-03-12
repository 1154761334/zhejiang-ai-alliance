import { createDirectus, rest, authentication, createPermission, readPermissions, deletePermission, staticToken } from '@directus/sdk';
import 'dotenv/config';

const url = 'http://localhost:8055';
const directus = createDirectus(url).with(rest()).with(staticToken('zhejiang-ai-alliance-static-token'));

const MEMBER_POLICY_ID = '68dc7ca1-c8e7-4e79-bf13-950624d9b473';

async function hardenMemberPermissions() {
    try {
        console.log("Using static token for permission management.");

        // 1. Clean up existing permissions for Member Policy
        const allPerms = await directus.request(readPermissions());
        const memberPerms = allPerms.filter(p => p.policy === MEMBER_POLICY_ID);

        for (const p of memberPerms) {
            console.log(`Deleting old permission ID ${p.id} for ${p.collection}...`);
            await directus.request(deletePermission(p.id));
        }

        // 2. Set Strict Permissions: Owner-Only
        const ownerFilter = { user_created: { _eq: "$CURRENT_USER" } };
        const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];
        
        for (const col of collections) {
            console.log(`Setting strict permissions for ${col}...`);
            
            // Create
            await directus.request(createPermission({
                policy: MEMBER_POLICY_ID,
                collection: col,
                action: 'create',
                fields: ['*']
            }));

            // Read (Owner Only)
            await directus.request(createPermission({
                policy: MEMBER_POLICY_ID,
                collection: col,
                action: 'read',
                permissions: ownerFilter,
                fields: ['*']
            }));

            // Update (Owner Only)
            await directus.request(createPermission({
                policy: MEMBER_POLICY_ID,
                collection: col,
                action: 'update',
                permissions: ownerFilter,
                fields: ['*']
            }));

            // Delete (Owner Only)
            await directus.request(createPermission({
                policy: MEMBER_POLICY_ID,
                collection: col,
                action: 'delete',
                permissions: ownerFilter
            }));
        }

        // 3. Keep Public Read for Articles
        await directus.request(createPermission({
            policy: MEMBER_POLICY_ID,
            collection: 'articles',
            action: 'read',
            permissions: { status: { _eq: 'published' } },
            fields: ['*']
        }));

        console.log("🛡️ SECURITY LOCKDOWN COMPLETE. Member role restricted to owner-only data.");

    } catch (error) {
        console.error("Error during lockdown:", error.errors || error);
    }
}

hardenMemberPermissions();
