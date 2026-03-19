import { createDirectus, rest, staticToken, readItems } from "@directus/sdk";
import 'dotenv/config';

console.log("Token:", process.env.DIRECTUS_STATIC_TOKEN);

async function testFetch() {
    try {
        const client = createDirectus(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8055")
            .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN || ""))
            .with(rest());

        const companies = await client.request(readItems('companies', {
            fields: ['role', 'tracks', 'region', 'company_type'],
            limit: -1,
        }));

        console.log("Success! Fetched", companies.length, "companies.");
    } catch (err) {
        console.error("SDK Error:", err);
    }
}

testFetch();
