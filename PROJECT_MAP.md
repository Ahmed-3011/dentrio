# PROJECT MAP — DENTRIO PLATFORM

## [TECH_STACK]
- **Framework:** Next.js 16.3.3 (App Router, Turbopack)
- **Language:** TypeScript 5.x
- **Styling:** Tailwind CSS v4 (Design Tokens: `--bg`, `--bg-card`, `--bg-elevated`, `--text`, `--accent`, `--border`)
- **Database:** Turso Remote libSQL (`@libsql/client`)
- **Authentication:** Custom Session-based Cookie (`triad_session`), bcryptjs
- **3D Graphics Engine:** Three.js (STL / PLY in-browser viewer)
- **Logistics & Security:** Role-based access control (DENTIST, LAB, SHIPPING) + Privilege tiers (normal, admin, owner)

## [SYSTEM_FLOW]
1. **Authentication Flow:** `/login` & `/signup` -> verify credentials -> issue `triad_session` httpOnly cookie -> route based on user role (`/dashboard`, `/shipping`).
2. **Clinical Case Flow (Dentist):** `/cases/new` -> upload STL/PLY scan -> fill structured prescription -> choose Lab -> submit to Turso DB.
3. **Lab Production Flow (Lab):** `/cases` -> inspect 3D scan & prescription -> advance status (`SUBMITTED` -> `REVIEW` -> `DESIGN` -> `PRODUCTION` -> `READY`) -> attach CAD response files / case chat messages.
4. **Logistics Flow (Shipping):** `/shipping` -> privacy-gated queue (Case ID + Addresses only, clinical data masked) -> confirm pickup -> assign tracking -> mark delivered (`CLOSED`).

## [ARCHITECTURE]
- `src/app/`: Next.js App Router endpoints, pages, and route handlers.
- `src/lib/db.ts`: LibSQL database connection singleton & async SQL helpers (`all`, `get`, `run`).
- `src/lib/auth.ts`: Session tokens, cookie parsing, `requireUser`, `requireRole`, `requirePrivilege`.
- `src/lib/constants.ts`: Client-safe pipeline stages, role labels, and statuses.
- `src/lib/upload.ts`: File upload storage & path resolution helpers.
- `src/components/`: Reusable domain components (`NavBar`, `Chat`, `Viewer3D`, `ThemeProvider`).
- `proxy.ts`: Next.js edge route protection & middleware.

## [ORPHANS & PENDING]
- None (All core routes verified and compiling with zero errors).
