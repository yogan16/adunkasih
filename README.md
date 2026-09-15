# ADUNKASIH @ Kedah

A full-stack rebuild of ADUNKASIH, a welfare-assistance management portal for Kedah state (Malaysia). Citizens register, apply for aid, and track application status; staff (pegawai) and admins manage submissions. This repo migrates the original static HTML/Firebase prototype (preserved under [`legacy/`](legacy)) to a modern full-stack application.

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
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app/` — pages (App Router), grouped by route; `(app)` holds authenticated dashboard/pegawai/admin routes
- `src/components/` — shared UI (header, footer, providers)
- `src/lib/` — Prisma client, Zod schemas, server actions
- `prisma/schema.prisma` — data model (User, Application, Dependent, AidType, StatusChange, Document, Announcement, ContactMessage)
- `legacy/` — original static HTML/CSS/JS + Firebase prototype, kept for reference

## Status

Citizen-facing pages (landing, register, login, forgot password, about, contact) are rebuilt with real authentication and a PostgreSQL backend. Pegawai/admin workflows (application review, approvals, reports) are not yet implemented.
