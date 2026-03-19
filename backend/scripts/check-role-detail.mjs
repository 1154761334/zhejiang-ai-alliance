import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkRole() {
    const res = await fetch(`${url}/roles/e3e82743-f4f1-40ea-bf50-deb2048678b5`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Role Detail:', d.data);
    
    // Also list all permissions directly just in case there's an old mapping I missed
    const res2 = await fetch(`${url}/permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d2 = await res2.json();
    console.log('All Permissions sample:', d2.data?.slice(0, 5));
}
checkRole();
