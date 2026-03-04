# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
