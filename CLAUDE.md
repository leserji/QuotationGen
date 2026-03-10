# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:3000
npm run build      # Production build
npm run lint       # ESLint
npx prisma migrate dev --name <name>   # Create and apply a new migration
npx prisma studio                      # Open DB browser UI
```

No test suite is configured.

## Architecture

**Stack:** Next.js 14 (App Router), Tailwind CSS, SQLite via Prisma 7 + `better-sqlite3`.

**Prisma 7 note:** Prisma 7 requires a driver adapter — there is no `DATABASE_URL` string in `schema.prisma`. The adapter is wired in `lib/prisma.ts` using `PrismaBetterSqlite3` pointing at `prisma/dev.db`. The `prisma.config.ts` file handles migration tooling separately (it reads `DATABASE_URL` from `.env` for the CLI only).

**Data model (`prisma/schema.prisma`):**
- `Quotation` → has many `Section` and `LineItem`
- `LineItem.sectionId` is nullable — items belong to a section or are unsectioned (rendered before the first section)
- `Quotation.number` is auto-generated as `QT-XXXX` in the POST handler by querying `MAX(number)`

**Editor state (`components/QuotationEditor.tsx`):**
- Sections and items are tracked in React state using `tempId` (module-level counter) instead of DB ids, since new records don't have ids yet
- When loading existing data, `sectionDbIdToTempId` maps DB section ids → tempIds so items can reference their section in state
- On save, `tempId`/`sectionTempId` are resolved back to real DB ids in the API route by matching array index position
- The PATCH route does a full delete-and-recreate of all sections and items on every save

**API routes:**
- `app/api/quotations/route.ts` — GET (list with totals computed server-side), POST (creates quotation + sections first, then items)
- `app/api/quotations/[id]/route.ts` — GET, PATCH (full replace), DELETE (cascade handled by Prisma)

**Pages:**
- `/` — client component, fetches list via `/api/quotations`
- `/quotations/new` — renders `<QuotationEditor />` with no props
- `/quotations/[id]` — server component, fetches quotation, passes `initialData` to `<QuotationEditor quotationId={id} />`
- `/quotations/[id]/print` — server component, renders static print layout; `window.print()` fires via inline `onload` script
