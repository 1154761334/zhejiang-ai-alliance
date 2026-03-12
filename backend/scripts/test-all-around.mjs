import { createDirectus, rest, readItems, createItem, updateItem, authentication, createUser, updateUser, readUsers, deleteUser, deleteItem, staticToken, readRoles } from '@directus/sdk';
import 'dotenv/config';
import { randomUUID } from 'crypto';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';

async function getAdminClient() {
    const token = process.env.DIRECTUS_STATIC_TOKEN;
    if (token) return createDirectus(url).with(staticToken(token)).with(rest());
    throw new Error("Admin token required for testing setup.");
}

const visitorClient = createDirectus(url).with(rest());

async function runDeepTests() {
    const adminClient = await getAdminClient();
    console.log('🚀 Starting ALL-AROUND API Coverage & Security Tests...');
    const results = [];

    const logResult = (name, passed, message = '') => {
        results.push({ name, passed, message });
        console.log(`${passed ? '✅' : '❌'} ${name} ${message ? '-> ' + message : ''}`);
    };

    const timestamp = Date.now();
    const supplierEmail = `supplier_all_${timestamp}@test.com`;
    const demanderEmail = `demander_all_${timestamp}@test.com`;
    const password = 'TestPassword123!';

    let supplierToken, demanderToken;
    let sCompId = randomUUID(), dCompId = randomUUID();
    let sProdId = randomUUID(), sCaseId = randomUUID(), sRiskId = randomUUID();
    let dSurveyId = randomUUID();

    try {
        let memberRole;
        const roles = await adminClient.request(readRoles());
        memberRole = roles.find(r => r.name === 'Member')?.id;

        // Setup Users
        await adminClient.request(createUser({ email: supplierEmail, password, role: memberRole }));
        await adminClient.request(createUser({ email: demanderEmail, password, role: memberRole }));

        const sLogin = await fetch(`${url}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: supplierEmail, password }) }).then(r => r.json());
        supplierToken = sLogin.data?.access_token;
        const dLogin = await fetch(`${url}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: demanderEmail, password }) }).then(r => r.json());
        demanderToken = dLogin.data?.access_token;

        const sClient = createDirectus(url).with(staticToken(supplierToken)).with(rest());
        const dClient = createDirectus(url).with(staticToken(demanderToken)).with(rest());

        console.log('\n--- Phase A: Supplier Deep Content ---');
        await sClient.request(createItem('companies', { id: sCompId, company_name: 'Supplier Corp', status: 'draft' }));
        logResult('A.1 Company Created', true);

        await sClient.request(createItem('products', { id: sProdId, company_id: sCompId, name: 'AI Core' }));
        logResult('A.2 Product Created', true);

        await sClient.request(createItem('case_studies', { id: sCaseId, company_id: sCompId, title: 'Smart Factory Project' }));
        logResult('A.3 Case Study Created', true);

        await sClient.request(createItem('compliance_risks', { id: sRiskId, company_id: sCompId, data_security_measures: 'AES-256' }));
        logResult('A.4 Compliance Risk Created', true);

        console.log('\n--- Phase B: Demander Isolation & Cross-Linking ---');
        await dClient.request(createItem('companies', { id: dCompId, company_name: 'Demander Corp', status: 'pending_review' }));
        
        // Security Test: Demander attempts to link their Survey to Supplier's Company
        let canCrossLink = false;
        try {
            await dClient.request(createItem('survey_needs', { id: dSurveyId, company_id: sCompId, tech_need: 'Theft' }));
            canCrossLink = true;
        } catch(e) {}
        // Note: Directus might allow this if company_id is just a UUID field without validation. 
        // Real security should check if the company being linked is OWNED by the current user.
        logResult('B.1 Cross-Linking Blocked (Company Ownership)', !canCrossLink, canCrossLink ? 'VULNERABILITY: Can link survey to others company!' : 'Security Passed');

        // Security Test: Demander attempts to edit Supplier's Product
        let canEditOtherProd = false;
        try {
            await dClient.request(updateItem('products', sProdId, { name: 'Hacked' }));
            canEditOtherProd = true;
        } catch(e) {}
        logResult('B.2 Cross-Edit Product Blocked', !canEditOtherProd);

        console.log('\n--- Phase C: Public Filtering (Visitor) ---');
        // Admin publishes Supplier but leaves Demander pending
        await adminClient.request(updateItem('companies', sCompId, { status: 'published' }));
        
        const pubComps = await visitorClient.request(readItems('companies', { filter: { id: { _in: [sCompId, dCompId] } } }));
        logResult('C.1 Public can see Published Supplier', pubComps.find(c => c.id === sCompId) !== undefined);
        logResult('C.2 Public CANNOT see Pending Demander', pubComps.find(c => c.id === dCompId) === undefined);

        console.log('\n--- Phase D: Data Integrity (Cleanup) ---');
        await sClient.request(deleteItem('products', sProdId));
        logResult('D.1 Supplier can delete own product', true);

        let canDeleteOtherComp = false;
        try {
            await sClient.request(deleteItem('companies', dCompId));
            canDeleteOtherComp = true;
        } catch(e) {}
        logResult('D.2 Supplier CANNOT delete Demander company', !canDeleteOtherComp);

    } catch (err) {
        console.error("CRITICAL TEST FAILURE:", err);
        logResult('Global Failure', false, err.message);
    }

    console.log('\n' + '='.repeat(40));
    console.log(`TOTAL PASSED: ${results.filter(r => r.passed).length} / ${results.length}`);
    console.log('='.repeat(40));
    
    // Final check for the 100% goal
    if (results.every(r => r.passed)) console.log('🏆 ALL CORE SYSTEMS VERIFIED NORMALLY');
}
runDeepTests();
