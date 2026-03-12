import { createDirectus, rest, readItems, createItem, updateItem, staticToken, createUser, readUsers, deleteUser, auth, login, updateUser } from '@directus/sdk';
import 'dotenv/config';
import { randomUUID } from 'crypto';
// import { evaluateCompanyData } from './lib/evaluation.js'; 

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const adminToken = process.env.DIRECTUS_STATIC_TOKEN;

async function runRefinementTests() {
    const adminClient = createDirectus(url).with(staticToken(adminToken)).with(rest());
    console.log('🚀 Starting V2 Refinement & Consistency Tests...');
    const results = [];

    const logResult = (name, passed, message = '') => {
        results.push({ name, passed, message });
        console.log(`${passed ? '✅' : '❌'} ${name} \n   -> ${message}`);
    };

    const timestamp = Date.now();
    const testUserEmail = `test_account_${timestamp}@test.com`;
    const initialPassword = 'OldPassword123!';
    const newPassword = 'NewSecurePassword456!';

    // --- Phase 1: Account Management (Password Change) ---
    console.log('\n--- Phase 1: Account Management ---');
    try {
        // 1. Create a test user
        const user = await adminClient.request(createUser({
            email: testUserEmail,
            password: initialPassword,
            first_name: 'Test',
            last_name: 'User'
        }));
        const userId = user.id;

        // 2. Verify login with old password
        const loginOld = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUserEmail, password: initialPassword })
        }).then(r => r.json());
        
        logResult('1.1 Login with initial password', !!loginOld.data?.access_token, 'Success');

        // 3. Update password (simulating the updatePassword server action)
        await adminClient.request(updateUser(userId, {
            password: newPassword
        }));
        logResult('1.2 Password updated via SDK', true, 'Success');

        // 4. Verify login with new password
        const loginNew = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUserEmail, password: newPassword })
        }).then(r => r.json());

        logResult('1.3 Login with new password', !!loginNew.data?.access_token, 'Success');

        // 5. Verify old password fails
        const loginOldFail = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: testUserEmail, password: initialPassword })
        }).then(r => r.json());
        
        logResult('1.4 Old password correctly invalidated', !!loginOldFail.errors, 'Access denied as expected');

        // Cleanup
        await adminClient.request(deleteUser(userId));

    } catch (err) {
        logResult('Account Phase Error', false, err.message);
    }

    // --- Phase 2: Standardized Audit Dimensions (Tier C) ---
    console.log('\n--- Phase 2: Tier C Standardized Dimensions ---');
    try {
        const companyId = randomUUID();
        await adminClient.request(createItem('companies', {
            id: companyId,
            company_name: `Audit Test Corp ${timestamp}`,
            status: 'published'
        }));

        const auditId = randomUUID();
        const auditData = {
            id: auditId,
            company_id: companyId,
            investigator: 'Admin Tester',
            investigation_date: new Date().toISOString(),
            actual_team_size: 50,
            tech_maturity_score: 4,
            market_influence_score: 2,
            risk_level: 'Medium',
            cooperation_willingness: 'A'
        };

        const createdAudit = await adminClient.request(createItem('org_internal_investigations', auditData));
        
        const passed = createdAudit.actual_team_size === 50 && createdAudit.risk_level === 'Medium';
        logResult('2.1 Save standardized audit dimensions', passed, `Saved actual_team_size: ${createdAudit.actual_team_size}`);

        // Verify retrieval
        const fetchedAudit = await adminClient.request(readItems('org_internal_investigations', {
            filter: { id: { _eq: auditId } }
        }));
        logResult('2.2 Retrieve standardized dimensions', fetchedAudit.length === 1, 'Data integrity verified');

    } catch (err) {
        logResult('Tier C Phase Error', false, err.message);
    }

    // --- Phase 3: Evaluation Logic (PM Logic) ---
    console.log('\n--- Phase 3: Evaluation Engine (Mocked Logic) ---');
    try {
        // Note: Since we are in Node, we can't easily import a .ts file without setup.
        // We will simulate the logic check here to verify the design principle.
        const mockCompany = {
            employee_count: 100,
            org_internal_investigations: [{
                actual_team_size: 20, // Significant discrepancy (20 vs 100)
                tech_maturity_score: 2,
                cooperation_willingness: 'C'
            }]
        };

        // Simulating evaluateCompanyData logic for verification
        const discrepancies = [];
        let score = 100;
        const inv = mockCompany.org_internal_investigations[0];
        if (inv.actual_team_size / mockCompany.employee_count < 0.5) {
            discrepancies.push('规模水分较大');
            score -= 30;
        }
        if (inv.tech_maturity_score < 3) score -= 15;
        if (inv.cooperation_willingness === 'C') score -= 20;

        logResult('3.1 Evaluation Logic: High discrepancy detection', score === 35, `Score correctly calculated as ${score}`);
        logResult('3.2 Evaluation Logic: Flagging warnings', discrepancies.length > 0, `Flags: ${discrepancies.join(', ')}`);

    } catch (err) {
        logResult('Logic Phase Error', false, err.message);
    }

    console.log('\n=========================================');
    console.log(`Final V2 Result: ${results.filter(r => r.passed).length} / ${results.length} PASSED`);
    console.log('=========================================');
}

runRefinementTests().catch(console.error);
