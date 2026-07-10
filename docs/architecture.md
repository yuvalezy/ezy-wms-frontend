# Frontend architecture

Last verified against source: 2026-07-10.

## Application shape

The app is a single React SPA with three layers:

```text
App.tsx
  AuthProvider -> NotificationProvider -> BrowserRouter
    DocsProvider -> AppRoutes
      SystemGate -> ErrorBoundary -> route tree
      Pages/<Module>              (route/page composition)
        features/<module>         (business components, hooks, data, utils)
          axiosInstance           (backend transport)
    HelpPanel                    (authenticated contextual help overlay)
```

The backend may serve the compiled assets and SPA fallback from the same origin.
During development Vite serves the SPA on port `5001`, while the backend normally
runs on port `5000`.

## Page and feature boundaries

`src/Pages/` contains routed page entry points. Existing modules commonly split into
list/entry, process, supervisor, and report screens. `src/features/` contains the
actual module behavior, including API data services, hooks, feature components,
contexts, types, and utilities. Shared primitives are in `src/components/`, with
shadcn/ui components under `src/components/ui/`.

When extending a module, keep page files focused on composition and put reusable or
stateful behavior in the matching feature folder. A new module normally needs both a
`src/Pages/<Module>/` route surface and a `src/features/<module>/` implementation.

## Routing and authorization

`src/App.tsx` defines the route tree and wraps it in `SystemGate`, an error boundary,
and `ProtectedRoute`. The route tree includes authentication, warehouse workflows,
supervisor/report views, direct transfer, checks, and super-user settings.

`ProtectedRoute` checks the current authenticated user, `RoleType` roles, and
super-user status. `useMenus.tsx` applies the same role information plus device,
account, and configuration feature gates to navigation. These checks improve the
user experience; the backend remains the security boundary.

The frontend role enum is in
`src/features/authorization-groups/data/authorization-group.ts` and must match the
numeric values in the backend `Core/Enums/RoleType.cs`.

## Global state

### `AuthContext`

`AppContext.tsx` exports `AuthProvider`, `AuthContext`, and `useAuth`. It manages:

- authentication and logout/session refresh;
- the device UUID/status and current device name;
- account validity and company information;
- user roles, warehouse, settings, metadata, and custom fields;
- idle timeout and browser-unload logout;
- unit settings and the initialization/loading distinction used by `SystemGate`.

The bearer token is kept in `sessionStorage`. Browser cookie sessions are handled by
the backend and Axios sends credentials with requests.

### Theme and notifications

`ThemeContext` owns loading/error toast state. `NotificationContext` loads alert
state through the API and maintains an authenticated SignalR connection to
`/hubs/notifications` for real-time notifications/presence updates.

Feature-specific state stays local to the feature. Transfer processing uses
`TransferProcessContext` to share state across its nested source/target routes.

## Embedded documentation

`DocsProvider` is mounted inside `BrowserRouter` and outside the route tree. It
loads the authenticated article index from `GET /api/docs` using the active locale
(`es` when the i18n language starts with `es`, otherwise `en`). It also detects the
current article by matching the manifest route pattern against `location.pathname`.

`ContentTheme` renders the HelpCircle button used by normal application pages.
Selecting it opens `HelpPanel`, which shows the route-matched guide when one exists
and the full guide list otherwise. The panel search is a client-side filter over the
loaded index; article content is fetched only when a guide is selected. `Escape`
closes the slide-over, and **Open full page** navigates to `/docs/:module/*`.

`DocsPage` provides the protected `/docs` index and article pages. Both the
slide-over reader and the full page use `MarkdownRenderer`, a deliberately limited
renderer for the backend Markdown corpus; raw HTML is not rendered. The slide-over
article and list regions are flex-constrained scroll areas so long guides remain
vertically scrollable.

The UI implementation is split across `src/features/docs/api.ts`,
`DocsContext.tsx`, `HelpPanel.tsx`, `DocsPage.tsx`, and `MarkdownRenderer.tsx`.
The backend owns article content, visibility filtering, and the manifest; see
[`documentation.md`](documentation.md) for the corpus and source-wiki audit.

## HTTP transport

`src/utils/axios-instance.ts` is the required API client. It:

- resolves the development server URL from runtime `window.__env` and then the Vite
  env value, while production uses the browser origin;
- prefixes calls with `/api/`;
- sends cookies and `X-Device-UUID`;
- attaches a bearer token from `sessionStorage`;
- normalizes UTC date strings in responses;
- redirects `401` to session-expired login and `403` to unauthorized.

Feature data services should use this instance rather than raw Axios. The login
company-info bootstrap has a deliberate unauthenticated direct request because it
can run before the normal client session exists.

## Configuration and translations

The backend supplies user/application settings. The SPA uses these values to render
unit selectors, scanner behavior, receipt/transfer modes, bin capability, picking
options, and menu feature gates. It does not own the authoritative configuration.

Translations are flat per locale, not per module. New user-visible strings require
keys in both `src/Translations/English/translation.json` and
`src/Translations/Spanish/translation.json`. The embedded documentation UI uses
the `docs.*` keys in both files; article titles and content come from the selected
backend locale.

## Runtime states that pages must handle

- Initial auth loading versus company-info loading: `SystemGate` must not conflate
  them or cause login remount loops.
- Lockdown/setup (`503`) while the backend is not SAP-ready.
- Expired session (`401`) and insufficient permission (`403`).
- Browser offline state shown by `OfflineOverlay`.
- Empty, partial, or stale workflow responses after a backend/SAP operation.
- Decimal quantities and UTC timestamps without lossy conversion.

## Frontend quality baseline

The repository is strict TypeScript and builds with `tsc` plus Vite. ESLint is not
configured, and the Jest command currently fails before tests execute due to the
ts-jest/TypeScript root-directory setup. A change is not considered verified from a
test/lint result alone until those tools are repaired; use the documented build and
manual API/browser checks.
