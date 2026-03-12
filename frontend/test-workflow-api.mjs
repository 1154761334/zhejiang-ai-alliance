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
    console.log('🚀 Starting API Workflow & Data Consistency Tests...');
    const results = [];

    const logResult = (name, passed, message = '') => {
        results.push({ name, passed, message });
        console.log(`${passed ? '✅' : '❌'} ${name} \n   -> ${message}`);
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

    console.log('\n--- Phase 1: Visitor (Public) Flow ---');
    try {
        const publicArticles = await visitorClient.request(readItems('articles', { limit: 1 }));
        logResult('1.1 Visitor can read public articles', true, `Got ${publicArticles.length} articles`);
    } catch (e) {
         logResult('1.1 Visitor can read public articles', false, e.message);
    }
    
    try {
        const pendingCompanies = await visitorClient.request(readItems('companies', { filter: { status: { _eq: 'pending_review' } } }));
        const accessDenied = pendingCompanies.length === 0;
        logResult('1.2 Visitor is blocked from reading unapproved companies', accessDenied, accessDenied ? 'Access successfully filtered (Hidden)' : 'Security Risk: Visitors can see pending companies!');
    } catch (e) {
        logResult('1.2 Visitor is blocked from reading unapproved companies', false, e.message);
    }

    console.log('\n--- Phase 2: Supplier A (Enterprise) Flow ---');
    try {
        console.log('   [INFO] Simulating Supplier Registration...');
        let memberRole;
        const roles = await adminClient.request(readRoles());
        const memberObj = roles.find(r => r.name === 'Member');
        if (memberObj) memberRole = memberObj.id;
        if (!memberRole) throw new Error("Member role not found!");

        await adminClient.request(createUser({ email: supplierEmail, password, role: memberRole }));
        logResult('2.1 Supplier Account Created', true, `Email: ${supplierEmail}`);

        const loginRes = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: supplierEmail, password: password })
        });
        const loginData = await loginRes.json();
        if (!loginData.data?.access_token) throw new Error("Login failed");
        supplierToken = loginData.data?.access_token;
        logResult('2.2 Supplier Login Successful', !!supplierToken, 'JWT Token acquired');

        const supplierDirectus = createDirectus(url).with(staticToken(supplierToken)).with(rest());
        await supplierDirectus.request(createItem('companies', {
            id: supplierCompanyId,
            company_name: `Test Supplier Corp ${timestamp}`,
            credit_code: `91110000X${timestamp.toString().slice(-9)}`,
            status: 'draft',
            region: '杭州市',
            address: '测试地址'
        }));
        logResult('2.3 Supplier created company profile', true, `Company ID: ${supplierCompanyId}`);

        await supplierDirectus.request(createItem('products', {
            id: supplierProductId,
            company_id: supplierCompanyId,
            name: `Test AI Agent ${timestamp}`,
            description: 'A test agent'
        }));
        logResult('2.4 Supplier added product', true, `Product ID: ${supplierProductId}`);

        const updatedCompany = await supplierDirectus.request(updateItem('companies', supplierCompanyId, { status: 'pending_review' }));
        logResult('2.5 Supplier updated company status to pending_review', updatedCompany.status === 'pending_review', 'Submitted');

    } catch (err) {
        console.error("DEBUG Phase 2 Full Error:", err);
        logResult('Phase 2 Error', false, err.message);
    }

    console.log('\n--- Phase 3: Demander B Flow ---');
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
        logResult('3.1 Demander profile created & submitted', true, `Company ID: ${demanderCompanyId}`);

        await demanderDirectus.request(createItem('survey_needs', {
            id: demanderSurveyId,
            company_id: demanderCompanyId,
            tech_need: 'Deep Learning infra'
        }));
        logResult('3.2 Demander submitted AI needs survey', true, `Survey ID: ${demanderSurveyId}`);

        let canEditOther = false;
        try {
            await demanderDirectus.request(updateItem('companies', supplierCompanyId, { company_name: 'Hacked' }));
            canEditOther = true;
        } catch(e) {}
        logResult('3.3 Role Isolation: Demander B CANNOT edit Supplier A', !canEditOther, 'Security Passed');

    } catch (err) {
        console.error("DEBUG Phase 3 Full Error:", err);
        logResult('Phase 3 Error', false, err.message);
    }

    console.log('\n--- Phase 4: Admin Approval Flow ---');
    try {
        if (supplierCompanyId && demanderCompanyId) {
            const pending = await adminClient.request(readItems('companies', { filter: { status: { _eq: 'pending_review' }, id: { _in: [supplierCompanyId, demanderCompanyId] } } }));
            logResult('4.1 Admin sees pending applications', pending.length >= 2, `Found ${pending.length} (Expected >= 2)`);

            await adminClient.request(updateItem('companies', supplierCompanyId, { status: 'published', maturity_rating: 'C' }));
            logResult('4.2 Admin approved Supplier A', true, 'Status: published');

            await adminClient.request(updateItem('companies', demanderCompanyId, { status: 'published' }));
            logResult('4.3 Admin approved Demander B', true, 'Status: published');
        }
    } catch (err) {
        console.error("DEBUG Phase 4 Full Error:", err);
        logResult('Phase 4 Error', false, err.message);
    }

    console.log('\n--- Phase 5: Data Consistency ---');
    try {
        if (supplierCompanyId) {
            const publicCompanies = await visitorClient.request(readItems('companies', { filter: { status: { _eq: 'published' }, id: { _eq: supplierCompanyId } } }));
            logResult('5.1 Visitor CAN read approved Supplier A', publicCompanies.length === 1, 'Data publicly available');
        }
    } catch (err) {
         logResult('Phase 5 Error', false, err.message);
    }

    console.log('\n=========================================');
    console.log(`Final Result: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
    console.log('=========================================');
}

runWorkflowTests().catch(console.error);
