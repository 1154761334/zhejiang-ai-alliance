import { createDirectus, rest, readItems, createItem, updateItem, staticToken, createUser, readUsers, deleteUser, auth, login, updateUser, readRoles } from '@directus/sdk';
import 'dotenv/config';
import { randomUUID } from 'crypto';

const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const adminToken = process.env.DIRECTUS_STATIC_TOKEN;

async function runAdversarialTests() {
    const adminClient = createDirectus(url).with(staticToken(adminToken)).with(rest());
    console.log('🛡️ Starting ADVERSARIAL & DESTRUCTIVE Tests...');
    const results = [];

    const logResult = (name, passed, message = '') => {
        results.push({ name, passed, message });
        console.log(`${passed ? '✅' : '❌'} ${name} \n   -> ${message}`);
    };

    const timestamp = Date.now();
    const attackerEmail = `attacker_${timestamp}@test.com`;
    const victimEmail = `victim_${timestamp}@test.com`;
    const commonPassword = 'Password123!';

    try {
        // --- Setup: Find Member Role ---
        const roles = await adminClient.request(readRoles());
        const memberRole = roles.find(r => r.name === 'Member')?.id;
        if (!memberRole) throw new Error("Member role not found in system");

        console.log('\n--- Phase A: Security & Privilege Escalation ---');
        const attacker = await adminClient.request(createUser({ email: attackerEmail, password: commonPassword, role: memberRole }));
        const victim = await adminClient.request(createUser({ email: victimEmail, password: commonPassword, role: memberRole }));
        
        const loginAttacker = await fetch(`${url}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: attackerEmail, password: commonPassword })
        }).then(r => r.json());
        
        const attackerToken = loginAttacker.data?.access_token;
        if (!attackerToken) throw new Error("Attacker login failed");

        const attackerDirectus = createDirectus(url).with(staticToken(attackerToken)).with(rest());

        // 1. ID Hijacking
        let hijacked = false;
        try {
            await attackerDirectus.request(updateUser(victim.id, { first_name: 'Hacked' }));
            hijacked = true;
        } catch (e) {}
        logResult('A.1 ID Hijacking Blocked', !hijacked, 'Member cannot edit other users directly');

        // 2. Privilege Escalation
        let adminOpSuccessful = false;
        try {
            await attackerDirectus.request(readItems('companies', { limit: 1 }));
            adminOpSuccessful = true;
        } catch (e) {}
        logResult('A.2 Admin Resource Access Blocked', !adminOpSuccessful, 'Member cannot see admin-only collections');

        console.log('\n--- Phase B: Malformed Data Hardening ---');
        
        const companyId = randomUUID();
        await adminClient.request(createItem('companies', { id: companyId, company_name: "Original", status: 'draft' }));

        // 1. Negative/Extreme Values
        const auditId = randomUUID();
        await adminClient.request(createItem('org_internal_investigations', {
            id: auditId,
            company_id: companyId,
            actual_team_size: -999,
            tech_maturity_score: 100,
            risk_level: 'BOOM'
        }));
        logResult('B.1 Backend Vuln: Accepted negative size/extreme score', true, 'Currently accepted - NEEDS HARDENING');

        // Cleanup
        await adminClient.request(deleteUser(attacker.id));
        await adminClient.request(deleteUser(victim.id));

    } catch (err) {
        console.error("Test Error:", err.message);
    }
}

runAdversarialTests().catch(console.error);
