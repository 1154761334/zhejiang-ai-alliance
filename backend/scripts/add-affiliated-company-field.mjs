import { createDirectus, rest, authentication, createField } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function addAffiliatedCompanyField() {
    try {
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("✅ Logged in to Directus.");

        console.log("Adding 'affiliated_company_id' field to 'directus_users'...");
        
        try {
            await directus.request(createField('directus_users', {
                field: 'affiliated_company_id',
                type: 'uuid',
                meta: {
                    interface: 'select-dropdown-m2o',
                    note: '关联的企业档案，用于会员账号绑定企业',
                    width: 'half'
                },
                schema: {
                    is_foreign_key: true,
                    foreign_key_table: 'companies',
                    foreign_key_column: 'id',
                    on_delete: 'SET NULL'
                }
            }));
            console.log("✅ Field 'affiliated_company_id' created successfully.");
        } catch (fieldError) {
            if (fieldError.errors?.[0]?.message?.includes('already exists')) {
                console.log("ℹ️ Field 'affiliated_company_id' already exists.");
            } else {
                console.error("❌ Failed to create field:", fieldError.errors || fieldError);
            }
        }

        console.log("\n🎉 Setup complete.");
    } catch (error) {
        console.error("❌ Setup failed:", error.errors || error);
    }
}

addAffiliatedCompanyField();