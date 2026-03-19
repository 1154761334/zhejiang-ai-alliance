import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function patchPublic() {
    // 1. Find Public Policy (usually linked to the Public role)
    const pRes = await fetch(`${url}/policies?fields=id,name`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const pData = await pRes.json();
    const publicPolicy = pData.data.find(p => p.name.toLowerCase().includes('public'));
    
    if (!publicPolicy) {
        console.log('Public Policy not found by name, trying known ID from sample...');
        // In previous sample, ID was abf8a154-5b1c-4a46-ac9c-7300570f4f17
        const knownId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
        await grant(knownId);
    } else {
        await grant(publicPolicy.id);
    }
}

async function grant(policyId) {
    console.log(`Granting read on companies/products to Public Policy: ${policyId}`);
    const targets = [
        { collection: 'companies', action: 'read', permissions: { status: { _eq: 'published' } } },
        { collection: 'products', action: 'read', permissions: {} }
    ];

    for (const target of targets) {
        const res = await fetch(`${url}/permissions`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                policy: policyId,
                collection: target.collection,
                action: target.action,
                fields: ['*'],
                permissions: target.permissions
            })
        });
        if (res.ok) console.log(`SUCCESS: ${target.collection} read granted.`);
        else {
             const err = await res.json();
             console.log(`INFO: ${target.collection} -> ${err.errors?.[0]?.message || 'Already exists/Error'}`);
        }
    }
}
patchPublic();
