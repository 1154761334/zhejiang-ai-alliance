import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function forcePatch() {
    console.log('--- Deep Auth & Policy Debug ---');
    
    // 1. Get Me and my permissions
    const meRes = await fetch(`${url}/users/me?fields=*,role.*`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log('Current Admin User Role:', meData.data?.role?.name, '(', meData.data?.role?.id, ')');
    console.log('Current Admin Policies:', meData.data?.role?.policies);

    // 2. Try to List ALL Policies with full details
    const pRes = await fetch(`${url}/policies?limit=-1&fields=*`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const pData = await pRes.json();
    console.log('Available Policies Count:', pData.data?.length);
    pData.data?.forEach(p => console.log(`- Policy: ${p.name} (ID: ${p.id}) AdminAccess: ${p.admin_access}`));

    // 3. Try a minimalist Policy Creation to check if it's a field restriction
    console.log('\nTrying minimalist policy creation...');
    const testPRes = await fetch(`${url}/policies`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Member Access Policy' })
    });
    const testPData = await testPRes.json();
    if (testPRes.ok) {
        console.log('SUCCESS: Created policy ID:', testPData.data.id);
        const policyId = testPData.data.id;
        
        // Link to role
        console.log('Linking to Member Role...');
        const roleId = 'e3e82743-f4f1-40ea-bf50-deb2048678b5'; // We know this from previous steps
        await fetch(`${url}/roles/${roleId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ policies: [policyId] })
        });
        console.log('Linked!');
    } else {
        console.error('FAILED minimalist creation:', JSON.stringify(testPData));
    }
}
forcePatch().catch(console.error);
