import 'dotenv/config';
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

async function setupSecretariat() {
    console.log('--- Setting up Secretariat Account ---');

    // 1. Create Secretariat Role (based on Admin for now but distinct)
    const roleName = 'Secretariat';
    const roleId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; // Fixed ID for consistency

    // Check if role exists
    const rolesRes = await fetch(`${url}/roles?filter={"name":{"_eq":"${roleName}"}}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const rolesData = await rolesRes.json();
    
    if (rolesData.data?.length === 0) {
        console.log('Creating Secretariat Role...');
        await fetch(`${url}/roles`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                id: roleId,
                name: roleName, 
                description: 'Alliance Secretariat - Review and Vetting',
                admin_access: true // Give admin access for testing convenience as requested
            })
        });
    }

    // 2. Create Secretariat User
    const email = 'secretariat@zhejiang-ai.com';
    const password = 'AllianceSecretariat2026!';
    
    console.log('Creating Secretariat User...');
    const userRes = await fetch(`${url}/users`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            password,
            role: roleId,
            first_name: 'Alliance',
            last_name: 'Secretariat'
        })
    });

    if (userRes.ok) {
        console.log('✅ Secretariat Account Created!');
        console.log('Email:', email);
        console.log('Password:', password);
    } else {
        const err = await userRes.json();
        console.log('INFO:', err.errors?.[0]?.message || 'Account might already exist.');
    }
}

setupSecretariat().catch(console.error);
