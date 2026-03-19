import { createDirectus, rest, authentication, readCollections } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function check() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in.");
        const collections = await directus.request(readCollections());
        console.log("Collections found in Directus:");
        collections.forEach(c => {
            if (!c.collection.startsWith('directus_')) {
                console.log(`- ${c.collection}`);
            }
        });
    } catch (error) {
        console.error("Error checking collections:", error);
    }
}

check();
