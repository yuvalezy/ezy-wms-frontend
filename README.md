# EzyWMS frontend

The frontend is a React/TypeScript single-page application for warehouse operators,
supervisors, and super-users. It is deployed either as a standalone Vite app during
development or as static assets served by the backend from `Service/wwwroot`.

## Documentation

- [Architecture](docs/architecture.md) — application composition, routing, state,
  API transport, and UI conventions.
- [Functionality](docs/functionality.md) — operator, supervisor, and administration
  workflows mapped to backend controllers.
- [Backend integration](docs/backend-integration.md) — shared route, auth, role,
  feature-gate, and failure-state contract.
- [Embedded documentation](docs/documentation.md) — the authenticated `/docs`
  pages, contextual help panel, API contract, and WMS wiki coverage.

The backend owns the WMS article corpus and serves it through the documentation API.
Its engineering contract is in the sibling repository at
`../ezy-wms-backend/docs/` when both repositories are checked out together.

Authenticated users can use the HelpCircle button in the shared page header to open
the guide slide-over. It selects the article whose manifest route matches the
current page, or shows the guide list when there is no match. `/docs` is the full
index and `/docs/:module/*` is the full-page reader. The client loads the index and
article content from the authenticated `/api/docs` API in English or Spanish,
closes the slide-over with `Escape`, keeps long content vertically scrollable, and
renders only the supported safe Markdown subset without raw HTML.

## Current stack

- React 19 and React Router 7
- TypeScript 6 with strict checking
- Vite 8
- Tailwind CSS 4 and shadcn/ui/Radix primitives
- Axios for HTTP, SignalR for real-time notifications
- React Hook Form for non-trivial forms
- i18next/react-i18next with English and Spanish flat translation files

The exact dependency versions are in `package.json` and `package-lock.json`.

## Development

```bash
npm install
npm start             # http://localhost:5001
npm run build         # tsc && vite build
npm run build:prod
npm run preview
```

Set `VITE_APP_SERVER_URL` when the development API is not on the default location;
`window.__env.VITE_APP_SERVER_URL` is also read during development. Production uses
`window.location.origin`, so split-origin production deployments need a proxy or
same-origin hosting.

`npm run lint` is currently not usable because this repository has no ESLint package
or flat config. `npm test` is currently not usable because the Jest/ts-jest setup
fails on the current TypeScript configuration. Until those are repaired, use
`npx tsc --noEmit`, `npm run build`, and manual browser checks against a running
backend.

## Source-of-truth rules

- App routes and route guards: `src/App.tsx` and `src/components/ProtectedRoute.tsx`.
- Menus and capability filtering: `src/hooks/useMenus.tsx`.
- Authentication/session state: `src/components/AppContext.tsx` and
  `src/features/login/`.
- HTTP transport: `src/utils/axios-instance.ts`.
- Embedded documentation UI and route matching: `src/features/docs/`,
  `src/components/ContentTheme.tsx`, and the `/docs` routes in `src/App.tsx`.
- Feature behavior and API calls: `src/features/<feature>/`.
- Page composition: `src/Pages/` (capital `P`).
- Translations: `src/Translations/English/translation.json` and
  `src/Translations/Spanish/translation.json`.

The auth token is not stored in `localStorage`; the persistent device UUID is. Avoid
relying on the old README's mock-data, lowercase `src/pages`, or TypeScript 5.9
descriptions; those do not describe this checkout.
