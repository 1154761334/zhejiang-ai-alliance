import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkSchema() {
    for (const col of ['companies', 'products']) {
        const res = await fetch(`${url}/fields/${col}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const d = await res.json();
        console.log(`--- Fields for ${col} ---`);
        d.data.forEach(f => {
            console.log(`Field: ${f.field}, Type: ${f.type}, Special: ${JSON.stringify(f.meta?.special)}`);
        });
    }
}
checkSchema();
