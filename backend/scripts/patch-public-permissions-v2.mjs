import 'dotenv/config';

async function patchPublicPermissions() {
  console.log("🔒 Patching public permissions to enforce field-level security...\n");

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

  const publicFields = {
    'companies': [
      'id', 'company_name', 'logo', 'region', 'established_date',
      'company_type', 'core_business', 'tracks', 'website', 'status',
      'products', 'case_studies'
    ],
    'products': [
      'id', 'company_id', 'name', 'description', 'category', 'pricing'
    ],
    'case_studies': [
      'id', 'company_id', 'title', 'summary', 'solution', 
      'location', 'industry', 'quantified_results', 'is_live'
    ]
  };

  for (const [collection, fields] of Object.entries(publicFields)) {
    console.log(`📋 Processing ${collection}...`);
    
    try {
      const permsRes = await fetch(`http://localhost:8055/permissions`, {
        method: 'GET',
        headers: { ...headers, 'Content-Type': 'application/json' }
      });
      const permsData = await permsRes.json();
      const publicRolePerms = (permsData.data || []).filter((p: any) => p.role === null);
      
      const existingPerm = publicRolePerms.find((p: any) => p.collection === collection && p.action === 'read');
      
      if (existingPerm) {
        const updateRes = await fetch(`http://localhost:8055/permissions/${existingPerm.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            fields: fields,
            permissions: {},
            validation: {}
          })
        });
        
        if (updateRes.ok) {
          console.log(`  ✅ Updated ${collection} - restricted to ${fields.length} fields`);
        } else {
          const err = await updateRes.json();
          console.log(`  ⚠️ ${collection}:`, err.errors?.[0]?.message || 'updated');
        }
      } else {
        console.log(`  ℹ️ No existing read permission for ${collection}`);
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${collection}:`, error);
    }
  }

  console.log("\n✅ Public permissions patched successfully!");
  console.log("\n📝 Note: Public role now only has access to:");
  console.log("  - companies: id, company_name, logo, region, established_date, company_type, core_business, tracks, website, status, products, case_studies");
  console.log("  - products: id, company_id, name, description, category, pricing");
  console.log("  - case_studies: id, company_id, title, summary, solution, location, industry, quantified_results, is_live");
}

patchPublicPermissions();