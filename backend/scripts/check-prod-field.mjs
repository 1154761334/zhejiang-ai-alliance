import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function checkField() {
    const res = await fetch(`${url}/fields/products/user_created`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const d = await res.json();
    console.log('Product User Created Info:', JSON.stringify(d.data, null, 2));
}
checkField();
