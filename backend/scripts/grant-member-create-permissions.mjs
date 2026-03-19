import { createDirectus, rest, staticToken, createPermission, readPermissions } from '@directus/sdk';

const client = createDirectus('http://localhost:8055')
  .with(staticToken('zhejiang-ai-alliance-static-token'))
  .with(rest());

const MEMBER_ROLE_ID = 'e3e82743-f4f1-40ea-bf50-deb2048678b5';

async function grantPermissions() {
  const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];
  
  try {
    const existing = await client.request(readPermissions());
    
    for (const collection of collections) {
      const hasCreate = existing.some(p => p.role === MEMBER_ROLE_ID && p.collection === collection && p.action === 'create');
      
      if (!hasCreate) {
        console.log(`Granting CREATE to Member for ${collection}...`);
        await client.request(createPermission({
          role: MEMBER_ROLE_ID,
          collection: collection,
          action: 'create',
          permissions: {}, // No nested constraints for create usually
          validation: {},
          fields: ['*']
        }));
      } else {
        console.log(`Member already has CREATE for ${collection}.`);
      }
    }
    console.log('Permissions update complete.');
  } catch (err) {
    console.error('Error updating permissions:', err);
  }
}

grantPermissions();
