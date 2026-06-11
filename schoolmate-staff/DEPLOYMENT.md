# Deployment Guide — Schoolmate Staff Portal

This repo contains the **frontend** (`schoolmate-staff`). The **backend** is a separate Node.js API (the service you run on port `5064` locally). Deploy backend on **Render** and frontend on **Vercel**.

---

## Architecture

| Component | Host | URL example |
|-----------|------|-------------|
| Frontend (this project) | Vercel | `https://staff.yourschool.com` |
| Backend API | Render | `https://schoolmate-api.onrender.com` |
| Database | MongoDB Atlas | `mongodb+srv://...` |

The frontend calls the API via `VITE_API_BASE_URL` (must end with `/api/v1`).

---

## 1. Backend on Render

### Prerequisites

- Backend source repo (Node.js + Express/Nest, etc.)
- [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (free tier works for staging)
- Optional: Redis URL if your backend uses BullMQ/queues

### Step A — Push backend to GitHub

Ensure the backend repo has:

- `package.json` with `"start"` script (e.g. `node dist/server.js` or `node src/index.js`)
- `engines.node` ≥ 18 recommended

### Step B — Create Web Service on Render

1. Go to [render.com](https://render.com) → **New** → **Web Service**
2. Connect your **backend** GitHub repository (not this frontend repo unless monorepo)
3. Configure:

| Setting | Value |
|---------|--------|
| **Name** | `schoolmate-api` |
| **Region** | Closest to your users |
| **Branch** | `main` |
| **Root Directory** | backend folder if monorepo (e.g. `server`) |
| **Runtime** | Node |
| **Build Command** | `npm install && npm run build` (adjust to your backend) |
| **Start Command** | `npm start` |
| **Instance type** | Free or Starter |

4. **Environment variables** (example — match your backend `.env`):

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/schoolmate
JWT_SECRET=your-long-random-secret
JWT_REFRESH_SECRET=another-long-random-secret
CORS_ORIGIN=https://your-staff-app.vercel.app
```

> Render sets `PORT` automatically; your app must listen on `process.env.PORT`.

5. Click **Create Web Service** and wait for deploy.

6. Note your API URL: `https://schoolmate-api.onrender.com`

### Step C — Verify API

```bash
curl https://schoolmate-api.onrender.com/api/v1/docs
# or health endpoint if you have one
```

Swagger/docs should load. Login should return JWT.

### Step D — MongoDB Atlas

1. Create cluster → **Network Access** → allow `0.0.0.0/0` (or Render outbound IPs)
2. **Database Access** → user with read/write
3. Copy connection string into `MONGODB_URI` on Render

### CORS (required for Vercel)

Backend must allow your Vercel frontend origin:

```
https://your-project.vercel.app
```

Include `Authorization` and `X-School-ID` in allowed headers.

---

## 2. Frontend on Vercel

### Step A — Push this project to GitHub

Repo should contain `schoolmate-staff/` (or set Vercel root to that folder).

### Step B — Import in Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**
2. Import the GitHub repository
3. Configure:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Vite |
| **Root Directory** | `schoolmate-staff` (if repo root is parent) |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

4. **Environment variables** (Production):

```env
VITE_API_BASE_URL=https://schoolmate-api.onrender.com/api/v1
```

Replace with your actual Render URL.

5. Deploy.

### Step C — SPA routing

`vercel.json` in this project rewrites all routes to `index.html` so `/login`, `/students`, etc. work on refresh.

### Step D — Custom domain (optional)

Vercel → Project → **Settings** → **Domains** → add `staff.yourschool.com`.

Update backend `CORS_ORIGIN` to match.

---

## 3. Post-deploy checklist

- [ ] Login with school admin on Vercel URL
- [ ] `X-School-ID` + JWT work (no CORS errors in browser console)
- [ ] HR onboard includes **password** (staff can log in)
- [ ] Transport: routes use `fare`, vehicles use `vehicleNumber` + `modelName`
- [ ] Render free tier: service may sleep after idle — first request can be slow (~30s)
- [ ] Never commit `.env` — only set secrets in Render/Vercel dashboards

---

## 4. Local development

```bash
cd schoolmate-staff
cp .env.example .env
# Point to local backend or production API
npm install
npm run dev
```

`.env` example for local backend:

```env
VITE_API_BASE_URL=http://127.0.0.1:5064/api/v1
```

---

## 5. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error on login | Add Vercel URL to backend `CORS_ORIGIN` |
| 404 on `/dashboard` refresh | Ensure `vercel.json` is deployed |
| API 401 | Check school ID and staff credentials |
| API 400 on forms | Compare Network tab payload with backend test logs |
| Render build fails | Check build/start commands and Node version |
| Cold start slow | Upgrade Render plan or use health ping cron |

---

## 6. Security notes for production

- Use strong `JWT_SECRET` / `JWT_REFRESH_SECRET`
- MongoDB user with least privilege
- Enable HTTPS only (Render/Vercel default)
- Rotate secrets if exposed
- Restrict MongoDB network access when possible
