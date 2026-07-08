# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See also `/mnt/dev/wms/CLAUDE.md` for the cross-repo workspace overview (this frontend + the `ezy-wms-backend` sibling repo).

## Commands

```bash
npm start            # Vite dev server --host, http://localhost:5001
npm run build        # tsc && vite build
npm run build:prod   # cross-env NODE_ENV=production tsc && vite build
npm run preview       # preview a production build
npm run lint          # currently non-functional, see below
npm test              # currently non-functional, see below
```

**Lint and Jest are both currently broken — don't trust a green/red result from either:**
- `eslint` isn't even in `package.json` (`devDependencies` has no `eslint` package, no `eslint.config.*` file exists). `npm run lint` fails to even start.
- `npm test` (Jest, `jest.config.js`) fails all suites with `TS5011: The common source directory ... rootDir must be explicitly set` — `tsconfig.json` has no `rootDir` and `ts-jest@29` doesn't fully support the pinned `typescript@6.0.3`.
- Until these are fixed, verify changes with `npx tsc --noEmit`, `npm run build`, and by exercising the change in a running browser (see `/verify-ui` skill / `run` skill).

## Architecture

### Two-tier page structure

Routed pages live in `src/Pages/` (capital P) and are thin: `Module.tsx` (list/entry), `ModuleProcess.tsx` (process execution), `ModuleSupervisor.tsx` (supervisor dashboard) — e.g. `src/Pages/Counting/`, `src/Pages/GoodsReceipt/`.

Actual business logic, components, hooks, and data services live in a parallel **feature layer**: `src/features/<feature>/{components,hooks,data,utils,context}` (e.g. `src/features/goods-receipt/`, `src/features/picking/`, `src/features/transfer/`, `src/features/counting/`, `src/features/authorization-groups/`). When adding to an existing module, put logic in `features/`, not directly in `Pages/`.

### Routing & authorization

`src/App.tsx` builds routes via per-module helper functions (`getCountingRoutes`, `getGoodsReceiptRoutes`, `getPickingRoutes`, `getTransferRoutes`, `getSettingsRoutes`, ...), wrapped in `SystemGate` → `ErrorBoundary` → `Routes`. `SystemGate` handles the backend's lockdown-mode first-run flow (see the backend's `SystemLockdownMiddleware`) — gate loading state on `isInitializing`, not a combined `isLoading` that includes company-info fetches, or you get a login-screen remount loop.

Route protection is `src/components/ProtectedRoute.tsx` (`authorization?`, `authorizations?`, `superUser?` props). The role enum is **`RoleType`** (in `src/features/authorization-groups/data/authorization-group.ts`), not `Authorization` — authorization groups are a real CRUD settings feature (`/settings/authorizationGroups`), not a static enum.

### State management

Three contexts in `src/components/`:
- `AppContext.tsx` — exports `AuthContext`/`AuthProvider`/`useAuth` (the filename doesn't match the export name). Handles login/logout, idle timeout, company-info polling, device status, unit settings, an `authVersion` counter. **Auth token lives in `sessionStorage`, not `localStorage`.**
- `ThemeContext.tsx` — `loading`/`setLoading`/`setError` (toast-based error display) only.
- `NotificationContext.tsx` — SignalR-backed real-time alerts/presence (`NotificationProvider`/`useNotifications`).

Plus feature-scoped contexts where needed, e.g. `src/features/transfer/context/TransferProcessContext.tsx`.

### API layer

`src/utils/axios-instance.ts`: base URL from `window.__env?.VITE_APP_SERVER_URL` (runtime-injectable) falling back to `import.meta.env.VITE_APP_SERVER_URL` in dev or `window.location.origin` in prod; `withCredentials: true`. Request interceptor attaches `Authorization: Bearer <sessionStorage token>` and `X-Device-UUID`. Response interceptor redirects to `/login?reason=session-expired` on 401, `/unauthorized` on 403, and normalizes UTC date strings.

There is **no live mock-data switching** despite `VITE_APP_TEST` being declared in `src/vite-env.d.ts` — it's read nowhere in `src/**`. The two remaining `*-mock-data.ts` files (authorization-groups, cancellation-reasons) are orphaned and unused; don't rely on a mock/real data toggle existing.

### i18n

Translations are **one flat file per locale**, not per-module: `src/Translations/English/translation.json`, `src/Translations/Spanish/translation.json`. Every user-facing string needs a key in both files (the `/i18n` skill's "per-module file" guidance describes the EZY Portal project, not this one — don't split these into per-module files without a deliberate migration).

### Navigation / menus

`src/hooks/useMenus.tsx` exports `MenuItem` (`Link`, `Text`, `Authorization`/`Authorizations`, `SuperUser`, `Icon`, `Color`, `RequiresFeature`) and `useMenus()` → `MenuItems` array + `GetMenus()` filtering (device/account validity, `RequiresFeature` flags like `BinLocation`, `EnableInventoryTransfer`). Icons are imported directly from `lucide-react` per entry — there is **no separate icon-map file** to update here (that convention is specific to the EZY Portal project, not this one).

### UI components

shadcn/ui (`components.json`: style `new-york`, baseColor `gray`, aliases `@/components`, `@/lib/utils`) — 34 components in `src/components/ui/`. This repo has no style-guide doc of its own; `.junie/guidelines.md` exists but is stale (references lowercase `src/pages`, `src/lib`, `src/translations` that no longer match the actual casing/layout).

### TypeScript

`tsconfig.json`: `strict: true`, `noFallthroughCasesInSwitch`, `isolatedModules`, `moduleResolution: "bundler"`, target `es2020`, path alias `@/* → ./src/*`. `typescript` is pinned to `^6.0.3` — newer than the README's stated "TypeScript 5.9" and the root cause of the Jest `rootDir` breakage above.

## Working conventions

- Keep files under ~500 lines (refactor if larger).
- Follow SOLID; never change existing enum numeric values.
- Include icons in buttons; prefix placeholder comments with `TODO:`.
- Use React Hook Form for non-trivial forms; surface errors through `ThemeContext.setError()`.
- Add new modules under both `src/Pages/<Module>/` (routes) and `src/features/<module>/` (logic), add routing in `App.tsx`, register the menu entry in `src/hooks/useMenus.tsx`, and add translation keys to **both** `src/Translations/English/translation.json` and `src/Translations/Spanish/translation.json`.
- In any `<Select>`, every option/item needs a non-null, non-empty `value` prop.
