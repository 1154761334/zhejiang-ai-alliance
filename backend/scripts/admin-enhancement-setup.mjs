import { createDirectus, rest, authentication, readCollections, createField } from '@directus/sdk';
import 'dotenv/config';

const url = 'http://localhost:8055';
const directus = createDirectus(url)
    .with(rest())
    .with(authentication('json'));

async function setup() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("✅ Logged in to Directus.");

        // 1. Add 'source' field to 'companies'
        console.log("Checking 'companies' collection...");
        try {
            await directus.request(createField('companies', {
                field: 'source',
                type: 'string',
                meta: {
                    interface: 'select-dropdown',
                    options: {
                        choices: [
                            { text: "自主填报", value: "self_registered" },
                            { text: "秘书处代录", value: "admin_created" }
                        ]
                    },
                    width: 'half'
                },
                schema: { default_value: 'self_registered' }
            }));
            console.log("✅ Added 'source' field to 'companies'.");
        } catch (e) {
            console.log("ℹ️ 'source' field might already exist.");
        }

        // 2. Add handover fields to 'directus_users'
        console.log("Adding handover fields to 'directus_users'...");
        const userFields = [
            {
                field: 'handover_token',
                type: 'string',
                meta: { interface: 'input', hidden: true, readonly: true }
            },
            {
                field: 'handover_expires',
                type: 'timestamp',
                meta: { interface: 'datetime', hidden: true, readonly: true }
            }
        ];

        for (const fieldDef of userFields) {
            try {
                await directus.request(createField('directus_users', fieldDef));
                console.log(`✅ Added field '${fieldDef.field}' to 'directus_users'.`);
            } catch (e) {
                console.log(`ℹ️ Field '${fieldDef.field}' might already exist in 'directus_users'.`);
            }
        }

        console.log("\n🎉 Admin Enhancement Schema Setup Complete.");
    } catch (error) {
        console.error("❌ Setup failed:", error.errors || error);
    }
}

setup();
