import { createDirectus, rest, authentication, readUsers, updateUser } from "@directus/sdk";
import 'dotenv/config';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function setToken() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in to Directus as admin.");

        // Find the admin user
        const users = await directus.request(readUsers({ filter: { email: { _eq: 'admin@example.com' } } }));
        console.log("Admin user:", users[0]?.id);

        if (users.length > 0) {
            await directus.request(updateUser(users[0].id, {
                token: process.env.DIRECTUS_STATIC_TOKEN
            }));
            console.log(`Successfully set static token: ${process.env.DIRECTUS_STATIC_TOKEN}`);
        } else {
            console.log("Admin user not found.");
        }

    } catch (err) {
        console.error("Error setting token:", err.errors?.[0]?.message || err.message);
    }
}

setToken();
