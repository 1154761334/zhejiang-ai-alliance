import { createDirectus, rest, authentication, readUsers, updateUser } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function fixUserPermissions() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("✅ Logged in to Directus.");

        const testUserId = '3b1787a5-5c19-4eeb-a739-b283fef5df43';
        
        console.log("Updating test user with full company data...");
        await directus.request(updateUser(testUserId, {
            affiliated_company_id: 'test-company-001'
        }));
        
        console.log("✅ Test user updated.");
        
        const users = await directus.request(readUsers({
            filter: { email: { _eq: 'test@company.com' }},
            fields: ['*', 'affiliated_company_id', 'affiliated_company_id.company_name']
        }));
        
        console.log("User data:", JSON.stringify(users, null, 2));

    } catch (error) {
        console.error("❌ Error:", error.errors || error);
    }
}

fixUserPermissions();