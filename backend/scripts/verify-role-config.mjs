import 'dotenv/config';

async function verifyRoleConfig() {
  console.log("🔍 Verifying role configuration...\n");

  const loginRes = await fetch('http://localhost:8055/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'password' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.access_token;
  if (!token) {
    console.error("❌ Login failed");
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  const rolesRes = await fetch('http://localhost:8055/roles', { headers });
  const rolesData = await rolesRes.json();
  const roles = rolesData.data || [];

  console.log("📋 Current roles in system:");
  roles.forEach(r => {
    console.log(`  - ${r.name}: ${r.id} (admin_access: ${r.admin_access}, app_access: ${r.app_access})`);
  });

  const requiredRoles = [
    { name: 'Administrator', expectedAdmin: true },
    { name: 'Secretary', expectedAdmin: true },
    { name: 'Member', expectedAdmin: false },
    { name: 'User', expectedAdmin: false },
  ];

  console.log("\n✅ Verification Results:");
  
  for (const req of requiredRoles) {
    const existing = roles.find(r => r.name === req.name);
    if (existing) {
      if (existing.admin_access === req.expectedAdmin) {
        console.log(`  ✓ ${req.name}: Correct configuration`);
      } else {
        console.log(`  ⚠️ ${req.name}: Admin access mismatch (expected: ${req.expectedAdmin}, actual: ${existing.admin_access})`);
      }
    } else {
      console.log(`  ✗ ${req.name}: Role not found`);
    }
  }

  const settingsRes = await fetch('http://localhost:8055/settings', { headers });
  const settingsData = await settingsRes.json();
  const settings = settingsData.data || {};

  console.log("\n📋 Authentication settings:");
  console.log(`  - Public registration: ${settings.public_registration}`);
  console.log(`  - Email verification: ${settings.public_registration_verify_email}`);
  console.log(`  - Default role: ${settings.public_registration_role}`);

  const defaultRole = roles.find(r => r.id === settings.public_registration_role);
  console.log(`  - Default role name: ${defaultRole?.name || 'Unknown'}`);

  console.log("\n📝 Environment Variables Reference:");
  const roleIdMap = {
    ADMIN: roles.find(r => r.name === 'Administrator' || r.name === 'Secretary')?.id,
    MEMBER: roles.find(r => r.name === 'Member')?.id,
    USER: roles.find(r => r.name === 'User')?.id,
  };
  
  console.log(`  DIRECTUS_ADMIN_ROLE_ID=${roleIdMap.ADMIN}`);
  console.log(`  DIRECTUS_MEMBER_ROLE_ID=${roleIdMap.MEMBER}`);
  console.log(`  DIRECTUS_USER_ROLE_ID=${roleIdMap.USER}`);

  console.log("\n✅ Verification complete!");
}

verifyRoleConfig();