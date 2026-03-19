import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkRelations() {
    console.log('--- Probing Relations for Custom Collections ---');
    const res = await fetch(`${url}/relations`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    const targets = ['products', 'case_studies', 'survey_needs', 'compliance_risks'];
    const filtered = d.data? d.data.filter(r => targets.includes(r.collection)) : [];
    
    if (filtered.length === 0) {
        console.log('No formal relations found in directus_relations for these collections.');
        console.log('They might be standard fields without formal FK constraints in Directus.');
    } else {
        filtered.forEach(r => {
            console.log(`- ${r.collection}.${r.field} -> ${r.related_collection}`);
        });
    }
}
checkRelations();
