import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkFinal() {
    const cRes = await fetch(`${url}/items/companies?limit=1&fields=id,company_name,owner_id,user_created`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cData = await cRes.json();
    console.log('Company Sample:', cData.data?.[0]);

    const pRes = await fetch(`${url}/items/products?limit=1&fields=id,name,user_created`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const pData = await pRes.json();
    console.log('Product Sample:', pData.data?.[0]);
}
checkFinal();
