import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkRoles() {
    const res = await fetch(`${url}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Available Roles:', d.data.map(r => ({ name: r.name, id: r.id })));
}
checkRoles();
