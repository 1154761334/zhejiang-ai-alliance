import { createDirectus, rest, authentication, deleteItems, readItems, readUsers, deleteUser } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function cleanup() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log('✅ Logged in to Directus');

        const collections = [
            'applications',
            'members',
            'articles',
            'companies',
            'org_verified_data',
            'org_internal_investigations'
        ];

        for (const collection of collections) {
            try {
                const items = await directus.request(readItems(collection, { fields: ['id'] }));
                if (items.length > 0) {
                    console.log(`🧹 Deleting ${items.length} items from ${collection}...`);
                    const ids = items.map(item => item.id);
                    await directus.request(deleteItems(collection, ids));
                    console.log(`✅ Cleared ${collection}`);
                } else {
                    console.log(`ℹ️ ${collection} is already empty`);
                }
            } catch (e) {
                console.log(`⚠️ Could not clear ${collection}: ${e.errors?.[0]?.message || e.message}`);
            }
        }

        // --- Cleanup test users ---
        console.log('\n👤 Cleaning up test users...');
        try {
            const users = await directus.request(readUsers({
                filter: {
                    email: {
                        _neq: 'admin@example.com'
                    }
                }
            }));

            if (users.length > 0) {
                console.log(`🧹 Deleting ${users.length} test users...`);
                for (const user of users) {
                    await directus.request(deleteUser(user.id));
                    console.log(`   - Deleted user: ${user.email}`);
                }
                console.log('✅ Users cleared');
            } else {
                console.log('ℹ️ No test users found');
            }
        } catch (e) {
            console.log(`⚠️ Could not clear users: ${e.errors?.[0]?.message || e.message}`);
        }

    } catch (e) {
        console.error('❌ Error during cleanup:', e.errors?.[0]?.message || e.message);
    }
}

cleanup();
