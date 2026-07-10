# Backend integration contract

This is the frontend-facing copy of the cross-repository contract. The backend
repository maintains the complementary document at
`ezy-wms-backend/docs/frontend-backend-contract.md` when both repositories are
checked out under the workspace root. Last verified: 2026-07-10.

## API client and authentication

Use `src/utils/axios-instance.ts` for authenticated API calls. Its base URL is
`${ServerUrl}/api/`, where `ServerUrl` is resolved from runtime
`window.__env.VITE_APP_SERVER_URL`, then `VITE_APP_SERVER_URL`, then the production
browser origin. It sends cookies (`withCredentials`), the bearer token from
`sessionStorage`, and `X-Device-UUID`.

The backend login endpoint is `POST /api/authentication/login`; company bootstrap is
`GET /api/authentication/CompanyInfo`. The backend also sets an HTTP-only
`ezywms_session` cookie for browser sessions. The Axios response interceptor sends
`401` users to `/login?reason=session-expired` and `403` users to `/unauthorized`.

## Readiness and failure states

The backend can start in SAP lockdown mode. Setup/system/authentication/configuration
and health endpoints stay available, while business calls can return `503` until
SAP configuration is valid. `SystemGate` must preserve this setup path.

Treat these states distinctly:

| Response/state | Frontend behavior |
| --- | --- |
| `401` | Clear/refresh session through existing auth handling and navigate to login |
| `403` | Show unauthorized route; do not retry as a normal data failure |
| `503` during startup | Keep setup/readiness UI available; do not report as invalid line input |
| Network offline | Show `OfflineOverlay`; do not assume an operation completed |
| SAP/service failure | Surface the backend error and refresh authoritative workflow state before retrying |

## Shared capability contract

The backend projects application settings and capabilities into authenticated user
and general-information responses. The frontend uses them for menu/route gates:

- receipt type controls transactional versus confirmation workflows;
- `enableTransferConfirm`, `enableTransferRequest`, and `enableWarehouseTransfer`
  control transfer surfaces;
- `binLocations` controls bin checks and direct transfer;
- supervisor-required settings change whether creation screens are exposed to a
  regular operator role;
- picking, unit, scanner, vendor, package-label, and repack settings change screen
  behavior.

The backend authorization/validation is authoritative. Never rely on a hidden menu
as permission enforcement.

## Deployment URL rule

In development, `VITE_APP_SERVER_URL` or `window.__env.VITE_APP_SERVER_URL` can
point the SPA at a separate API. In production the current client uses
`window.location.origin`; a separate API therefore requires same-origin hosting or
a reverse proxy. Setting only a production Vite variable does not change the
compiled client behavior.

## Embedded documentation API

The protected documentation pages use the same Axios client and session contract as
the rest of the SPA:

| Client operation | Request | Purpose |
| --- | --- | --- |
| `getDocumentationIndex(locale)` | `GET /api/docs?locale=en|es` | Load articles visible to the current user |
| `getDocumentationArticle(module, slug, locale)` | `GET /api/docs/{module}/{slug}?locale=en|es` | Load one Markdown article |

`DocsContext` maps every non-Spanish i18n language to `en`; Spanish languages map
to `es`. The server remains responsible for authentication, super-user/role, and
feature visibility, so the frontend must treat an article missing from the index or
returning `404` as unavailable rather than revealing it through a deep link.

The HelpPanel filters the already-loaded index in the browser. It does not call the
backend search endpoint, so changing search behavior requires documenting and
testing both the index payload and the panel filter. The article response contains
the manifest summary plus Markdown content, which `MarkdownRenderer` displays
without enabling raw HTML.

## Known transfer-confirmation mismatch

Documentation validation found inconsistent role enforcement for the transfer
confirmation workflow. The SPA protects the operator route with
`TransferConfirmation` and the report routes with
`TransferConfirmationSupervisor`, but `GoodsReceiptController.GetGoodsReceipts`
currently checks `Transfer`/`TransferSupervisor` when listing transfer-confirmation
documents. The supervisor route/menu also uses different role sets in `App.tsx` and
`useMenus.tsx`, while backend report endpoints require
`TransferConfirmationSupervisor`.

This is a reproducible contract defect: a user with only the confirmation role can
pass the SPA route guard but receive `403` when the list loads. Resolve the role
mapping in the backend and frontend together before treating this workflow as
stable.

Cancellation-reason reads require an authenticated session; only modifications are
super-user protected. The frontend uses the normal Axios client, so access-policy
changes must be coordinated with `CancellationReasonController`.

## API families consumed by the SPA

| Frontend feature | Backend family |
| --- | --- |
| `features/goods-receipt` | `/api/goodsreceipt*` |
| `features/picking` | `/api/picking*` |
| `features/counting` | `/api/counting*` |
| `features/transfer` | `/api/transfer*` |
| `features/direct-transfer` | `/api/directtransfer*` |
| `features/items` | `/api/items*` |
| `features/login`, `home`, `account` | `/api/authentication*`, `/api/general*`, `/api/system*`, `/health*` |
| `features/users` | `/api/user*` |
| `features/authorization-groups` | `/api/authorizationgroup*` |
| `features/devices` | `/api/device*`, `/api/general/device/name` |
| `features/configuration` | `/api/configuration*`, `/api/smtp*` |
| `features/license` | `/api/license*`, `/api/authentication/license-status` |
| `features/external-alerts` | `/api/externalsystemalert*` |
| `NotificationContext` | `/api/wmsalert*`, `/hubs/notifications` |
| `features/docs` | `/api/docs`, `/api/docs/{module}/{slug}` |

The source controller attributes and TypeScript data services are the definitive
verb/path/DTO reference. Swagger should be regenerated/checked when a backend route
changes.

## Contract hazards

- Keep `RoleType` numeric values aligned between C# and TypeScript.
- Preserve decimal quantities and UTC dates.
- Preserve `X-Device-UUID` on all authenticated calls.
- Do not bypass Axios date/error/auth interceptors with ad hoc clients.
- Do not change action casing or route prefixes without treating it as a breaking
  API change.
- Configuration JSON is section-oriented and supports optimistic versions, secret
  masking, validation, import/export, and restore; editor changes must preserve that
  envelope.
