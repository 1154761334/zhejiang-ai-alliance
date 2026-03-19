import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkInfo() {
    const res = await fetch(`${url}/server/info`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Server Info:', JSON.stringify(d, null, 2));
}
checkInfo();
