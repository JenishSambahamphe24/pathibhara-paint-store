# Tooling

## Commands

```bash
pnpm dev          # dev server on :4005
pnpm build        # production build
pnpm test         # vitest run
pnpm check        # prettier --write + eslint --fix (auto-fix everything)
pnpm lint         # eslint only
pnpm format       # prettier --check only
```

## Linting & Formatting

Run `pnpm check` before every commit. Linting failures and formatting issues are **blocking**.

ESLint config extends `@tanstack/eslint-config` (`eslint.config.js`).

Prettier config (`prettier.config.js`):

- Double quotes, semicolons, trailing commas
- Import order enforced via `@ianvs/prettier-plugin-sort-imports`
- Tailwind class sorting via `prettier-plugin-tailwindcss`

## Import Order (enforced by Prettier)

1. CSS imports
2. Type imports
3. Node built-ins
4. Third-party modules
5. `#/components/**`
6. `#/(utils|features|paraglide|integrations|helpers)/**`
7. `#/**`
8. Relative imports (`./`, `../`)
