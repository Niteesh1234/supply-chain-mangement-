# Supplier Management System

Full-stack supplier network dashboard with a Vite React frontend, Express API, MongoDB persistence, and demo data seeding.

## Vercel deployment

This repository is configured for Vercel using:

- `frontend/dist` as the static frontend output
- `api/index.js` as the serverless Express API entrypoint
- `vercel.json` rewrites so frontend calls to `/api/...` route to the API function

### Required Vercel environment variables

Add these in **Vercel → Project → Settings → Environment Variables**:

```bash
MONGODB_URI=<your MongoDB Atlas connection string>
JWT_SECRET=<a long random secret>
AUTH_BYPASS=true
VITE_AUTH_BYPASS=true
```

For a public demo, keep `AUTH_BYPASS=true` and `VITE_AUTH_BYPASS=true` so the dashboard opens without requiring account setup. For real auth, set both values to `false` and keep `JWT_SECRET` configured.

### Vercel project settings

If Vercel asks for build settings, use:

- **Framework Preset:** Other
- **Install Command:** `npm install && npm --prefix frontend install`
- **Build Command:** `npm run build`
- **Output Directory:** `frontend/dist`

These are already declared in `vercel.json`, so Vercel should detect them automatically.

### Deploy steps

1. Push this repository to GitHub.
2. In Vercel, click **Add New → Project**.
3. Import the GitHub repository.
4. Add the environment variables above.
5. Click **Deploy**.
6. After deployment, verify:
   - `https://your-project.vercel.app/` loads the React dashboard.
   - `https://your-project.vercel.app/api/health` returns JSON with `status: "ok"`.

## Local development

Create `.env` from `.env.example`, then run:

```bash
npm install
npm --prefix frontend install
npm run dev
```

The frontend Vite dev server proxies `/api` requests to the local backend configured in `frontend/vite.config.js`.

## Production verification

```bash
npm run build
node -e "require('./api/index'); console.log('Serverless API entrypoint loaded successfully')"
```