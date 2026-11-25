# QR Studio

A modern, full-stack **Dynamic QR Code Generator & Analytics SaaS Platform** built with **React + Vite + Tailwind CSS** on the frontend and **Node.js + Express + PostgreSQL + Prisma** on the backend.

---

## Features

- **13 QR Code Types** with dynamic, validated input forms:
  1. Website URL
  2. Plain text
  3. Wi-Fi connection
  4. Email
  5. Phone number
  6. SMS
  7. WhatsApp
  8. Contact / vCard
  9. Google Maps location
  10. UPI payment
  11. Social media links
  12. PDF or document URL
  13. Event information
- **Deep Customization & Real-Time Preview**:
  - Foreground & background colors with live WCAG contrast & scannability check
  - Preview size, quiet-zone margin, and error correction level (`L`, `M`, `Q`, `H`)
  - Dot styles (`Square`, `Rounded`, `Dots`, `Diamond`, `Fluid`)
  - Corner finder styles (`Square`, `Rounded`, `Circle`)
  - Center brand logo upload & adjustable logo size (auto-upgrades ECC to `H`)
  - Custom QR title caption
- **Downloads & Sharing**:
  - Export high-resolution **PNG**, scalable vector **SVG**, and print-ready **PDF**
  - One-click Copy to Clipboard for encoded content or dynamic short link
- **Static & Dynamic QR Codes**:
  - **Static QR**: Direct payload encoding, free without login, instant download
  - **Dynamic QR**: Encodes `/r/:codeId`, backed by PostgreSQL; edit destination URLs anytime without reprinting, toggle active/paused status, and set optional expiration dates
- **Authentication & Dashboard**:
  - JWT authentication with bcrypt password hashing, profile management, and ownership-protected endpoints
  - Management table with search, type/status filtering, sorting, pagination, edit modal, download menu, and delete confirmation
- **Privacy-First Scan Analytics (Recharts)**:
  - Tracks scan timestamp, device category, browser category, OS category, and approximate country/region without storing visitor IP addresses or raw User-Agent strings

---

## Folder Structure

```text
qr-studio/
├── docker-compose.yml
├── package.json
├── README.md
├── client/
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── AnalyticsCharts.jsx
│       │   │   ├── EditQrModal.jsx
│       │   │   ├── QrTable.jsx
│       │   │   └── StatsCards.jsx
│       │   ├── layout/
│       │   │   ├── DashboardLayout.jsx
│       │   │   ├── Footer.jsx
│       │   │   └── Navbar.jsx
│       │   ├── qr/
│       │   │   ├── QrCustomizer.jsx
│       │   │   ├── QrDynamicForms.jsx
│       │   │   ├── QrGeneratorWidget.jsx
│       │   │   ├── QrPreviewCard.jsx
│       │   │   └── QrTypeSelector.jsx
│       │   └── ui/
│       │       ├── Modal.jsx
│       │       ├── ThemeToggle.jsx
│       │       └── Toast.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       ├── pages/
│       │   ├── AnalyticsOverviewPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── GeneratorPage.jsx
│       │   ├── InfoPage.jsx
│       │   ├── LandingPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ProfileSettingsPage.jsx
│       │   ├── QrAnalyticsPage.jsx
│       │   └── RegisterPage.jsx
│       ├── services/
│       │   └── api.js
│       └── utils/
│           ├── qrContentBuilder.js
│           ├── qrRenderer.js
│           └── validators.js
└── server/
    ├── .env.example
    ├── package.json
    ├── prisma/
    │   ├── schema.prisma
    │   └── seed.js
    ├── src/
    │   ├── app.js
    │   ├── index.js
    │   ├── config/
    │   │   └── env.js
    │   ├── controllers/
    │   │   ├── analyticsController.js
    │   │   ├── authController.js
    │   │   ├── qrController.js
    │   │   └── redirectController.js
    │   ├── lib/
    │   │   └── prisma.js
    │   ├── middleware/
    │   │   ├── auth.js
    │   │   ├── errorHandler.js
    │   │   ├── rateLimiter.js
    │   │   └── validate.js
    │   ├── routes/
    │   │   ├── analyticsRoutes.js
    │   │   ├── authRoutes.js
    │   │   ├── qrRoutes.js
    │   │   └── redirectRoutes.js
    │   └── utils/
    │       ├── idGenerator.js
    │       ├── qrPayload.js
    │       ├── urlSecurity.js
    │       └── userAgent.js
    └── tests/
        ├── api.test.js
        ├── urlSecurity.test.js
        └── userAgent.test.js
```

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Environment Variables
Copy the example `.env` files and update secrets:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

**`server/.env` example:**
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://qrstudio:qrstudio_dev_password@localhost:5432/qrstudio?schema=public"
JWT_SECRET="replace-with-a-long-random-64-char-secret-key"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
APP_URL="http://localhost:5000"
ALLOW_LOCAL_REDIRECTS=true
```

**`client/.env` example:**
```env
VITE_API_URL=http://localhost:5000/api
VITE_REDIRECT_BASE_URL=http://localhost:5000
```

### 3. Start PostgreSQL & Run Prisma Migrations
If using Docker:
```bash
docker compose up -d
```

Generate Prisma client, run migrations, and optionally seed demo data (`demo@qrstudio.app` / `DemoPass123!`):
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed --prefix server
```

---

## Development Commands

Start the backend API (`http://localhost:5000`) and frontend Vite dev server (`http://localhost:5173`) in separate terminals:
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Build the frontend for production:
```bash
npm run build:client
```

---

## Testing Instructions

Run the backend test suite (URL security, privacy-safe UA parsing, ID generator, health check, QR image generation, auth & validation checks):
```bash
npm run test:server
```

---

## REST API Reference

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | API health status |
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT |
| `GET` | `/api/auth/me` | JWT | Fetch current user profile |
| `PATCH` | `/api/auth/profile` | JWT | Update name/email |
| `PATCH` | `/api/auth/password` | JWT | Change account password |
| `POST` | `/api/qrcodes/image` | Public | Generate PNG or SVG QR image |
| `GET` | `/api/qrcodes` | JWT | List user dynamic QR codes (filter/sort/paginate) |
| `POST` | `/api/qrcodes` | JWT | Create dynamic QR code |
| `GET` | `/api/qrcodes/:id` | JWT | Get single QR code (owner only) |
| `GET` | `/api/qrcodes/:id/image` | JWT | Download saved QR PNG/SVG |
| `PATCH` | `/api/qrcodes/:id` | JWT | Update destination, status, expiration |
| `DELETE` | `/api/qrcodes/:id` | JWT | Delete dynamic QR code |
| `GET` | `/api/analytics/overview` | JWT | Aggregated dashboard analytics |
| `GET` | `/api/analytics/qrcodes/:id` | JWT | Per-QR scan analytics & recent scans |
| `GET` | `/r/:codeId` | Public | Dynamic QR redirect & scan tracking |

---

## Deployment Guide

1. **Database**: Provision a managed PostgreSQL instance (Neon, Supabase, RDS, or Railway) and set `DATABASE_URL`.
2. **Backend (`server/`)**:
   - Set `NODE_ENV=production`, a strong `JWT_SECRET` (32+ chars), `CLIENT_URL` (your deployed frontend domain), `APP_URL` (your deployed API domain), and `ALLOW_LOCAL_REDIRECTS=false`.
   - Run `npx prisma migrate deploy` and `npm start`.
3. **Frontend (`client/`)**:
   - Set `VITE_API_URL=https://api.yourdomain.com/api` and `VITE_REDIRECT_BASE_URL=https://api.yourdomain.com`.
   - Run `npm run build` and deploy `client/dist` to Vercel, Netlify, Cloudflare Pages, or an Nginx reverse proxy.
