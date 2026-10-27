# Code Conventions

## Exports

Always use **named exports** — never default exports.

```tsx
// Correct
export function UserList() { ... }

// Wrong
export default function UserList() { ... }
```

## Function Style

Use **function declarations**, not arrow-function const assignments for components and hooks.

```tsx
// Correct
export function useUsers() { ... }
export function UserCard() { ... }

// Wrong
export const UserCard = () => { ... }
export const useUsers = () => { ... }
```

## UI Components

- Use **Ark UI** (`@ark-ui/react`) for all interactive/accessible UI primitives (dialogs, menus, selects, tooltips, tabs, etc.).
- Wrap Ark UI parts into project components under `src/components/<ComponentName>/` or within the feature folder when domain-specific.

## Import Alias

Use `#/` as the path alias for `src/` (configured in `package.json` `imports` and `tsconfig.json`).

```ts
import { Container } from "#/components/Container/Container";

import { Sidebar } from "#/features/sidebar/components/Sidebar";
```

### Intra-Feature Imports Must Be Relative

Inside a feature directory (`src/features/<FeatureName>/`), imports that point to other files **within the same feature** must use relative paths — never `#/features/<FeatureName>/...`.

The `#/features/<FeatureName>/...` alias is only for crossing feature boundaries (e.g. one feature importing from another, or a route/layout importing a feature).

Correct — inside `src/features/userList/components/UserListPage.tsx`:

```tsx
import type { IUser } from "../types";

import { useUsers } from "../hooks/useUsers";
import { UserRow } from "./UserRow";
```

Wrong — self-referencing the current feature through the alias:

```tsx
import type { IUser } from "#/features/userList/types";

import { UserRow } from "#/features/userList/components/UserRow";
import { useUsers } from "#/features/userList/hooks/useUsers";
```

## Types & Interfaces

- Prefix interfaces with `I` (e.g., `ISidebarGroup`).
- Types inferred from `@repo/shared` schemas keep their shared name (`AdminLoginInput`).
- Prefix type aliases with `T` (e.g., `TSidebarParentItem`).
- Keep feature-specific types in `src/features/<FeatureName>/types.ts`.

## Styling

- Use Tailwind CSS utility classes directly.
- Use `clsx` for conditional class merging.
- Tailwind functions recognised for class sorting: `clsx`, `cva`, `cn`.

## Props Interface Naming

Name component props interfaces `<ComponentName>Props`.

```tsx
interface UserCardProps {
  userId: string;
}

export function UserCard({ userId }: UserCardProps) { ... }
```

## TypeScript Strictness

`strict`, `noUnusedLocals`, and `noUnusedParameters` are all enabled. The compiler will error on:

- Unused variables or imports
- Unused function parameters (prefix with `_` to intentionally ignore: `_event`)

Use the `satisfies` operator when you want type-checking without widening the inferred type:

```ts
const items = [
  { title: "Dashboard", url: "/dashboard" },
] satisfies Array<ISidebarGroup>;
```

## Utility / Helper / Non-React Files

All utilities, helpers, and non-React lib files must use **classes with static methods** — never standalone exported functions.

```ts
// Correct
export class CookieHelper {
  static get(name: string): string | undefined { ... }
  static set(name: string, value: string): void { ... }
}

// Wrong
export function getCookie(name: string) { ... }
export const setCookie = (name: string, value: string) => { ... }
```

This applies to everything under `src/lib/` and `src/lib/helpers/`. Not necessarily just these folders, but any file that match the helper or utility pattern.

## One Exported Component Per File

Each file exports exactly **one** component, class, or hook. Small private pieces used only by that export (a row sub-component, its skeleton) may live in the same file, unexported. Anything reused elsewhere gets its own file.

## Destructive Actions Require Confirmation

Any destructive action (delete, deactivate, etc.) must prompt the user for confirmation via a dialog/modal **before** executing. Never trigger a destructive API call on a single click.

## No Tailwind Arbitrary Values or Inline Styles

Never use Tailwind arbitrary values (`w-[200px]`, `text-[#ff0000]`) or inline `style` attributes. Use only standard Tailwind utility classes. If a design token is missing, extend the theme in the Tailwind config.

- No `w-[...]`, `h-[...]`, `text-[...]`, `bg-[...]` or any bracket notation.
- No `style={{ ... }}` props.
- Use only standard Tailwind utility classes (`w-48`, etc.).

## No Raw Tailwind Palette Colors — Use Theme Tokens Only

All color utilities must reference a semantic token defined in `src/styles/tailwind.css`. Never use a raw Tailwind palette color (`bg-gray-100`, `text-red-500`, `border-blue-200`, `bg-white`, `bg-black`, etc.) directly in a component.

**Why:** The theme is the single source of truth for colors. Raw palette values drift over time, bypass brand/light-dark theming, and make global design changes impossible.

### Available token families

Defined in [src/styles/tailwind.css](../src/styles/tailwind.css):

- **Brand** — `primary`, `primary-foreground`, `primary-foreground-muted`, `primary-foreground-subtle`
- **Surfaces (light)** — `surface`, `surface-muted`, `surface-subtle`, `surface-strong`
- **Surfaces (inverse/dark)** — `surface-inverse`, `surface-inverse-muted`, `surface-inverse-subtle`
- **Borders** — `border`, `border-muted`, `border-strong`
- **Foreground (text)** — `foreground`, `foreground-muted`, `foreground-subtle`, `foreground-faint`
- **Semantic** — `success`, `danger`, `info`, `warning` — each with `-subtle`, `-strong`, `-border` variants
- **Indicators** — `indicator-{amber,purple,green,blue,emerald}` for categorical dots/badges
- **Overlay** — `overlay` for modal backdrops

### Correct vs. wrong

```tsx
// Correct
<div className="bg-surface border border-border text-foreground-muted">
<Chip className="bg-success-subtle text-success-strong border-success-border">
<Dialog.Backdrop className="bg-overlay/40" />

// Wrong
<div className="bg-white border border-gray-200 text-gray-700">
<Chip className="bg-green-50 text-green-700 border-green-200">
<Dialog.Backdrop className="bg-black/40" />
```

### When a token is missing

Do **not** reach for a raw palette value to fill a gap. Add a new token to `src/styles/tailwind.css` first, then use it. Prefer extending an existing family (e.g. `--color-border-xxx`) over inventing a new one.

## Number & Currency Formatting

Never display raw numbers or currency values. Money arrives from the API as
integer paisa and stays an integer until it is rendered:

```ts
import { CurrencyHelper } from "#/lib/helpers/currency.helper";

CurrencyHelper.formatNpr(12345650); // "Rs 1,23,456.50"
CurrencyHelper.toLocaleString(15000); // "15,000"
```

Price inputs take rupee text and convert with `MoneyHelper.parseRupees` from
`@repo/shared` (never `parseFloat`); edit forms prefill with
`MoneyHelper.toRupeesString(paisa)`.

Dates are shown and picked in **Bikram Sambat**, never AD. The API keeps
sending AD (instants and `YYYY-MM-DD` calendar dates); conversion happens only
in `DateHelper` (built on `BsDateHelper` from `@repo/shared`) and the BS pickers.
Instants render as the BS day in `Asia/Kathmandu`; calendar dates use
`DateHelper.formatCalendarDate`, never a timezone conversion. Date inputs use
`FormDateInput` / `BsDatePicker` and range filters `DateRangeFilter`, never
`type="date"` or Ark's Gregorian `DatePicker`.

## Forms

- Every `<form>` has `noValidate` and exactly one `type="submit"` button. `Button`
  and `ActionButton` default to `type="button"`; never rely on a default submit.
- Rows of an array field are `withForm` components that read their line with
  `form.Subscribe` (see `DailySaleLineRow`). Don't read nested values from the
  array field's own `state.value`; it doesn't update when a nested field does.
- Money fields use `FormMoneyInput` (rupees typed, paisa stored); volumes use
  `FormVolumeInput` (litres typed, ml stored).
- List pages keep page, filters and sort in the URL: the route's
  `validateSearch` uses the shared list-query schema through
  `SearchParamsHelper.parse`, and the page gets `search` / `onSearchChange`.

## Validation Schemas

Request schemas come from `@repo/shared` and are the same ones the API
validates with. Pass them straight to a form's `validators`; don't redefine a
local zod schema for a payload the API already describes.

## No AI Comments

Never add comments that indicate AI authorship or generation (e.g. `// AI generated`, `// Added by Claude`, `// Generated by`, etc.). Doesn't necessarily have to be such, but any unnecessary comment can be avoided.
