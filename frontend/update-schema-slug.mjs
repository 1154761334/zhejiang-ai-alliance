import { createDirectus, rest, authentication, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function updateSchema() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in.");

        console.log("Adding 'slug' field to 'articles'...");
        await directus.request(createField('articles', {
            field: 'slug',
            type: 'string',
            meta: { interface: 'input', display: 'raw' }
        }));

        console.log("Adding 'summary' field to 'articles'...");
        await directus.request(createField('articles', {
            field: 'summary',
            type: 'text',
            meta: { interface: 'input-multiline', display: 'raw' }
        }));

        console.log("Fields added successfully!");

    } catch (error) {
        console.error("Error updating schema:", error);
    }
}

updateSchema();
