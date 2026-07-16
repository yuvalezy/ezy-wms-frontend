import {useCallback, useMemo} from "react";
import {formatNumber} from "@/utils/number-utils";
import {ReportColumnAlign, ReportColumnFormat} from "@/features/reports/data/types";

/**
 * Cell formatting for SQL-driven report columns.
 *
 * **Why this exists instead of calling `formatNumber` directly:** `formatNumber` coerces
 * null/undefined/NaN to `0`. That is correct for a quantity field (a missing quantity is zero
 * items) and *wrong* for a nullable SQL column — rendering `0` for a NULL makes the report state
 * something the database never said. Every path here therefore guards null **first** and renders
 * {@link EMPTY_CELL}, then delegates to the shared, already-null-guarded helpers.
 *
 * **Why dates are rendered in UTC and this module does *not* use `useDateTimeFormat`:** report rows
 * are SAP's own raw DB columns, which hold **wall-clock** values with no timezone (an invoice dated
 * `2026-07-16` is that date in SAP, full stop). On the way out, the backend's global
 * `UtcDateTimeConverter` stamps every `DateTime` — including the boxed ones inside a report row's
 * `Dictionary<string, object?>` — as `...T00:00:00Z`, and the axios interceptor's
 * `convertUTCStringsToDates` then hydrates that as a `Date` at UTC midnight. Rendering that in the
 * viewer's local zone (which is exactly what `useDateTimeFormat` does) shifts every cell by the
 * viewer's UTC offset: at UTC-5 the invoice above renders as **7/15/2026**, a full day early, and a
 * 14:30 due time renders as 10:30. `useDateTimeFormat` is correct for WMS's *own* EF timestamps —
 * those are genuinely UTC instants written via `DateTime.UtcNow` — and wrong here. So these
 * formatters pin `timeZone: "UTC"`, which undoes the stamp and renders back SAP's wall clock.
 * They are otherwise byte-identical to `useDateTimeFormat`'s output.
 *
 * Nothing here hand-rolls `toLocaleString` on a value it has not already proven is a valid, finite
 * Date (that is how the app got blanked once).
 */

/** Rendered for SQL NULL, and for any value that cannot be honestly coerced to the column's type. */
export const EMPTY_CELL = "—";

/** What a report cell can hold once the axios interceptor has run. */
export type ReportCellValue = Date | string | number | boolean | null | undefined;

/**
 * The minimum a column must declare to format a cell — structurally satisfied by
 * `ReportColumnDescriptor`, so callers can pass one straight through.
 */
export interface ReportCellFormatSpec {
  format: ReportColumnFormat;
  decimals?: number;
  align?: ReportColumnAlign | null;
}

/**
 * The date renderers the pure formatter needs. Supply {@link createReportDateFormatters} (the
 * default) — **not** `useDateTimeFormat()`, which renders in local time and would shift every cell
 * by the viewer's UTC offset. See the module docs.
 */
export interface ReportDateFormatters {
  dateFormat: (date: Date) => string;
  timeFormat: (date: Date) => string;
  dateTimeFormat: (date: Date) => string;
}

/** UTC is not a preference here — it is how the SAP wall-clock value is recovered. See module docs. */
const REPORT_TIME_ZONE = "UTC";

/** Matches `toLocaleTimeString()`'s default components, so only the zone changes, not the style. */
const TIME_PARTS: Intl.DateTimeFormatOptions = {hour: "numeric", minute: "numeric", second: "numeric"};

/**
 * `Intl.DateTimeFormat` construction is expensive and this runs per cell (rows x columns), so the
 * instances are cached per locale. An invalid locale falls back to the browser's rather than
 * throwing — a report must never blank the screen over a formatting detail.
 */
const formatterCache = new Map<string, Intl.DateTimeFormat>();

const utcFormatter = (locale: string | undefined, parts: Intl.DateTimeFormatOptions, cacheKey: string): Intl.DateTimeFormat => {
  const key = `${locale ?? ""}|${cacheKey}`;
  const cached = formatterCache.get(key);
  if (cached) {
    return cached;
  }
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat(locale, {...parts, timeZone: REPORT_TIME_ZONE});
  } catch {
    formatter = new Intl.DateTimeFormat(undefined, {...parts, timeZone: REPORT_TIME_ZONE});
  }
  formatterCache.set(key, formatter);
  return formatter;
};

/**
 * Date renderers pinned to UTC, so a SAP wall-clock value renders as the wall clock SAP holds
 * regardless of where the viewer sits. Output is otherwise identical to `useDateTimeFormat`'s.
 *
 * @param locale BCP 47 locale. Defaults to the browser's.
 */
export function createReportDateFormatters(locale?: string): ReportDateFormatters {
  const dateFormat = (date: Date) => utcFormatter(locale, {}, "date").format(date);
  const timeFormat = (date: Date) => utcFormatter(locale, TIME_PARTS, "time").format(date);
  return {
    dateFormat,
    timeFormat,
    // Matches useDateTimeFormat's "<date> <time>" shape rather than inventing a new one.
    dateTimeFormat: (date: Date) => `${dateFormat(date)} ${timeFormat(date)}`,
  };
}

export interface ReportCellFormatOptions {
  /** Labels for `Boolean` columns. Pass `{true: t('yes'), false: t('no')}` — both keys exist in both locales. */
  booleanLabels?: { true: string; false: string };
  /** ISO 4217 code (e.g. `"USD"`). Omitted → `Currency` renders as a plain formatted number with no invented symbol. */
  currencyCode?: string | null;
  /** BCP 47 locale for `Currency`. Defaults to the browser locale. */
  locale?: string;
  /** Placeholder for `Binary` columns (bytes arrive base64-encoded and are not renderable). */
  binaryLabel?: string;
}

const DEFAULT_BOOLEAN_LABELS = {true: "Yes", false: "No"};
const DEFAULT_BINARY_LABEL = "[binary]";

/** SQL/SAP truthy-falsy tokens: real bits arrive as JSON booleans, but char(1) 'Y'/'N' columns are everywhere in SAP. */
const TRUE_TOKENS = new Set(["true", "y", "yes", "1"]);
const FALSE_TOKENS = new Set(["false", "n", "no", "0"]);

/**
 * Coerces to a finite number, or `null` when the value is not honestly numeric.
 * Deliberately **not** `Number(value)` alone: `Number("")` and `Number(null)` are both `0`, which
 * is exactly the lie this module exists to prevent.
 */
const toFiniteNumber = (value: ReportCellValue): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  // Booleans and Dates in a numeric column mean the column format is mis-declared; say so with
  // an em dash rather than inventing 0/1 or an epoch millisecond count.
  return null;
};

/** Coerces to a valid `Date`, or `null`. Numbers are read as epoch milliseconds. */
const toDate = (value: ReportCellValue): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }
    const parsed = new Date(trimmed);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
};

const toBoolean = (value: ReportCellValue): boolean | null => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value !== 0 : null;
  }
  if (typeof value === "string") {
    const token = value.trim().toLowerCase();
    if (TRUE_TOKENS.has(token)) {
      return true;
    }
    if (FALSE_TOKENS.has(token)) {
      return false;
    }
  }
  return null;
};

const formatCurrency = (value: number, decimals: number, options?: ReportCellFormatOptions): string => {
  const currency = options?.currencyCode?.trim();
  if (!currency) {
    // No currency declared — format the magnitude only rather than guess a symbol.
    return formatNumber(value, decimals, options?.locale);
  }
  try {
    return new Intl.NumberFormat(options?.locale, {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    // An invalid currency code throws RangeError; a report must never blank the screen over it.
    return formatNumber(value, decimals, options?.locale);
  }
};

/**
 * Formats one cell for display. Pure. `formatters` defaults to the UTC-pinned
 * {@link createReportDateFormatters}, which is what report cells require — components should use
 * the {@link useReportCellFormatter} hook, which wires this up.
 *
 * Guarantees: SQL NULL always renders {@link EMPTY_CELL} and never `0`; dates render as SAP's wall
 * clock in every timezone, not shifted by the viewer's UTC offset; no format path can throw.
 */
export function formatReportCell(
  value: unknown,
  column: ReportCellFormatSpec,
  formatters?: ReportDateFormatters,
  options?: ReportCellFormatOptions,
): string {
  // NULL is guarded before anything else, for every format — this is the whole point of the module.
  if (value === null || value === undefined) {
    return EMPTY_CELL;
  }

  const cell = value as ReportCellValue;
  const decimals = column.decimals ?? 2;
  const dates = formatters ?? createReportDateFormatters(options?.locale);

  switch (column.format) {
    case ReportColumnFormat.Number: {
      const numeric = toFiniteNumber(cell);
      return numeric === null ? EMPTY_CELL : formatNumber(numeric, decimals, options?.locale);
    }
    case ReportColumnFormat.Currency: {
      const numeric = toFiniteNumber(cell);
      return numeric === null ? EMPTY_CELL : formatCurrency(numeric, decimals, options);
    }
    case ReportColumnFormat.Percent: {
      // The stored value is taken as the percentage itself (15.5 → "15.50%"), not a 0-1 fraction:
      // SQL columns declared as a percent overwhelmingly hold the former.
      const numeric = toFiniteNumber(cell);
      return numeric === null ? EMPTY_CELL : `${formatNumber(numeric, decimals, options?.locale)}%`;
    }
    case ReportColumnFormat.Date: {
      const date = toDate(cell);
      return date === null ? EMPTY_CELL : dates.dateFormat(date);
    }
    case ReportColumnFormat.DateTime: {
      const date = toDate(cell);
      return date === null ? EMPTY_CELL : dates.dateTimeFormat(date);
    }
    case ReportColumnFormat.Time: {
      const date = toDate(cell);
      return date === null ? EMPTY_CELL : dates.timeFormat(date);
    }
    case ReportColumnFormat.Boolean: {
      const flag = toBoolean(cell);
      if (flag === null) {
        return EMPTY_CELL;
      }
      const labels = options?.booleanLabels ?? DEFAULT_BOOLEAN_LABELS;
      return flag ? labels.true : labels.false;
    }
    case ReportColumnFormat.Binary:
      return options?.binaryLabel ?? DEFAULT_BINARY_LABEL;
    case ReportColumnFormat.Text:
    default:
      // A Text cell can still arrive as a Date: the interceptor converts any UTC-shaped string,
      // regardless of the column's declared format. Render it readably, not as "Tue Jul 16 2026…".
      if (cell instanceof Date) {
        return Number.isNaN(cell.getTime()) ? EMPTY_CELL : dates.dateTimeFormat(cell);
      }
      return String(cell);
  }
}

/**
 * The column's declared alignment, or a sensible default derived from its format when the backend
 * left `align` null (the contract's "null = client derives").
 */
export function resolveReportColumnAlign(column: ReportCellFormatSpec): ReportColumnAlign {
  if (column.align) {
    return column.align;
  }
  switch (column.format) {
    case ReportColumnFormat.Number:
    case ReportColumnFormat.Currency:
    case ReportColumnFormat.Percent:
      return "right";
    case ReportColumnFormat.Date:
    case ReportColumnFormat.DateTime:
    case ReportColumnFormat.Time:
    case ReportColumnFormat.Boolean:
      return "center";
    default:
      return "left";
  }
}

/**
 * Stable per-cell formatter bound to the user's locale. Use this from components.
 *
 * Deliberately built on {@link createReportDateFormatters} rather than `useDateTimeFormat` — dates
 * in report rows are SAP wall-clock values and must render in UTC. See the module docs.
 */
export function useReportCellFormatter(options?: ReportCellFormatOptions) {
  const trueLabel = options?.booleanLabels?.true;
  const falseLabel = options?.booleanLabels?.false;
  const currencyCode = options?.currencyCode;
  const locale = options?.locale;
  const binaryLabel = options?.binaryLabel;

  const formatters = useMemo(() => createReportDateFormatters(locale), [locale]);

  return useCallback(
    (value: unknown, column: ReportCellFormatSpec): string =>
      formatReportCell(value, column, formatters, {
        booleanLabels: trueLabel !== undefined && falseLabel !== undefined
          ? {true: trueLabel, false: falseLabel}
          : undefined,
        currencyCode,
        locale,
        binaryLabel,
      }),
    [formatters, trueLabel, falseLabel, currencyCode, locale, binaryLabel],
  );
}
