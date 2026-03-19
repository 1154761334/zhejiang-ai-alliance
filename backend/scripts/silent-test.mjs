import { createDirectus, rest, readItems, createItem, updateItem, authentication, createUser, updateUser, readUsers, deleteUser, deleteItem, staticToken, readRoles } from '@directus/sdk';
import 'dotenv/config';
import { randomUUID } from 'crypto';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';

async function getAdminClient() {
    const token = process.env.DIRECTUS_STATIC_TOKEN;
    if (token) {
        return createDirectus(url).with(staticToken(token)).with(rest());
    }
    const loginRes = await fetch(`${url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
    });
    const loginData = await loginRes.json();
    if (!loginData.data?.access_token) throw new Error("Admin login failed");
    return createDirectus(url).with(staticToken(loginData.data.access_token)).with(rest());
}

const visitorClient = createDirectus(url).with(rest());

async function runWorkflowTests() {
    const adminClient = await getAdminClient();
    const results = [];

    const logResult = (name, passed, message = '') => {
        results.push({ name, passed, message });
        if (!passed) console.log(`FAILED: ${name} -> ${message}`);
    };

    const timestamp = Date.now();
    const supplierEmail = `api_supplier_${timestamp}@test.com`;
    const demanderEmail = `api_demander_${timestamp}@test.com`;
    const password = 'TestPassword123!';

    let supplierToken = '';
    let demanderToken = '';
    let supplierCompanyId = randomUUID();
    let demanderCompanyId = randomUUID();
    let supplierProductId = randomUUID();
    let demanderSurveyId = randomUUID();

    try {
        const publicArticles = await visitorClient.request(readItems('articles', { limit: 1 }));
        logResult('1.1 Visitor can read public articles', true);
    } catch (e) { logResult('1.1 Visitor can read public articles', false, e.message); }
    
    try {
        let accessDenied = false;
        try {
             await visitorClient.request(readItems('companies', { filter: { status: { _eq: 'pending_review' } } }));
        } catch(e) { accessDenied = true; }
        logResult('1.2 Visitor is blocked from reading unapproved companies', accessDenied);
    } catch (e) { logResult('1.2 Visitor is blocked from reading unapproved companies', false, e.message); }

    try {
        let memberRole;
        const roles = await adminClient.request(readRoles());
        const memberObj = roles.find(r => r.name === 'Member');
        if (memberObj) memberRole = memberObj.id;
        if (!memberRole) throw new Error("Member role not found!");

        await adminClient.request(createUser({ email: supplierEmail, password, role: memberRole }));
        logResult('2.1 Supplier Account Created', true);

        const loginRes = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: supplierEmail, password: password })
        });
        const loginData = await loginRes.json();
        supplierToken = loginData.data?.access_token;
        logResult('2.2 Supplier Login Successful', !!supplierToken);

        const supplierDirectus = createDirectus(url).with(staticToken(supplierToken)).with(rest());
        await supplierDirectus.request(createItem('companies', {
            id: supplierCompanyId,
            company_name: `Test Supplier Corp ${timestamp}`,
            credit_code: `91110000X${timestamp.toString().slice(-9)}`,
            status: 'draft',
            region: '杭州市'
        }));
        logResult('2.3 Supplier created company profile', true);

        await supplierDirectus.request(createItem('products', {
            id: supplierProductId,
            company_id: supplierCompanyId,
            name: `Test AI Agent ${timestamp}`
        }));
        logResult('2.4 Supplier added product', true);

        const updatedCompany = await supplierDirectus.request(updateItem('companies', supplierCompanyId, { status: 'pending_review' }));
        logResult('2.5 Supplier updated company status to pending_review', updatedCompany.status === 'pending_review');
    } catch (err) { logResult('Phase 2 Error', false, err.message); }

    try {
        let memberRole;
        const roles = await adminClient.request(readRoles());
        const memberObj = roles.find(r => r.name === 'Member');
        if (memberObj) memberRole = memberObj.id;

        await adminClient.request(createUser({ email: demanderEmail, password, role: memberRole }));
        
        const reqDemanderLogin = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: demanderEmail, password: password })
        });
        const demanderLoginData = await reqDemanderLogin.json();
        demanderToken = demanderLoginData.data?.access_token;
        
        const demanderDirectus = createDirectus(url).with(staticToken(demanderToken)).with(rest());
        await demanderDirectus.request(createItem('companies', {
            id: demanderCompanyId,
            company_name: `Test Demander Corp ${timestamp}`,
            credit_code: `92220000Y${timestamp.toString().slice(-9)}`,
            status: 'pending_review'
        }));
        logResult('3.1 Demander profile created & submitted', true);

        await demanderDirectus.request(createItem('survey_needs', {
            id: demanderSurveyId,
            company_id: demanderCompanyId,
            tech_need: 'Deep Learning infra'
        }));
        logResult('3.2 Demander submitted AI needs survey', true);

        let canEditOther = false;
        try {
            await demanderDirectus.request(updateItem('companies', supplierCompanyId, { company_name: 'Hacked' }));
            canEditOther = true;
        } catch(e) {}
        logResult('3.3 Role Isolation: Demander B CANNOT edit Supplier A', !canEditOther);
    } catch (err) { logResult('Phase 3 Error', false, err.message); }

    try {
        if (supplierCompanyId && demanderCompanyId) {
            const pending = await adminClient.request(readItems('companies', { filter: { status: { _eq: 'pending_review' }, id: { _in: [supplierCompanyId, demanderCompanyId] } } }));
            logResult('4.1 Admin sees pending applications', pending.length >= 2, `Found ${pending.length}`);

            await adminClient.request(updateItem('companies', supplierCompanyId, { status: 'published', maturity_rating: 'C' }));
            logResult('4.2 Admin approved Supplier A', true);

            await adminClient.request(updateItem('companies', demanderCompanyId, { status: 'published' }));
            logResult('4.3 Admin approved Demander B', true);
        }
    } catch (err) { logResult('Phase 4 Error', false, err.message); }

    try {
        if (supplierCompanyId) {
            const publicCompanies = await visitorClient.request(readItems('companies', { filter: { status: { _eq: 'published' }, id: { _eq: supplierCompanyId } } }));
            logResult('5.1 Visitor CAN read approved Supplier A', publicCompanies.length === 1);
        }
    } catch (err) { logResult('Phase 5 Error', false, err.message); }

    console.log(`Summary: ${results.filter(r => r.passed).length}/${results.length} PASSED`);
}
runWorkflowTests();
