# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## IMPORTANT: Docs-First Rule

**Before generating any code, always read the relevant file(s) in the `/docs` directory first.**

The `/docs` directory contains coding standards and conventions that MUST be followed. Check it for guidance on UI components, date formatting, data fetching, and any other topic covered there. Standards in `/docs` override general defaults.

Current docs:
- `docs/ui.md` — UI component rules (shadcn/ui only) and date formatting (date-fns)
- `docs/data-fetching.md` — Data fetching rules (Server Components only), `/data` directory helpers, Drizzle ORM, and user data isolation
- `docs/auth.md` — Authentication standards (Clerk), getting `userId`, route protection via middleware, and Clerk UI components
- `docs/data-mutations.md` — Data mutation rules (Server Actions + `/data` helpers), Zod validation, typed params, and user data isolation
- `docs/server-components.md` — Server Component standards, async params/searchParams (Next.js 15), Server/Client boundary rules

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm start        # Start production server
npm run lint     # Run ESLint
```

No test framework is configured yet. Add one (e.g., Jest + Testing Library) if tests are needed.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4

**Entry points:**
- `src/app/layout.tsx` — root layout, Geist font setup, global styles
- `src/app/page.tsx` — home page (currently boilerplate)
- `src/app/globals.css` — global CSS with Tailwind directives

**Path alias:** `@/*` resolves to `./src/*` (e.g., `import Foo from "@/components/Foo"`).

**Routing:** File-system based via `src/app/`. New routes are folders with a `page.tsx`. Layouts wrap child routes automatically via `layout.tsx`.

**Component model:** All components in `src/app/` are Server Components by default. Add `"use client"` only for components that use hooks, event handlers, or browser APIs.

**Styling:** Tailwind CSS v4 via PostCSS (`@tailwindcss/postcss`). No `tailwind.config.js` — v4 uses CSS-first configuration in `globals.css`.
