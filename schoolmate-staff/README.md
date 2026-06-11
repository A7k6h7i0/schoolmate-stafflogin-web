# Schoolmate Staff Portal

React staff login and administration portal for the Schoolmate ERP backend (Modules 3–14).

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn-style UI components
- React Router, TanStack Query, Zustand, Axios

## Quick start

```bash
cd schoolmate-staff
npm install
cp .env.example .env
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Environment

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API base URL including `/api/v1` |

Examples:

- Production: `https://your-api.onrender.com/api/v1`
- Local backend: `http://127.0.0.1:5064/api/v1`

## Production build

```bash
npm run build
npm run preview
```

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for:

- Backend on **Render**
- Frontend on **Vercel**
- CORS, MongoDB Atlas, and post-deploy checklist

## Login

Staff sign-in requires:

1. **School ID** — MongoDB ObjectId (`X-School-ID` header)
2. **Email or username** + **password**
3. Staff role: `SCHOOL_ADMIN`, `ACADEMIC_ADMIN`, `TEACHER`, `ACCOUNTANT`, `LIBRARIAN`, or `DRIVER`

## Modules

| Route | Module |
|-------|--------|
| `/dashboard` | Analytics KPIs |
| `/students` | Student profiles |
| `/attendance` | Attendance |
| `/academics` | Classes, exams, homework |
| `/sports` | Sports & activities |
| `/communication` | Announcements |
| `/finance` | Fees & invoices |
| `/hr` | HR & payroll |
| `/transport` | Transport & GPS |
| `/library` | Library |
| `/analytics` | Reports |
| `/data-ops` | Import/export |
| `/settings` | Profile & notifications |

Modules 1 (Super Admin) and 2 (Admissions) are excluded from this portal.
