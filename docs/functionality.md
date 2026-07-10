# Frontend functionality

Last verified against source: 2026-07-10.

## Operator workflows

| Capability | Routes | Feature implementation | Backend contract |
| --- | --- | --- | --- |
| Goods receipt | `/goodsReceipt`, `/goodsReceipt/:scanCode` | `src/Pages/GoodsReceipt/`, `src/features/goods-receipt/` | `GoodsReceiptController` |
| Goods receipt supervision/reports | `/goodsReceiptSupervisor`, `/goodsReceiptReport`, report detail routes | same goods-receipt feature and report pages | `GoodsReceiptController`, `GoodsReceiptReportController` |
| Goods receipt confirmation | `/goodsReceiptConfirmation*` | goods-receipt pages with `ProcessType.Confirmation` | goods receipt/report controllers with confirmation process type |
| Picking | `/pick`, `/pick/:idParam`, check and repack subroutes | `src/Pages/Picking/`, `src/features/picking/` | `PickingController` |
| Counting | `/counting`, `/counting/:scanCode` | `src/Pages/Counting/`, `src/features/counting/` | `CountingController` |
| Counting supervision/reports | `/countingSupervisor`, `/countingSummaryReport/:scanCode` | counting supervisor/report pages | `CountingController` |
| Warehouse transfer | `/transfer`, nested `/source` and `/targetBins` | `src/Pages/Transfer/`, `src/features/transfer/`, `TransferProcessContext` | `TransferController` |
| Transfer request/approval | `/transferRequest`, `/transfer/approve*` | transfer request and approval pages | `TransferController` and approval workflow services |
| Transfer confirmation | `/transferConfirmation*` | goods-receipt process components with `ProcessType.TransferConfirmation` | goods receipt/report controllers |
| Direct transfer | `/directTransfer` | `src/Pages/DirectTransfer/`, `src/features/direct-transfer/` | `DirectTransferController` |
| Item/bin checks | `/itemCheck*`, `/binCheck*` | `src/Pages/items/`, `src/features/items/` | `ItemsController` |
| Embedded documentation | `/docs`, `/docs/:module/*` | `src/features/docs/` and `ContentTheme` help button | `DocsController` (`/api/docs*`) |

Goods receipt and receipt-confirmation report routes include the base report plus
the `VSExitReport/:scanCode`, `ProcessDifferenceReport/:scanCode`, and
`ReportAll/:scanCode` detail variants where defined in `src/App.tsx`. The source
WMS wiki documents these variants in the corresponding report pages; keep the route
names synchronized when adding or removing a report.

## Supervisor and administration surfaces

The settings routes are super-user protected:

- `/settings/users` — WMS users and enable/disable operations;
- `/settings/authorizationGroups` and its add/edit routes — role groups;
- `/settings/devices` — registered device state, name, and audit history;
- `/settings/license` — license status and synchronization actions;
- `/settings/externalAlerts` — external system alert recipients/rules;
- `/settings/configuration` — database-backed configuration sections, validation,
  history, import/export, and restore.

The shared `ContentTheme` header also exposes contextual WMS documentation. The
HelpCircle action opens the authenticated guide panel, and `/docs` provides the
full-page index/article reader. See [Embedded documentation](documentation.md).

Cancellation reasons are consumed by operator workflows and have an administration
feature implementation, while the backend allows authenticated reads so operators
can load reasons without super-user permission.

## Navigation behavior

`useMenus.tsx` is the navigation capability map. It filters entries by:

- current roles or `superUser`;
- active device and valid account for non-settings entries;
- receipt type (`Transactional`, `Confirmation`, or both);
- bin-location capability;
- transfer request, warehouse transfer, and transfer-confirmation settings.

Route protection in `App.tsx` must be updated alongside menu entries. A menu-only
change leaves deep links inconsistent; a route-only change leaves the feature hard
to discover.

The HelpCircle button in `ContentTheme` is available on the shared page shell. It
opens the current route's guide when the backend manifest declares a matching route,
and otherwise opens the searchable guide list. `/docs` itself is authenticated but
is not restricted to a particular WMS role; the backend controls which articles are
returned for the current user.

The documentation index and selected article load from the authenticated `/api/docs`
API using `en` or `es` selected from i18n. `Escape` closes the slide-over, its list
and article panes remain vertically scrollable, and **Open full page** navigates to
`/docs/:module/*`. `MarkdownRenderer` supports the WMS guide subset only and does
not render raw HTML or execute embedded content.

## Common user journeys

### First run/login

`SystemGate` waits for backend readiness and lets the setup/authentication surfaces
remain available during lockdown. The login feature collects the password and
optional warehouse/device name, then `AuthContext` loads user capabilities and
company information. Device/account banners and idle timeout are part of this flow.

### Process an inventory document

The user opens a list/entry page, scans or selects a document, enters line quantities,
and submits a process/cancel/update action through the feature data service. The UI
then refreshes the document/report state returned by the backend. Receipt and
transfer flows may have separate confirmation or supervisor screens based on the
settings returned with the user.

### Picking with optional controls

The picker opens an assigned pick list, works through detail/bin routes, and may use
check, package-label, and repack screens when enabled. Supervisor pages expose
oversight and completion state. The backend owns the authoritative pick lifecycle
and any SAP side effects.

### Real-time alerts/offline behavior

The notification provider combines API-loaded WMS alerts with SignalR updates. The
offline hook shows an overlay when browser connectivity is lost; pages must still
surface operation-level failures from the backend when connectivity returns or a
SAP dependency is unavailable.

## Extension checklist

For a new functional module, update all of these together:

1. page components under `src/Pages/`;
2. feature components/hooks/data/types under `src/features/`;
3. route and `ProtectedRoute` authorization in `src/App.tsx`;
4. menu entry and feature gate in `src/hooks/useMenus.tsx`;
5. English and Spanish translations;
6. embedded documentation article/manifest and the frontend documentation contract;
7. backend controller/DTO/service and the shared integration doc;
8. loading/error/503/offline behavior and build/browser verification.
