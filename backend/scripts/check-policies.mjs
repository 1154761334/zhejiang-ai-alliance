import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkPolicies() {
    const res = await fetch(`${url}/policies`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Policies:', d.data);
    
    // Also check roles again to see how they link to policies
    const res2 = await fetch(`${url}/roles`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d2 = await res2.json();
    console.log('Roles:', d2.data.map(r => ({ name: r.name, id: r.id, policies: r.policies })));
}
checkPolicies();
