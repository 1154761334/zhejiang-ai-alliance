import { createDirectus, rest, authentication, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function updateSchema() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in.");

        console.log("Adding 'cover' field to 'articles'...");
        await directus.request(createField('articles', {
            field: 'cover',
            type: 'uuid',
            meta: {
                interface: 'file-image',
                display: 'image'
            },
            schema: {
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id'
            }
        }));

        console.log("Adding 'logo' field to 'members'...");
        await directus.request(createField('members', {
            field: 'logo',
            type: 'uuid',
            meta: {
                interface: 'file-image',
                display: 'image'
            },
            schema: {
                foreign_key_table: 'directus_files',
                foreign_key_column: 'id'
            }
        }));

        console.log("Fields added successfully!");

    } catch (error) {
        console.error("Error updating schema:", error);
    }
}

updateSchema();
