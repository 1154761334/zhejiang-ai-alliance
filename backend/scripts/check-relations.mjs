import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkCollections() {
    const res = await fetch(`${url}/collections`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Collections:', d.data.map(c => c.collection));
    
    // Specifically check for policy relation tables
    const relationsRes = await fetch(`${url}/relations`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const relData = await relationsRes.json();
    const policyRels = relData.data.filter(r => r.collection.includes('policy') || r.related_collection?.includes('policy'));
    console.log('Policy Relations:', policyRels.map(r => `${r.collection}.${r.field} -> ${r.related_collection}`));
}
checkCollections();
