
import { createDirectus, rest, authentication, createPermission } from '@directus/sdk';

const directus = createDirectus('http://localhost:8055')
  .with(rest())
  .with(authentication('json'));

async function setupPermissions() {
  try {
    await directus.login({ email: 'admin@example.com', password: 'password' });
    console.log("Logged in successfully.");

    const USER_POLICY = 'be2099d3-2e6d-4543-8a01-6dd27b490f4f';
    const collections = ['companies', 'products', 'case_studies', 'survey_needs', 'compliance_risks'];
    const actions = ['create', 'read', 'update'];

    for (const collection of collections) {
      for (const action of actions) {
        try {
          console.log(`Granting ${action} on ${collection}...`);
          await directus.request(createPermission({
            policy: USER_POLICY,
            collection: collection,
            action: action,
            fields: ['*'],
            permissions: (action === 'read' || action === 'update') ? { user_created: { _eq: '$CURRENT_USER' } } : {}
          }));
        } catch (err) {
          if (Array.isArray(err.errors) && err.errors[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
            console.log(`  - Permission already exists.`);
          } else {
            console.warn(`  - Warning/Error: ${JSON.stringify(err.errors || err.message)}`);
          }
        }
      }
    }

    console.log("Full permissions setup complete!");
  } catch (error) {
    console.error("Fatal error during permission setup:", error.errors || error);
  }
}

setupPermissions();
