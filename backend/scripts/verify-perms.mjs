import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;
const memberPolicyId = 'd40555b5-e302-4bbf-9c1f-ac540a7d3e39';

async function verify() {
    const res = await fetch(`${url}/permissions?filter={"policy":{"_eq":"${memberPolicyId}"}}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('--- Permissions for Member Policy ---');
    d.data.forEach(p => {
        console.log(`[${p.collection} - ${p.action}] Permissions:`, JSON.stringify(p.permissions), 'Validation:', JSON.stringify(p.validation));
    });
}
verify();
