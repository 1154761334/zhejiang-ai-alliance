import { createDirectus, rest, authentication, readRoles } from '@directus/sdk';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const directus = createDirectus(url).with(rest()).with(authentication('json'));

async function debugRoles() {
    await directus.login({ email: 'admin@example.com', password: 'password' });
    const roles = await directus.request(readRoles());
    console.log("ROLES TYPE:", typeof roles, "IS ARRAY:", Array.isArray(roles));
    console.log("ROLES SAMPLE:", JSON.stringify(roles, null, 2));

    const policies = await directus.request(() => ({ path: '/policies', method: 'GET' }));
    console.log("POLICIES SAMPLE:", JSON.stringify(policies, null, 2));
}

debugRoles().catch(console.error);
