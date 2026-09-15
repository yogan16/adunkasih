# ADUNKASIH @ Kedah

A full-stack welfare-assistance management portal for Kedah state (Malaysia). Citizens register, apply for aid, and track application status; pegawai and Wakil ADUN review submissions per constituency, and admins manage users, aid types, announcements, budgets, and site content.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript + React 19
- **Database:** PostgreSQL, via [Prisma ORM](https://www.prisma.io/)
- **Auth:** [Auth.js](https://authjs.dev/) (NextAuth v5) with credentials login, passwords hashed via bcrypt
- **Validation:** [Zod](https://zod.dev/)
- **Styling:** CSS Modules (faithfully ports the original Kedah state branding/design)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in a PostgreSQL connection string plus an `AUTH_SECRET` (generate one with `npx auth secret`).
3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
4. (Optional) Seed reference data (ADUN list, aid types, a default admin account):
   ```bash
   node prisma/seed-reference-data.mjs
   ```
5. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app/` — pages (App Router), grouped by route: public pages (`about`, `contact`, `general-dashboard`), citizen (`dashboard`, `permohonan`, `profile`, `status`), staff (`pegawai`, `wakil-adun`), and `admin`, plus `api/` route handlers
- `src/components/` — shared UI (role-aware headers, footer, providers)
- `src/lib/` — Prisma client, Zod validation schemas, CSV export, report builders
- `prisma/schema.prisma` — data model (User, Adun, AdunBudget, AidType, Application, StatusChange, Dependent, Document, Announcement, ContactMessage, SiteSettings)

## Status

Full application lifecycle is implemented: citizen registration/login, aid application submission and status tracking, pegawai and Wakil ADUN review queues scoped per ADUN with CSV reporting, and admin management of users, aid types, announcements, ADUN budgets, and site contact details.
