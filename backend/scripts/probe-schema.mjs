import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function probe() {
    console.log('--- Probing Companies Schema ---');
    const res = await fetch(`${url}/fields/companies/id`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('ID Field Meta:', JSON.stringify(d.data?.meta, null, 2));
    console.log('ID Field Schema:', JSON.stringify(d.data?.schema, null, 2));

    const res2 = await fetch(`${url}/items/companies?limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d2 = await res2.json();
    console.log('Recent Companies Sample:', d2.data);
    
    // Check if there is a unique index other than the primary key
    const res3 = await fetch(`${url}/fields/companies`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d3 = await res3.json();
    console.log('All Unique Fields:', d3.data.filter(f => f.schema?.is_unique).map(f => f.field));
}
probe().catch(console.error);
