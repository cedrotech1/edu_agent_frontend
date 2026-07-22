# QuizMind AI — Frontend

Web app for **QuizMind AI**: teachers create quizzes, students take them, admins oversee the platform.

Stack: **React 18 · Vite 6 · React Router 7 · Tailwind 4 · shadcn/Radix**

Talks to `edu_agent_backend` at `/api/v1` with JWT in `localStorage`.

---

## Overview

UI came from a Figma Make prototype. It is now wired to the real backend for auth, classes, quizzes, results, notifications, and admin pages.

Google sign-in and live AI “thinking” UIs still use stubs / toasts until those integrations are added on the API.

---

## What’s done

| Area | Status |
|------|--------|
| Landing, how-it-works, login, signup | Done (API auth) |
| Role-based routes + `ProtectedRoute` | Done |
| Teacher dashboard: classes, quizzes, create class | Done |
| Class detail + invite student | Done |
| Quiz builder: stub generate + publish | Done |
| Teacher results + flagged answers review | Done |
| Student dashboard: upcoming / completed / join code | Done |
| Take quiz (lobby → timed → submit) | Done |
| Student results (score, breakdown, AI feedback text) | Done |
| Admin: dashboard, users, quiz oversight, grading logs, platform settings | Done |
| Settings pages (profile / password) | Done |
| Notifications panel (API) | Done |
| Subscription / billing screens | UI + stub API data |
| Auth context + `src/lib/api.ts` client | Done |

---

## What’s not done (planned)

| Feature | Notes |
|---------|--------|
| **Google login button** | Shows “coming soon”; waits for backend OAuth |
| **Real AI generation UX** | Spinner still calls stub generate endpoint |
| **Real AI reasoning / grading copy** | Feedback comes from stub scores until LLM is plugged in |
| **Live streaming AI chat agent** | Landing chat uses FAQ API, not a tutor agent |
| **Full notifications page** | Panel works; optional dedicated page later |
| **Real payment / Stripe** | Billing UI only |
| **Forgot-password full flow** | Link present; wire to reset API UX later |
| **Production build deploy docs** | Local Vite focus for now |

---

## Requirements

- Node.js 18+ (22 recommended)
- Backend running (default http://127.0.0.1:9000)
- npm

---

## Setup

```bash
cd edu_agent_frontend
npm install
```

Create env:

```bash
copy .env.example .env
```

`.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:9000/api/v1
```

> Tip: If `npm install` fails on Windows (esbuild / locked files), delete `node_modules` and install again with Node 22 from `C:\Program Files\nodejs\`.

---

## Start

```bash
npm run dev
```

Open: **http://localhost:5173**

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Production build → `dist/` |

Vite proxies `/api` → `http://127.0.0.1:9000` (optional). The app normally uses `VITE_API_BASE_URL` directly.

---

## Demo login

Use seeded backend users (password **`Password123`**):

| Email | Role | Goes to |
|-------|------|---------|
| `cedrickhakuzimana@gmail.com` | Teacher | `/teacher` |
| `grace@gmail.com` | Student | `/student` |
| `admin@gmail.com` | Admin | `/admin` |

---

## App structure

```
src/
  lib/
    api.ts          # HTTP client + token helpers
    auth.tsx        # AuthProvider / useAuth
  app/
    routes.tsx      # All routes + role guards
    pages/
      auth/         # Landing, login, signup, onboarding
      teacher/      # Dashboard, class, builder, results
      student/      # Dashboard, take quiz, results
      admin/        # Oversight, users, settings, billing
    components/     # UI + NotificationsPanel, ProtectedRoute
```

Token keys: `quizmind_token`, `quizmind_user` in `localStorage`.

---

## Typical flows

1. **Teacher** — Sign up / login → create class → quiz builder (AI stub) → publish → view results / flagged.  
2. **Student** — Login → join `QMIND-####` → start quiz → submit → see results.  
3. **Admin** — Manage users, flag quizzes, review grading logs, platform settings.

---

## How this connects to AI (later)

Frontend already calls:

- `POST /quizzes/generate` — quiz builder “thinking” step  
- Submit → grading fields on results (`aiFeedback`, confidence)  
- `POST /chat/public` — landing assistant  

When the backend swaps stubs for a real model, these screens keep the same shape; only response quality changes. Google button will call `POST /auth/google` once OAuth is configured.
