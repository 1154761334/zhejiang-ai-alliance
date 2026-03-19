import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function probe() {
    const cs = await fetch(`${url}/fields/case_studies`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
    console.log('CS Fields:', cs.data?.map(f => f.field));
    const cr = await fetch(`${url}/fields/compliance_risks`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json());
    console.log('CR Fields:', cr.data?.map(f => f.field));
}
probe();
