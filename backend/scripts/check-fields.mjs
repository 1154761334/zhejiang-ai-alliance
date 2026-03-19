import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkFields() {
    const res = await fetch(`${url}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Fields:', Object.keys(d.data?.[0] || {}));
    console.log('Sample Permission:', d.data?.[0]);
}
checkFields();
