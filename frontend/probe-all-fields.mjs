import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function probe() {
    const collections = ['companies', 'products', 'survey_needs'];
    for (const c of collections) {
        const res = await fetch(`${url}/fields/${c}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const d = await res.json();
        console.log(`Fields for ${c}:`, d.data.map(f => f.field));
    }
}
probe().catch(console.error);
