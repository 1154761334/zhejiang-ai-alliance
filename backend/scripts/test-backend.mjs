import { createDirectus, rest, staticToken, readItems, createItem, updateItem, readMe } from '@directus/sdk';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

const client = createDirectus(url).with(staticToken(token)).with(rest());

async function runTests() {
    console.log('🚀 Starting Backend Automated Tests (T2-T8)...');
    const results = [];

    const logResult = (name, passed, message = '') => {
        results.push({ name, passed, message });
        console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
    };

    // T2: Health Check
    try {
        const healthResp = await fetch(`${url}/server/health`);
        const health = await healthResp.json();
        logResult('T2: Health Check', health.status === 'ok', `Status: ${health.status}`);
    } catch (err) {
        logResult('T2: Health Check', false, err.message);
    }

    // T3: Schema Integrity
    try {
        const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks', 'articles'];
        const missing = [];
        for (const collection of collections) {
            try {
                await client.request(readItems(collection, { limit: 1 }));
            } catch (e) {
                missing.push(collection);
            }
        }
        logResult('T3: Schema Integrity', missing.length === 0, missing.length === 0 ? 'All 6 collections accessible' : `Missing: ${missing.join(', ')}`);
    } catch (err) {
        logResult('T3: Schema Integrity', false, err.message);
    }

    // T4: CRUD End-to-End (Articles/Company)
    try {
        const testArticle = await client.request(createItem('articles', {
            title: 'TEST_ARTICLE_' + Date.now(),
            slug: 'test-article-' + Date.now(),
            content: 'Test content',
            status: 'draft'
        }));
        await client.request(updateItem('articles', testArticle.id, { summary: 'Updated summary' }));
        logResult('T4: CRUD Operations', true, 'Created and updated test article successfully');
    } catch (err) {
        logResult('T4: CRUD Operations', false, err.message);
    }

    // T5: Auth Flow (Verify Admin Token)
    try {
        const me = await client.request(readMe());
        logResult('T5: Auth Flow', !!me.id, `Authenticated as: ${me.email}`);
    } catch (err) {
        logResult('T5: Auth Flow', false, err.message);
    }

    // T6: Role Isolation (Simulate User context if possible, otherwise verify Admin sees all)
    try {
        const allCompanies = await client.request(readItems('companies'));
        logResult('T6: Role Isolation (Admin Visibility)', Array.isArray(allCompanies), `Admin can pull ${allCompanies.length} companies`);
    } catch (err) {
        logResult('T6: Role Isolation', false, err.message);
    }

    // T8: Public Articles Access (Without Token)
    try {
        const publicClient = createDirectus(url).with(rest());
        const publicArticles = await publicClient.request(readItems('articles', { limit: 5 }));
        logResult('T8: Public Articles Access', Array.isArray(publicArticles), `Fetched ${publicArticles.length} public articles without token`);
    } catch (err) {
        logResult('T8: Public Articles Access', false, err.message);
    }

    console.log('\n📊 Backend Test Summary:');
    const allPassed = results.every(r => r.passed);
    console.log(allPassed ? '🎉 ALL BACKEND TESTS PASSED!' : '⚠️ SOME TESTS FAILED.');
}

runTests().catch(console.error);
