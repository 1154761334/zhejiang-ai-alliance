import { createDirectus, rest, authentication, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function fixField() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("✅ Logged in to Directus.");

        console.log("Recreating 'affiliated_company_id' with proper M2O relation...");

        try {
            await directus.request(createField('directus_users', {
                field: 'affiliated_company_id',
                type: 'uuid',
                meta: {
                    interface: 'select-dropdown-m2o',
                    note: '关联的企业档案，用于会员账号绑定企业',
                    width: 'half',
                    special: ['m2o']
                },
                schema: {
                    is_foreign_key: true,
                    foreign_key_table: 'companies',
                    foreign_key_column: 'id'
                }
            }));
            console.log("✅ Field recreated with M2O relation.");
        } catch (err) {
            if (err.errors?.[0]?.message?.includes('already exists')) {
                console.log("Field already exists, updating schema...");
            }
            console.error(err.errors || err);
        }

    } catch (error) {
        console.error("❌ Error:", error.errors || error);
    }
}

fixField();