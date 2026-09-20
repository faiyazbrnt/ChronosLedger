# Architectural & Design Decisions

This document tracks non-obvious technical and design choices across development phases. Decisions are tagged with `[FS]` (Senior Full-Stack Hat) or `[FE]` (Senior Frontend Hat).

---

### [FS] Prisma 6.19.3 Selected Over Prisma 7/8-rc
- **Context:** `npm/bun` defaults installed Prisma 8-rc / Prisma 7, which deprecated `url` and `directUrl` in `schema.prisma`, requiring `prisma.config.ts` and driver adapters.
- **Decision:** Aligned `@prisma/client` and `prisma` CLI to stable version `6.19.3`. This natively supports `url = env("DATABASE_URL")` (pooled port 6543) and `directUrl = env("DIRECT_URL")` (direct port 5432) as specified in product integration requirements without experimental adapters.

### [FE] Theme Color Token Inversion for shadcn Compatibility
- **Context:** The product specifies light mode surface `#FFEFCC` and accent `#660000`. In standard shadcn/ui conventions, `--primary` is the button background and `--background` is the screen surface.
- **Decision:** Mapped `--background: #ffefcc`, `--primary: #660000`, `--primary-foreground: #ffefcc`, and `--foreground: #260000` (derived dark maroon). Dark mode is strictly black and white (`--background: #09090b`, `--foreground: #fafafa`, `--primary: #ffffff`, `--primary-foreground: #09090b`).

### [FS] ESLint Flat Config with FlatCompat & Boundaries Plugin
- **Context:** Next.js 15 uses flat config (`eslint.config.mjs`) while `eslint-config-next@15` retains legacy extends. Furthermore, boundary rules must be strictly enforced.
- **Decision:** Utilized `@eslint/eslintrc` `FlatCompat` alongside `eslint-plugin-boundaries` and `no-restricted-imports`. Mechanical rules strictly block deep imports into features (`@/features/*/*`), isolate cross-feature internals, and prohibit Prisma queries outside `src/features/*/services/`.
