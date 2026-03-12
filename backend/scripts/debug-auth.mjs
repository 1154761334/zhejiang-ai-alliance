import { createDirectus, rest, staticToken, readMe } from '@directus/sdk';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

const client = createDirectus(url).with(staticToken(token)).with(rest());

async function check() {
    try {
        const me = await client.request(readMe({ fields: ['*'] }));
        console.log('Logged in as:', me.email);
        console.log('Role:', me.role);
    } catch (e) {
        console.error('Check failed:', e);
    }
}
check();
