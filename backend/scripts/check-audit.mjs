import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN; // Admin for checking

async function checkAudit() {
    // Get latest items from companies
    const res = await fetch(`${url}/items/companies?sort=-date_created&limit=5&fields=id,company_name,user_created`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Latest Companies Audit:', d.data.map(c => ({ name: c.company_name, user: c.user_created })));
}
checkAudit();
