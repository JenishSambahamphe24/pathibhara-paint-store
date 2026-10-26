# Project Structure

## Directory Layout

```
src/
├── components/          # Reusable, domain-agnostic components
│   └── <ComponentName>/
│       └── <ComponentName>.tsx
├── features/            # Feature-specific code (self-contained modules)
│   └── <FeatureName>/
│       ├── components/          # Feature components
│       │   ├── skeleton/        # Skeleton loaders (if needed)
│       │   └── icon/            # Feature-specific icons (if needed)
│       ├── hooks/               # Feature hooks
│       └── types.ts             # Feature types
├── hooks/               # Shared hooks
├── integrations/        # Third-party integrations (TanStack Query provider, devtools)
├── layouts/             # Route layout components
├── lib/                 # Pure utilities and helpers
│   └── helpers/
├── routes/              # File-based routes (auto-generated routeTree.gen.ts)
│   ├── __root.tsx
│   ├── (auth)/
│   └── (core)/
├── styles/              # Global CSS, Tailwind entry
└── paraglide/           # Auto-generated i18n output — DO NOT EDIT
```

## Feature Folder Rules

When adding a new feature:

1. Create `src/features/<featureName>/` (camelCase, e.g. `stockBatches`).
2. Put all components, hooks, and types inside — do not scatter them globally unless they are truly shared across features.
3. **All components (including page components) must be inside `src/features/<FeatureName>/components/`** — never at the feature root.
4. Skeleton loaders go in `src/features/<FeatureName>/components/skeleton/`.
5. Custom icons go in `src/features/<FeatureName>/components/icon/`.

Only promote something to `src/components/` if it is used by 2+ unrelated features.

## Routing

Routes live in `src/routes/` and follow TanStack Router file conventions:

- `(auth)/` — unauthenticated routes (login, etc.)
- `(core)/` — authenticated app routes (dashboard, users, roles, admins, etc.)
- `__root.tsx` — root layout with providers
- `routeTree.gen.ts` — auto-generated, **never edit manually**
