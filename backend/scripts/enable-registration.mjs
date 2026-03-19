import 'dotenv/config';

async function setup() {
    // 1. Login to get fresh token
    const loginRes = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@example.com', password: 'password' }),
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.access_token;
    if (!token) { console.error("Login failed"); return; }
    console.log("✅ Got fresh token.");

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };

    // 2. Get all roles
    const rolesRes = await fetch('http://localhost:8055/roles', { headers });
    const rolesData = await rolesRes.json();
    let userRoleId = rolesData.data?.find(r => r.name === 'User')?.id;

    if (!userRoleId) {
        // Create User role
        const createRes = await fetch('http://localhost:8055/roles', {
            method: 'POST', headers,
            body: JSON.stringify({ name: 'User', icon: 'person', app_access: true, admin_access: false }),
        });
        const createData = await createRes.json();
        userRoleId = createData.data?.id;
        console.log(`✅ Created User role: ${userRoleId}`);
    } else {
        console.log(`ℹ️ User role exists: ${userRoleId}`);
    }

    // 3. Enable public registration with the User role
    const settingsRes = await fetch('http://localhost:8055/settings', {
        method: 'PATCH', headers,
        body: JSON.stringify({
            public_registration: true,
            public_registration_verify_email: false,
            public_registration_role: userRoleId,
        }),
    });

    if (settingsRes.ok) {
        console.log("✅ Public registration enabled with User role!");
    } else {
        const err = await settingsRes.json();
        console.error("Settings update failed:", JSON.stringify(err.errors, null, 2));
    }

    // 4. Add user role ID mapping to auth.config info
    console.log(`\n📋 IMPORTANT: Add this to auth.config.ts rolesMap:`);
    console.log(`   "${userRoleId}": "USER",`);

    console.log("\n🎉 Setup complete. Users can now self-register.");
}

setup();
