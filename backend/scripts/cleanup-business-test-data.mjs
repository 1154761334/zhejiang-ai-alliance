import 'dotenv/config';
import dotenv from 'dotenv';
import { createDirectus, rest, staticToken, readItems, deleteItems, readUsers, deleteUser } from '@directus/sdk';

dotenv.config({ path: new URL('../../frontend/.env', import.meta.url) });

const args = new Set(process.argv.slice(2));
const apply = args.has('--apply');
const dryRun = args.has('--dry-run') || !apply;
const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8055';
const token = process.env.DIRECTUS_STATIC_TOKEN;

const client = createDirectus(url).with(staticToken(token || '')).with(rest());

const CHILD_COLLECTIONS = [
  'products',
  'case_studies',
  'survey_needs',
  'compliance_risks',
  'org_verified_data',
  'org_internal_investigations',
];

const TEST_COMPANY_PATTERNS = [
  /测试/,
  /Smog Test/i,
  /Smoke Test/i,
  /API测试/i,
  /生命周期测试/,
  /极限测试/,
  /正式测试/,
  /原子性测试/,
  /独占测试/,
  /Smog Test AI/i,
];

const TEST_EMAIL_PATTERNS = [
  /@test\.com$/i,
  /@example\.com$/i,
  /^test[_-]/i,
  /^apitest[_-]/i,
  /^company[_-]/i,
  /^lifecycle-/i,
  /^extreme-/i,
  /^prod-/i,
  /^owner_/i,
  /^supplier_/i,
  /^demander_/i,
  /^api_supplier_/i,
  /^api_demander_/i,
  /^attacker_/i,
  /^victim_/i,
  /^regtest/i,
  /^ratelimit/i,
];

const TEST_SOURCES = new Set([
  'test',
  'seed',
  'seed_test',
  'test_seed',
  'e2e',
  'api_test',
  'batch_test',
]);

function usage() {
  console.log(`
Usage:
  node backend/scripts/cleanup-business-test-data.mjs --dry-run
  node backend/scripts/cleanup-business-test-data.mjs --apply

Default mode is --dry-run. This script only targets business test data:
companies matched by test-like names/source/emails, their child records,
and test-like users. It does not delete articles, real members, settings,
roles, policies, or admin users.
`);
}

function isTestEmail(email) {
  const value = String(email || '').trim();
  if (!value) return false;
  return TEST_EMAIL_PATTERNS.some((pattern) => pattern.test(value));
}

function isTestCompany(company) {
  const name = String(company.company_name || '').trim();
  const source = String(company.source || '').trim();
  const email = String(company.contact_email || '').trim();

  if (TEST_SOURCES.has(source)) return true;
  if (isTestEmail(email)) return true;
  return TEST_COMPANY_PATTERNS.some((pattern) => pattern.test(name));
}

function idOf(value) {
  if (!value) return null;
  if (typeof value === 'object') return value.id || null;
  return value;
}

async function safeReadItems(collection, query) {
  try {
    return await client.request(readItems(collection, query));
  } catch (error) {
    console.log(`WARN: Could not read ${collection}: ${error.errors?.[0]?.message || error.message}`);
    return [];
  }
}

async function safeReadFields(collection) {
  try {
    const res = await fetch(`${url}/fields/${collection}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.errors?.[0]?.message || res.statusText);
    return new Set((data.data || []).map((field) => field.field));
  } catch (error) {
    console.log(`WARN: Could not read fields for ${collection}: ${error.message}`);
    return null;
  }
}

async function safeReadUsers(query) {
  try {
    return await client.request(readUsers(query));
  } catch (error) {
    console.log(`WARN: Could not read users: ${error.errors?.[0]?.message || error.message}`);
    return [];
  }
}

async function safeDeleteItems(collection, ids) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (!uniqueIds.length) return 0;
  if (dryRun) return uniqueIds.length;

  await client.request(deleteItems(collection, uniqueIds));
  return uniqueIds.length;
}

async function main() {
  if (args.has('--help') || args.has('-h')) {
    usage();
    return;
  }

  if (!token) {
    throw new Error('DIRECTUS_STATIC_TOKEN is required. Put it in frontend/.env or the current environment.');
  }

  console.log(`Mode: ${dryRun ? 'dry-run' : 'apply'}`);
  console.log(`Directus: ${url}`);

  const companyFields = await safeReadFields('companies');
  const requestedCompanyFields = ['id', 'company_name', 'contact_email'];
  if (!companyFields || companyFields.has('source')) requestedCompanyFields.push('source');
  if (!companyFields || companyFields.has('user_created')) requestedCompanyFields.push('user_created');

  const companies = await safeReadItems('companies', {
    fields: requestedCompanyFields,
    limit: -1,
  });

  const testCompanies = companies.filter(isTestCompany);
  const testCompanyIds = testCompanies.map((company) => company.id).filter(Boolean);
  const linkedUserIds = new Set(testCompanies.map((company) => idOf(company.user_created)).filter(Boolean));

  console.log(`Matched test companies: ${testCompanies.length}`);
  for (const company of testCompanies.slice(0, 30)) {
    console.log(`  - ${company.company_name || '(unnamed)'} [${company.contact_email || 'no email'}]`);
  }
  if (testCompanies.length > 30) {
    console.log(`  ... ${testCompanies.length - 30} more`);
  }

  const childDeletePlan = {};
  for (const collection of CHILD_COLLECTIONS) {
    if (!testCompanyIds.length) {
      childDeletePlan[collection] = [];
      console.log(`Matched ${collection}: 0`);
      continue;
    }

    const rows = await safeReadItems(collection, {
      fields: ['id', 'company_id'],
      filter: { company_id: { _in: testCompanyIds } },
      limit: -1,
    });
    childDeletePlan[collection] = rows.map((row) => row.id).filter(Boolean);
    console.log(`Matched ${collection}: ${childDeletePlan[collection].length}`);
  }

  const users = await safeReadUsers({
    fields: ['id', 'email', 'first_name'],
    limit: -1,
  });

  const usersToDelete = users.filter((user) => {
    if (String(user.email || '').toLowerCase() === 'admin@example.com') return false;
    return isTestEmail(user.email) || linkedUserIds.has(user.id);
  });

  console.log(`Matched test users: ${usersToDelete.length}`);
  for (const user of usersToDelete.slice(0, 30)) {
    console.log(`  - ${user.email}`);
  }
  if (usersToDelete.length > 30) {
    console.log(`  ... ${usersToDelete.length - 30} more`);
  }

  if (dryRun) {
    console.log('\nDry-run only. Re-run with --apply to delete the matched business test data.');
    return;
  }

  for (const [collection, ids] of Object.entries(childDeletePlan)) {
    const count = await safeDeleteItems(collection, ids);
    console.log(`Deleted ${count} from ${collection}`);
  }

  const companyCount = await safeDeleteItems('companies', testCompanyIds);
  console.log(`Deleted ${companyCount} from companies`);

  let deletedUsers = 0;
  for (const user of usersToDelete) {
    await client.request(deleteUser(user.id));
    deletedUsers += 1;
  }
  console.log(`Deleted ${deletedUsers} users`);
}

main().catch((error) => {
  console.error('Cleanup failed:', error.errors?.[0]?.message || error.message);
  process.exit(1);
});
