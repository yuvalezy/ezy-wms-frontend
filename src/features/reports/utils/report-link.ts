import {ReportColumnLinkType, ReportRow} from "@/features/reports/data/types";

/**
 * Resolves a report column's link template against one row.
 *
 * **The rule that matters:** the *template* comes from the report's author and fixes the scheme;
 * the *values* come from SAP rows and are only ever percent-encoded into it. `encodeURIComponent`
 * escapes `:` and `/`, so a column containing `javascript:alert(1)` can only ever land as an inert
 * path or query segment — it can never become the URL's scheme, host, or a new path root.
 *
 * The scheme is re-checked here even though `ReportLinkTemplate.Validate` already checked it at
 * save time, because a definition row can be edited straight in the database and never pass through
 * that code. This module is the last thing between a stored string and an `href`, so it assumes
 * nothing upstream ran.
 */

/** A link ready to render. */
export interface ResolvedReportLink {
  /** The composed URL. Internal links are root-relative routes; external ones are absolute http/https. */
  href: string;
  /** True → render an `<a target="_blank">`. False → navigate client-side with react-router. */
  external: boolean;
}

/** The minimum a column must declare to resolve a link — structurally satisfied by `ReportColumnDescriptor`. */
export interface ReportCellLinkSpec {
  linkType?: ReportColumnLinkType | null;
  linkTemplate?: string | null;
}

const PLACEHOLDER_PATTERN = /\{([^{}]*)\}/g;

/**
 * A row value as a URL-safe string, or `null` when it cannot honestly be one.
 *
 * A null/blank value returning `null` is what stops `/itemCheck/undefined` — a link that looks live
 * and 404s is worse than the plain text it replaced, so the cell falls back to text instead.
 */
const toLinkValue = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }
  // The axios interceptor hydrates any UTC-shaped string into a Date before it reaches here.
  // ISO is the only stable, locale-independent thing to put in a URL.
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "object") {
    return null;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

/**
 * True when `href` is safe to render for `linkType`. Mirrors the backend's `ValidateScheme` — see
 * the module docs for why this is checked twice rather than trusted.
 */
export const isSafeReportLink = (href: string, linkType: ReportColumnLinkType): boolean => {
  if (linkType === ReportColumnLinkType.Internal) {
    // Single leading slash only: "//evil.com/x" is protocol-relative and leaves the app.
    return href.startsWith("/") && !href.startsWith("//");
  }
  if (linkType === ReportColumnLinkType.External) {
    const lower = href.toLowerCase();
    return lower.startsWith("http://") || lower.startsWith("https://");
  }
  return false;
};

/**
 * Composes one cell's link, or returns `null` to render plain text.
 *
 * Returns `null` when the column does not link, the template is missing or unsafe, or any
 * placeholder resolves to NULL/blank in this row.
 *
 * @param column The column's link configuration.
 * @param row    The row being rendered; placeholders resolve against its other columns.
 */
export function resolveReportLink(column: ReportCellLinkSpec, row: ReportRow): ResolvedReportLink | null {
  const linkType = column.linkType ?? ReportColumnLinkType.None;
  const template = column.linkTemplate?.trim();

  if (linkType === ReportColumnLinkType.None || !template) {
    return null;
  }

  // Row keys are SQL output names; SQL Server's default collation is case-insensitive, and the
  // backend matches placeholders the same way, so a template written as {itemcode} must still find
  // the "ItemCode" column rather than silently rendering as plain text.
  const byLowerKey = new Map(Object.keys(row).map((key) => [key.toLowerCase(), key]));

  let resolvable = true;
  const href = template.replace(PLACEHOLDER_PATTERN, (_match, placeholder: string) => {
    const rowKey = byLowerKey.get(placeholder.trim().toLowerCase());
    const value = rowKey === undefined ? null : toLinkValue(row[rowKey]);
    if (value === null) {
      resolvable = false;
      return "";
    }
    return encodeURIComponent(value);
  });

  if (!resolvable || !isSafeReportLink(href, linkType)) {
    return null;
  }

  return {href, external: linkType === ReportColumnLinkType.External};
}
