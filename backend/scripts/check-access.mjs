import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkAccess() {
    const res = await fetch(`${url}/items/directus_access`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Access Records:', d.data);
    
    // Check fields of directus_access
    const fRes = await fetch(`${url}/fields/directus_access`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const fData = await fRes.json();
    console.log('Access Fields:', fData.data.map(f => f.field));
}
checkAccess();
