/**
 * TypeScript mirror of the backend reports contract (`Core/Enums`, `Core/DTOs/Reports`).
 *
 * The backend registers `JsonStringEnumConverter` with **no naming policy**, so the C# member
 * name is the verbatim wire value — every enum below therefore uses the C# member name as both
 * the TS member name and its string value. Property names are camelCase (ASP.NET default).
 */

/* ------------------------------------------------------------------ enums */

/** Mirrors `Core.Enums.ReportColumnFormat`. Drives cell rendering (see `utils/report-format.ts`). */
export enum ReportColumnFormat {
  Text = 'Text',
  Number = 'Number',
  Currency = 'Currency',
  Percent = 'Percent',
  Date = 'Date',
  DateTime = 'DateTime',
  Time = 'Time',
  Boolean = 'Boolean',
  Binary = 'Binary',
}

/**
 * Mirrors `Core.Enums.ReportVariableType`.
 * Note `Integer`/`Decimal` are split (not a single `Number`), and `YesNo` maps to SAP's
 * `char(1)` `'Y'`/`'N'` columns — it is not a `Boolean`.
 */
export enum ReportVariableType {
  Text = 'Text',
  Integer = 'Integer',
  Decimal = 'Decimal',
  Date = 'Date',
  DateTime = 'DateTime',
  Boolean = 'Boolean',
  YesNo = 'YesNo',
  SelectList = 'SelectList',
  SqlLookup = 'SqlLookup',
  DateRange = 'DateRange',
}

/** Mirrors `Core.Enums.ReportSortDirection`. Direction is an enum on the wire, never a free string. */
export enum ReportSortDirection {
  Asc = 'Asc',
  Desc = 'Desc',
}

/** Mirrors `Core.Enums.ReportTotalCountMode`. `None` is the default — paging uses `hasMore`, not a total. */
export enum ReportTotalCountMode {
  None = 'None',
  Exact = 'Exact',
}

/** `ReportColumn.Align` is a nullable string on the backend, not an enum. `null` → the client derives it from `format`. */
export type ReportColumnAlign = 'left' | 'center' | 'right';

/* ------------------------------------------------------- execution: request */

/**
 * Mirrors `Core.DTOs.Reports.ReportVariableValue`. Every field is a **string** by design —
 * the backend parses strictly and rejects rather than coercing, so never pre-convert here.
 *
 * - `value`  — single-valued variables.
 * - `values` — `allowMultiple` variables (bound server-side as ONE CSV parameter).
 * - `from`/`to` — `DateRange` variables only (emitted as `@XFrom`/`@XTo`; requires from <= to).
 */
export interface ReportVariableValue {
  value?: string | null;
  values?: string[] | null;
  from?: string | null;
  to?: string | null;
}

/** Mirrors `Core.DTOs.Reports.ReportExecutionRequest`. Variable keys are matched case-insensitively server-side. */
export interface ReportExecutionRequest {
  variables: Record<string, ReportVariableValue>;
  /** Unknown key → 400. Omitted → the report's declared default sort. */
  sortColumnKey?: string | null;
  sortDirection?: ReportSortDirection | null;
  /** Clamped server-side: rejected if < 0, hard-capped at 100,000 (OFFSET is O(n)). */
  offset: number;
  /** Clamped server-side to [1, 200] (hard max 500). Omitted → the report's `defaultPageSize`. */
  limit?: number | null;
}

/* ------------------------------------------------------ execution: results */

/**
 * Mirrors `Core.DTOs.Reports.ReportColumnDescriptor`. Serves double duty: discovery output
 * (`sqlTypeName` populated) and runtime metadata (`sqlTypeName` null).
 */
export interface ReportColumnDescriptor {
  key: string;
  label: string;
  format: ReportColumnFormat;
  /** null → derive from `format` (numeric right, boolean/date centre, else left). */
  align?: ReportColumnAlign | null;
  decimals: number;
  visible: boolean;
  sortable: boolean;
  nullable: boolean;
  order: number;
  /** Discovery only — always null on a run response. */
  sqlTypeName?: string | null;
}

/** A single result row: SQL-driven, so keys are only known at runtime. Values may be null. */
export type ReportRow = Record<string, unknown>;

/**
 * Mirrors `Core.DTOs.Reports.ReportPageResult`.
 * Deliberately has **no** total count — the engine fetches `limit + 1`, trims, and sets `hasMore`,
 * so Next/Prev costs one query. An exact count is the separate lazy `/count` endpoint.
 */
export interface ReportPageResult {
  columns: ReportColumnDescriptor[];
  rows: ReportRow[];
  hasMore: boolean;
  offset: number;
  limit: number;
  sortColumnKey?: string | null;
  /** Echoes the direction actually applied — trust this over local state for the header arrow. */
  sortDirection: ReportSortDirection;
  durationMs: number;
}

/** Mirrors `Core.DTOs.Reports.ReportLookupOption`. Both fields are non-null server-side, satisfying the `<Select>` rule. */
export interface ReportLookupOption {
  value: string;
  label: string;
}

/** Mirrors `Core.DTOs.Reports.ReportValidationResult` — the `Test` button's response. */
export interface ReportValidationResult {
  valid: boolean;
  errors: string[];
  /** e.g. declared-but-unreferenced variables — harmless under sp_executesql, so warn, don't reject. */
  warnings: string[];
  columns: ReportColumnDescriptor[];
}

/* ---------------------------------------------------------- definition DTOs */

/** Mirrors `Core.DTOs.Reports.ReportDefinitionSummary`. */
export interface ReportDefinitionSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  enabled: boolean;
  columnCount: number;
  variableCount: number;
  /** The axios interceptor converts UTC strings to `Date`; non-UTC-shaped strings pass through. */
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

/**
 * Mirrors `Core.DTOs.Reports.ReportVariableDescriptor`.
 * `options` is **pre-parsed server-side** from the stored `StaticOptions` JSON — never parse it here.
 */
export interface ReportVariableDescriptor {
  name: string;
  label: string;
  type: ReportVariableType;
  decimals: number;
  required: boolean;
  allowMultiple: boolean;
  defaultValue?: string | null;
  options: ReportLookupOption[];
  /** true → the runner must call `lookup(slug, name, ...)` to populate this variable's dropdown. */
  hasLookup: boolean;
  /** Superuser only — null for ordinary users. */
  lookupSql?: string | null;
  order: number;
}

/**
 * Mirrors `Core.DTOs.Reports.ReportDefinitionDetail`.
 * `sql`/`countSql` (and `variables[].lookupSql`) are nullable because `ReportService` strips them
 * for non-superusers on `GET /report/{slug}` — null means "not authorised to see", not "empty".
 */
export interface ReportDefinitionDetail {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sql?: string | null;
  countSql?: string | null;
  enabled: boolean;
  recompile: boolean;
  totalCountMode: ReportTotalCountMode;
  defaultPageSize: number;
  defaultSortColumnKey?: string | null;
  defaultSortDirection: ReportSortDirection;
  timeoutSeconds: number;
  columns: ReportColumnDescriptor[];
  variables: ReportVariableDescriptor[];
  createdAt: Date | string;
  updatedAt?: Date | string | null;
}

/* ------------------------------------------------------------- CRUD requests */

/** Mirrors `Core.DTOs.Reports.ReportColumnRequest`. */
export interface ReportColumnRequest {
  key: string;
  label: string;
  format: ReportColumnFormat;
  align?: ReportColumnAlign | null;
  /** Server-side `[Range(0, 10)]`. */
  decimals: number;
  visible: boolean;
  sortable: boolean;
  nullable: boolean;
  order: number;
}

/**
 * Mirrors `Core.DTOs.Reports.ReportVariableRequest`.
 * `options` is serialized to `StaticOptions` JSON by the service — send the array, not a string.
 */
export interface ReportVariableRequest {
  /** `^[A-Za-z_][A-Za-z0-9_]{0,59}$`, no `__` prefix, unique case-insensitively. Max 60 chars (leaves room for DateRange's From/To). */
  name: string;
  label: string;
  type: ReportVariableType;
  decimals: number;
  required: boolean;
  allowMultiple: boolean;
  defaultValue?: string | null;
  options: ReportLookupOption[];
  lookupSql?: string | null;
  order: number;
}

/** Mirrors `Core.DTOs.Reports.CreateReportDefinitionRequest`. */
export interface CreateReportDefinitionRequest {
  name: string;
  slug: string;
  description?: string | null;
  /** Must contain `{{orderBy}}` and `{{paging}}` exactly once each. */
  sql: string;
  countSql?: string | null;
  enabled: boolean;
  /** Appends `OPTION (RECOMPILE)` at statement level in both shapes — never write it by hand. */
  recompile: boolean;
  totalCountMode: ReportTotalCountMode;
  /** Server-side `[Range(1, 200)]`. */
  defaultPageSize: number;
  defaultSortColumnKey?: string | null;
  defaultSortDirection: ReportSortDirection;
  /** Server-side `[Range(5, 300)]`. */
  timeoutSeconds: number;
  columns: ReportColumnRequest[];
  variables: ReportVariableRequest[];
}

/** Mirrors `Core.DTOs.Reports.UpdateReportDefinitionRequest : CreateReportDefinitionRequest`. */
export interface UpdateReportDefinitionRequest extends CreateReportDefinitionRequest {
  id: string;
}
