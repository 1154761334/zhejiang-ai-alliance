import { createDirectus, rest, authentication, readCollections, createCollection, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function setupMissing() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        const collections = await directus.request(readCollections());
        const collectionNames = collections.map(c => c.collection);

        const targets = ['products', 'case_studies', 'survey_needs', 'compliance_risks'];

        for (const name of targets) {
            if (!collectionNames.includes(name)) {
                console.log(`Creating collection: ${name}`);
                await directus.request(createCollection({
                    collection: name,
                    meta: { collection: name, icon: 'extension' },
                    schema: { name: name },
                    fields: [
                        { field: 'id', type: 'uuid', meta: { hidden: true, readonly: true }, schema: { is_primary_key: true, has_auto_increment: false } },
                        { field: 'company_id', type: 'uuid', meta: { interface: 'select-dropdown-m2o' }, schema: { is_primary_key: false, foreign_key_table: 'companies', foreign_key_column: 'id' } }
                    ]
                }));
            } else {
                console.log(`Collection ${name} already exists.`);
            }
        }

        console.log("Missing collections created!");

    } catch (error) {
        console.error("Error setting up missing collections:", error.errors || error);
    }
}

setupMissing();
