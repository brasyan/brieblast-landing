# BrieHosting Landing Page

Marketing landing page for BrieHosting, built with React, Vite, TypeScript, and Tailwind CSS.

## Getting Started

Requirements:

- Node.js 18+
- npm

Install dependencies and run locally:

```sh
npm install
npm run dev
```

The app runs on the local Vite dev server and supports hot reload.

## Available Scripts

- `npm run dev`: Start local development server.
- `npm run build`: Build production assets.
- `npm run build:dev`: Build with development mode settings.
- `npm run preview`: Preview the built app locally.
- `npm run lint`: Run ESLint.
- `npm run test`: Run tests once with Vitest.
- `npm run test:watch`: Run tests in watch mode.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- Vitest + Testing Library

## Project Structure

- `src/components`: Reusable UI and landing-page sections.
- `src/pages`: Route-level pages.
- `src/hooks`: Shared React hooks.
- `src/lib`: Utility functions.
- `public`: Static assets.

## Environment variables

Create a `.env` (not committed) with:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
# URL of the briehost-api service (sibling repo) — required for the dashboard's site upload feature.
VITE_BRIEHOST_API_URL=http://localhost:8000
# Compatibility aliases (optional):
# VITE_BRIEHOST_URL=http://localhost:8000
# VITE_BRIEHOST_BASE_URL=http://localhost:8000
# If your briehost-api requires an API key header:
# VITE_BRIEHOST_API_KEY=...
```

## Site Health Checks

The public `/status` page does not trust `sites.status = 'live'` by itself.
After applying `supabase/migrations/011_site_health_checks.sql`, a site only
counts as online when the latest health check is `up` and less than 5 minutes
old.

Your backend/worker should periodically check each live site or its Proxmox
container and record the result with the Supabase service-role key:

```sql
select public.record_site_health_check(
  'site-id-here',
  'up',
  123,
  200,
  null
);
```

Use status `down` when the site/container is unreachable, and `unknown` when
the check could not produce a reliable result.

## Deployment

Build the project with `npm run build` and deploy the generated `dist/` directory to your hosting provider.
