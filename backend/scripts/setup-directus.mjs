import { createDirectus, rest, authentication, createCollection } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
    .with(rest())
    .with(authentication('json'));

async function setup() {
    try {
        // Login as admin
        await directus.login({ email: 'admin@example.com', password: 'password' });
        console.log("Logged in successfully.");

        // 1. Create articles collection
        console.log("Creating 'articles' collection...");
        await directus.request(createCollection({
            collection: 'articles',
            meta: { collection: 'articles', icon: 'article', note: '联盟动态/新闻' },
            schema: { name: 'articles' },
            fields: [
                {
                    field: 'id',
                    type: 'uuid',
                    meta: { hidden: true, readonly: true, interface: 'input' },
                    schema: { is_primary_key: true, has_auto_increment: false }
                },
                {
                    field: 'title',
                    type: 'string',
                    meta: { interface: 'input', display: 'raw' }
                },
                {
                    field: 'content',
                    type: 'text',
                    meta: { interface: 'input-rich-text-html', display: 'formatted-value' }
                },
                {
                    field: 'publish_date',
                    type: 'date',
                    meta: { interface: 'datetime', display: 'datetime' }
                },
                {
                    field: 'category',
                    type: 'string',
                    meta: { interface: 'select-dropdown', options: { choices: [{ text: "新闻动态", value: "news" }, { text: "政策", value: "policy" }] } }
                }
            ]
        }));

        // 2. Create members collection
        console.log("Creating 'members' collection...");
        await directus.request(createCollection({
            collection: 'members',
            meta: { collection: 'members', icon: 'groups', note: '联盟成员单位' },
            schema: { name: 'members' },
            fields: [
                {
                    field: 'id',
                    type: 'uuid',
                    meta: { hidden: true, readonly: true, interface: 'input' },
                    schema: { is_primary_key: true, has_auto_increment: false }
                },
                {
                    field: 'name',
                    type: 'string',
                    meta: { interface: 'input', display: 'raw' }
                },
                {
                    field: 'level',
                    type: 'string',
                    meta: { interface: 'select-dropdown', options: { choices: [{ text: "理事单位", value: "council" }, { text: "普通成员", value: "member" }, { text: "观察员", value: "observer" }] } }
                },
                {
                    field: 'website',
                    type: 'string',
                    meta: { interface: 'input', display: 'raw' }
                },
                {
                    field: 'description',
                    type: 'text',
                    meta: { interface: 'input-multiline', display: 'raw' }
                }
            ]
        }));

        // 3. Create applications collection
        console.log("Creating 'applications' collection...");
        await directus.request(createCollection({
            collection: 'applications',
            meta: { collection: 'applications', icon: 'assignment', note: '入会申请/咨询' },
            schema: { name: 'applications' },
            fields: [
                {
                    field: 'id',
                    type: 'uuid',
                    meta: { hidden: true, readonly: true, interface: 'input' },
                    schema: { is_primary_key: true, has_auto_increment: false }
                },
                {
                    field: 'company_name',
                    type: 'string',
                    meta: { interface: 'input', display: 'raw' }
                },
                {
                    field: 'contact_person',
                    type: 'string',
                    meta: { interface: 'input', display: 'raw' }
                },
                {
                    field: 'phone',
                    type: 'string',
                    meta: { interface: 'input', display: 'raw' }
                },
                {
                    field: 'status',
                    type: 'string',
                    meta: { interface: 'select-dropdown', options: { choices: [{ text: "未处理", value: "pending" }, { text: "已联系", value: "contacted" }] } },
                    schema: { default_value: 'pending' }
                }
            ]
        }));

        console.log("All collections created successfully!");

    } catch (error) {
        console.error("Error setting up Directus:", error);
    }
}

setup();
