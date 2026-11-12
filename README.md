# FactWise

**FactWise Care** is a functional prototype for a 74-bed virus quarantine & treatment facility, built to solve daily temperature tracking, doctor round coordination, 3-day no-fever discharge automation, and mortality/success rate monitoring.

## Core Workflows & Screens

1. **Login & Quick Role Switcher (`/login`)**
   - 1-click demo login for **Nurse**, **Doctor**, and **Admin** roles (or standard email/password sign-in).
   - Persistent top-bar **Demo Role** switcher to test the full multi-role handoff seamlessly.
2. **Daily Operations Dashboard (`/dashboard`)**
   - Live KPIs: Facility Occupancy (`X / 74 beds`), Today's Nurse Temperature progress, Today's Doctor Rounds progress, Mortality Rate (vs `≤ 15%` target), and Treatment Success Rate (vs `≥ 85%` benchmark).
   - Automatic **Critical Quality Alert** banner if mortality exceeds 15%.
   - Role-focused action queues (Pending Nurse Temperatures, Ready for Doctor Round, Discharge Ready Queue).
3. **Patient Ward Directory (`/patients`)**
   - Filterable & searchable patient list (`All Admitted`, `Needs Temp`, `Ready for Doctor`, `Discharge Ready`, `Discharged`, `Deceased`).
   - Inline workflow enforcement:
     - **Nurse**: Record today's temperature (blocks duplicate same-day entries).
     - **Doctor**: Log daily visit (blocked if today's temperature has not been recorded by a nurse yet) and recommend discharge when 3-day no-fever criterion is met.
     - **Admin**: Admit new patients (enforces 74-bed cap) and process discharges.
4. **Patient Chart & Trend (`/patients/:id`)**
   - Visual **3-Day No-Fever Streak** tracker (`< 38.0°C` for 3 consecutive days).
   - SVG Temperature Trend chart with dashed fever threshold line.
   - Full temperature history and doctor treatment/visit logs.
5. **Admin & 74-Bed Ward Map (`/admin`)**
   - Interactive 74-room grid (`R-101` to `R-174`) color-coded by status.
   - Discharge Approval Queue, configurable fever threshold, and demo controls (`Simulate 74/74 Full Capacity`, `Reset Demo Data`).

## Local Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Import this GitHub repository in [Vercel](https://vercel.com).
2. Framework Preset: **Vite** (`npm run build`, output directory `dist`).
3. `vercel.json` is included for client-side SPA routing.
