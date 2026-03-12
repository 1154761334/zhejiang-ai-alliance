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
docker-compose up -d
```
Verify Directus is running at http://localhost:8055

2. Install frontend dependencies (only needed on first run or after changes):
```powershell
cd frontend
npm install
```

3. Start the Next.js development server:
```powershell
npm run dev
```
Frontend should be available at http://localhost:3000

4. (Optional) Seed test data:
```powershell
node seed-test-data.mjs
```
This will populate the Directus database with test articles, members, and an application.

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
