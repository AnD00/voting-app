# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Team idea voting app (アイデア投票) built with Next.js 16 App Router. All UI text is in Japanese. The app lets teams create voting sessions, add ideas, and vote anonymously.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build (note: ignoreBuildErrors is true in next.config.mjs)
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

No test framework is configured.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-side only)
- `ADMIN_PASSWORD` — Password for admin login

## Architecture

**Framework:** Next.js 16 App Router with React 19, TypeScript, Tailwind CSS 4

**Database:** Supabase (PostgreSQL). Schema in `scripts/001_create_tables.sql`. Tables: `sessions`, `ideas`, `votes`. Supabase client initialized in `lib/supabase/server.ts` using service role key.

**UI:** shadcn/ui components in `components/ui/` (59 Radix-based components configured via `components.json`). Styling uses oklch CSS variables defined in `app/globals.css`.

**Key routes:**
- `/` — Public session listing
- `/admin` — Password login, then session/idea CRUD at `/admin/sessions/[sessionId]`
- `/vote/[sessionId]` — Multi-step anonymous voting flow (nickname → selection → confirmation)
- `/results/[sessionId]` — Animated results display with confetti

**Server Actions:** `app/admin/actions.ts` (session/idea CRUD with `assertAdmin()` auth check) and `app/vote/actions.ts` (vote submission). Actions use `revalidatePath()` for cache invalidation.

**Auth:** Admin uses password cookie (`admin_session`, httpOnly). Voters are anonymous, tracked by UUID in localStorage with duplicate vote prevention via unique constraint on `(session_id, voter_id)`.

**State:** No external state library. Client components use React useState/localStorage. No real-time subscriptions.
