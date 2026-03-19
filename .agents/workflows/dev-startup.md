---
description: How to start the development environment and run the project locally
---

## Prerequisites
- Docker Desktop is installed and running
- Node.js v18+ is installed

## Steps

// turbo-all

1. Start Directus backend (in the project root directory):
```powershell
mkdir -p database uploads
docker-compose up -d
```
Verify Directus is running at http://localhost:8055

2. Install dependencies (frontend and scripts):
```powershell
cd frontend
npm install
cd ../backend/scripts
npm install
```

3. Initialize Directus Backend (one-time setup):
```powershell
cd backend/scripts
node setup-directus.mjs
node setup-crm-collections.mjs
node setup-permissions.mjs
node seed-test-data.mjs
node enable-registration.mjs
```

4. Start the Next.js development server:
```powershell
cd frontend
npm run dev
```
Frontend should be available at http://localhost:3000 (or 3001 if 3000 is busy).

## Key URLs
- Frontend: http://localhost:3000
- Directus Admin: http://localhost:8055 (admin@example.com / password)
- Blog: http://localhost:3000/blog
- Join: http://localhost:3000/join

## Important Files
- `lib/directus.ts` — Directus SDK client configuration and collection schemas
- `config/marketing.ts` — Navigation bar links
- `config/blog.ts` — Blog categories and author definitions
- `actions/submit-application.ts` — Server Action for join form submission
- `seed-test-data.mjs` — Test data seeding script
