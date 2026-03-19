import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function linkAccess() {
    const roleId = 'e3e82743-f4f1-40ea-bf50-deb2048678b5';
    const policyId = 'd40555b5-e302-4bbf-9c1f-ac540a7d3e39';

    console.log(`Linking Role ${roleId} to Policy ${policyId}...`);
    
    // Try POST to /access (system endpoint for directus_access)
    const res = await fetch(`${url}/access`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            role: roleId,
            policy: policyId
        })
    });
    
    const data = await res.json();
    if (res.ok) {
        console.log('SUCCESS: Linked via /access. Record ID:', data.data.id);
    } else {
        console.log('FAILED /access:', JSON.stringify(data));
        // Try fallback to /items/directus_access
        const res2 = await fetch(`${url}/items/directus_access`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                role: roleId,
                policy: policyId
            })
        });
        const data2 = await res2.json();
        if (res2.ok) {
            console.log('SUCCESS: Linked via /items/directus_access. Record ID:', data2.data.id);
        } else {
            console.log('FAILED /items/directus_access:', JSON.stringify(data2));
        }
    }
}
linkAccess().catch(console.error);
