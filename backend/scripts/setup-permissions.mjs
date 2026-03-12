import { createDirectus, rest, authentication, updateRole } from '@directus/sdk';

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
        const PUBLIC_ROLE = null;

        console.log("Setting public read permissions for 'articles' and 'members'...");

        // We need to create permissions for the public role (null)
        const { createPermission } = await import('@directus/sdk');

        await directus.request(createPermission({
            collection: 'articles',
            action: 'read',
            permissions: {},
            validation: {},
            fields: ['*'],
            role: null
        }));

        await directus.request(createPermission({
            collection: 'members',
            action: 'read',
            permissions: {},
            validation: {},
            fields: ['*'],
            role: null
        }));

        await directus.request(createPermission({
            collection: 'applications',
            action: 'create',
            permissions: {},
            validation: {},
            fields: ['*'],
            role: null
        }));

        console.log("Permissions created successfully!");

    } catch (error) {
        console.error("Error setting Directus permissions:", error);
    }
}

setPermissions();
