import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams, useSearchParams} from "react-router";
import {Sigma, TriangleAlert} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {DataTable, DataTableColumn, DataTableSort} from "@/components/ui/data-table";
import {useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {exportToExcel} from "@/utils/excelExport";
import {reportService} from "@/features/reports/data/report-service";
import {
  ReportColumnDescriptor,
  ReportColumnFormat,
  ReportDefinitionDetail,
  ReportPageResult,
  ReportRow,
  ReportSortDirection,
  ReportTotalCountMode,
} from "@/features/reports/data/types";
import {EMPTY_CELL, resolveReportColumnAlign, useReportCellFormatter} from "@/features/reports/utils/report-format";
import {resolveReportLink} from "@/features/reports/utils/report-link";
import {ReportCellLink} from "@/features/reports/components/ReportCellLink";
import {
  buildInitialVariableValues,
  getInvalidDateRanges,
  getMissingRequiredVariables,
  ReportFilterBar,
} from "@/features/reports/components/ReportFilterBar";
import {ReportVariableValues} from "@/features/reports/utils/report-variable-values";
import {ReportQueryProblem, variableValuesFromQuery} from "@/features/reports/utils/report-query-params";

/**
 * Runs one report (`/reports/:slug`): filter → run → paged, sortable table → Excel export.
 *
 * **There is no total row count, by design.** The engine fetches `limit + 1` rows and trims, so
 * Next/Prev costs exactly one query and never a `COUNT(*)` over SAP. An exact count is a separate,
 * explicitly-requested call, and only for reports whose author opted into it.
 *
 * Per-report access is the **backend's** decision, re-checked live on every call. This page renders
 * for any authenticated user and lets a 403 happen — the axios interceptor redirects to
 * `/unauthorized`. Guessing at access here would be a second, weaker copy of that rule.
 */

/** The server clamps `limit` to [1, 200]; export pages at the ceiling to minimize round trips. */
const EXPORT_CHUNK_SIZE = 200;

/**
 * Hard cap on an export, matching the backend's. `OFFSET` is O(n), so each successive page rescans
 * everything before it — an uncapped export of a large report degrades quadratically and pins SAP's
 * transaction log page after page.
 */
const EXPORT_ROW_LIMIT = 50000;

const toSortDirection = (direction: "asc" | "desc"): ReportSortDirection =>
  direction === "desc" ? ReportSortDirection.Desc : ReportSortDirection.Asc;

const toTableDirection = (direction: ReportSortDirection): "asc" | "desc" =>
  direction === ReportSortDirection.Desc ? "desc" : "asc";

const isNumericFormat = (format: ReportColumnFormat): boolean =>
  format === ReportColumnFormat.Number
  || format === ReportColumnFormat.Currency
  || format === ReportColumnFormat.Percent;

/**
 * Excel rejects worksheet names over 31 chars or containing `* ? : \ / [ ]`, and ExcelJS surfaces
 * that as a throw — a report innocently named "Sales / Q1" would fail the export at the last step,
 * after every row had already been fetched. Report names are free text, so they are sanitized here
 * rather than trusted.
 */
const toWorksheetName = (name: string): string => {
  const cleaned = name.replace(/[*?:\\/\[\]]/g, "-").trim().slice(0, 31);
  return cleaned.length > 0 ? cleaned : "Report";
};

const ReportRunner: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const navigate = useNavigate();
  const {slug} = useParams<{ slug: string }>();

  const [detail, setDetail] = useState<ReportDefinitionDetail | null>(null);
  const [values, setValues] = useState<ReportVariableValues>({});
  const [result, setResult] = useState<ReportPageResult | null>(null);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  /** Filters the URL asked for but could not be honoured. Non-empty → the report must not auto-run. */
  const [linkProblems, setLinkProblems] = useState<ReportQueryProblem[]>([]);
  /**
   * Re-entrancy guard, separate from the state above: `setIsExporting(true)` does not take effect
   * until the next render, so a fast double-click would otherwise start two 50k-row exports.
   */
  const exportInFlight = useRef(false);
  /**
   * The (definition, query string) this page has already applied. See the prefill effect — a ref,
   * not a dep array, is what makes that effect fire exactly once per combination.
   */
  const applied = useRef<{ detail: ReportDefinitionDetail; searchKey: string } | null>(null);

  const [searchParams] = useSearchParams();
  /** A primitive, so it can be a dep without depending on `searchParams`' object identity. */
  const searchKey = searchParams.toString();

  const formatCell = useReportCellFormatter({
    booleanLabels: {true: t("yes"), false: t("no")},
    binaryLabel: t("reports.binaryCell"),
  });

  const pageSize = detail?.defaultPageSize ?? 50;

  /**
   * Executes one page. Every input is an explicit argument rather than read from state: sorting and
   * paging both fetch in the same tick they update the UI, and reading `sort`/`offset` off a stale
   * closure would silently request the *previous* page's parameters.
   */
  const execute = useCallback(async (
    nextOffset: number,
    nextSort: DataTableSort | null,
    nextValues: ReportVariableValues,
  ) => {
    // `detail.slug !== slug` means the URL has already moved to another report but its definition
    // has not arrived yet — this component does not remount, so for one render `slug` is the new
    // report while `detail` is still the old one. Running here would POST the *previous* report's
    // sort key and variables to the *new* report's endpoint, which the backend rightly rejects with
    // a 400 ("unknown sort key"). Guarded at this chokepoint rather than at each call site, because
    // sorting, paging and export all land here too.
    if (!slug || !detail || detail.slug !== slug) {
      return;
    }

    const missing = getMissingRequiredVariables(detail.variables, nextValues);
    if (missing.length > 0) {
      setError(t("reports.errors.requiredVariables", {variables: missing.join(", ")}));
      return;
    }
    const invalidRanges = getInvalidDateRanges(detail.variables, nextValues);
    if (invalidRanges.length > 0) {
      setError(t("reports.errors.invalidDateRange", {variables: invalidRanges.join(", ")}));
      return;
    }

    try {
      setIsRunning(true);
      // A new filter/sort invalidates any count already shown — never leave a stale total on screen.
      setTotalCount(null);
      // The notice has done its job: whatever runs from here is what the filter bar shows, so it is
      // no longer true that the screen might mislead. Leaving it up would just be noise.
      setLinkProblems([]);
      const page = await reportService.run(slug, {
        variables: nextValues,
        sortColumnKey: nextSort?.key ?? null,
        sortDirection: nextSort ? toSortDirection(nextSort.direction) : null,
        offset: nextOffset,
        limit: detail.defaultPageSize,
      });
      setResult(page);
      setOffset(page.offset);
      // The server echoes the sort it actually applied (an omitted key falls back to the report's
      // declared default). Trust that over local state, or the header arrow can point at a column
      // the data is not ordered by.
      setSort(page.sortColumnKey
        ? {key: page.sortColumnKey, direction: toTableDirection(page.sortDirection)}
        : null);
    } catch (error) {
      setError(`${t("reports.runFailed")}: ${error}`);
    } finally {
      setIsRunning(false);
    }
  }, [slug, detail, setError, t]);

  useEffect(() => {
    if (!slug) {
      return;
    }
    // Cleared before fetching, not after. This component does NOT remount when :slug changes —
    // /reports/:slug is one Route element with no key, so React reconciles it in place. Without this
    // reset, a drill-down from report A to report B keeps A's `result`, and since `activeColumns`
    // prefers `result?.columns` over the definition's, B's page renders A's rows and columns under
    // B's name. `result` also suppressed B's auto-run entirely.
    setDetail(null);
    setResult(null);
    setValues({});
    setTotalCount(null);
    setOffset(0);
    setLinkProblems([]);

    const load = async () => {
      try {
        setIsLoading(true);
        setDetail(await reportService.get(slug));
      } catch (error) {
        setError(`${t("reports.loadFailed")}: ${error}`);
        navigate("/reports");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [slug]);

  /**
   * The URL's filters layered over the report's declared defaults.
   *
   * Keyed on `searchKey` (a string) rather than `searchParams` (an object), so the memo's deps stay
   * primitive and this cannot silently re-fire on identity churn. `values` is deliberately not an
   * input — that is what makes the `setValues` → render → effect → `setValues` loop below
   * structurally impossible rather than merely guarded.
   */
  const prefill = useMemo(() => {
    if (!detail) {
      return null;
    }
    return variableValuesFromQuery(
      detail.variables,
      new URLSearchParams(searchKey),
      buildInitialVariableValues(detail.variables),
    );
  }, [detail, searchKey]);

  /**
   * Applies the URL's filters and auto-runs — exactly once per (definition, query string).
   *
   * Keyed on the identity of `detail` and the text of the query string, deliberately not on `slug`:
   * a report may link to itself with different filters, where neither `slug` nor `detail` changes
   * and nothing else would re-fire.
   *
   * The ref, not the dep array, is what enforces exactly-once: `useMemo` is a performance hint that
   * React may discard, and StrictMode double-invokes effects on mount. Both hand back a fresh
   * `prefill`; the tuple absorbs it.
   */
  useEffect(() => {
    if (!detail || !prefill) {
      return;
    }
    // The definition still describes the report we just navigated away from. Doing anything now
    // would apply the previous report's variables to this URL's filters; wait for the real one.
    // Deliberately before the ref is stamped, so this tuple is retried once `detail` catches up.
    if (detail.slug !== slug) {
      return;
    }
    if (applied.current?.detail === detail && applied.current.searchKey === searchKey) {
      return;
    }
    applied.current = {detail, searchKey};

    const nextSort = detail.defaultSortColumnKey
      ? {key: detail.defaultSortColumnKey, direction: toTableDirection(detail.defaultSortDirection)}
      : null;

    setValues(prefill.values);
    setSort(nextSort);
    setLinkProblems(prefill.problems);

    // The URL asked for a filter that cannot be honoured. Running now would return a *wider* set
    // than the link promised, under a URL that claims otherwise — the user reads "one item" and is
    // shown every bin in the company. Show nothing and let them press Run themselves.
    if (prefill.problems.length > 0) {
      return;
    }

    // A report whose mandatory filter the URL did not supply waits for the user rather than firing
    // a guaranteed error.
    if (getMissingRequiredVariables(detail.variables, prefill.values).length === 0) {
      // The SAME object handed to the filter bar above — never a locally recomputed default. What
      // ran and what the filter bar shows must be the same thing, or the bar describes a query that
      // never happened.
      execute(0, nextSort, prefill.values);
    }
  }, [detail, prefill, searchKey, slug]);

  /** Runtime metadata from the response wins over the definition's copy; both are the same shape. */
  const activeColumns: ReportColumnDescriptor[] = useMemo(
    () => [...(result?.columns ?? detail?.columns ?? [])].sort((a, b) => a.order - b.order),
    [result, detail],
  );

  const tableColumns: DataTableColumn<ReportRow>[] = useMemo(
    () => activeColumns
      .filter((column) => column.visible)
      .map((column) => ({
        key: column.key,
        header: column.label,
        align: resolveReportColumnAlign(column),
        sortable: column.sortable,
        format: (value: unknown, row: ReportRow) => {
          const text = formatCell(value, column);
          const link = resolveReportLink(column, row);
          // No link resolved — the column doesn't link, or a placeholder is NULL in this row. Plain
          // text, deliberately: a link to /itemCheck/undefined is worse than no link at all.
          if (!link) {
            return text;
          }
          return (
            <ReportCellLink link={link} onNavigate={navigate}>
              {text}
            </ReportCellLink>
          );
        },
      })),
    [activeColumns, formatCell, navigate],
  );

  const handleSortChange = (next: DataTableSort) => {
    // Deliberately does NOT `setSort(next)` up front. The arrow must only ever move once the server
    // confirms the ordering it actually applied (`execute` sets `sort` from that echo). Applying it
    // optimistically would leave "Qty ▲" painted over DocEntry-ordered rows whenever the run fails
    // or is refused — the header lying about its own data is how someone ships the wrong pallet.
    //
    // A new sort re-pages from the top: keeping the offset would land the user mid-way through a
    // dataset they have not seen the start of.
    execute(0, next, values);
  };

  const handleShowCount = async () => {
    if (!slug || !detail) {
      return;
    }
    try {
      setIsCounting(true);
      const count = await reportService.count(slug, {
        variables: values,
        sortColumnKey: sort?.key ?? null,
        sortDirection: sort ? toSortDirection(sort.direction) : null,
        offset: 0,
        limit: detail.defaultPageSize,
      });
      setTotalCount(count);
    } catch (error) {
      setError(`${t("reports.countFailed")}: ${error}`);
    } finally {
      setIsCounting(false);
    }
  };

  /**
   * `exportToExcel`'s `getData` is **synchronous**, so every row must be in hand before it is
   * called. Rows are pulled page by page (one short rollback scope each) rather than as one giant
   * query — a 10-minute streaming transaction against SAP is exactly what the chunking avoids.
   */
  const handleExport = async () => {
    if (!slug || !detail || exportInFlight.current) {
      return;
    }
    exportInFlight.current = true;
    try {
      // Deliberately not `setIsRunning`: that drives the table's skeleton, and replacing rows the
      // user is looking at with placeholders for the length of a 50k-row export reads as data loss.
      setIsExporting(true);
      const rows: ReportRow[] = [];
      let exportOffset = 0;

      while (rows.length < EXPORT_ROW_LIMIT) {
        const page = await reportService.run(slug, {
          variables: values,
          sortColumnKey: sort?.key ?? null,
          sortDirection: sort ? toSortDirection(sort.direction) : null,
          offset: exportOffset,
          limit: EXPORT_CHUNK_SIZE,
        });
        rows.push(...page.rows);
        // Advance by what actually came back, not by the requested limit — the server clamps, and
        // trusting the request would skip rows. An empty page also breaks the loop: `hasMore` with
        // zero rows would otherwise spin forever.
        if (!page.hasMore || page.rows.length === 0) {
          break;
        }
        exportOffset += page.rows.length;
      }

      const exported = rows.slice(0, EXPORT_ROW_LIMIT);
      const columns = activeColumns.filter((column) => column.visible);

      await exportToExcel({
        name: toWorksheetName(detail.name),
        fileName: detail.slug,
        headers: columns.map((column) => column.label),
        getData: () => exported.map((row) => columns.map((column) => {
          const value = row[column.key];
          if (value === null || value === undefined) {
            // A spreadsheet's blank, not the table's em dash — never 0, which would be a lie.
            return "";
          }
          if (isNumericFormat(column.format)) {
            // Hand Excel a real number so the column stays summable; fall through to text only
            // when the value is not honestly numeric.
            if (typeof value === "number" && Number.isFinite(value)) {
              return value;
            }
            if (typeof value === "string" && value.trim().length > 0) {
              const parsed = Number(value);
              if (Number.isFinite(parsed)) {
                return parsed;
              }
            }
          }
          const formatted = formatCell(value, column);
          return formatted === EMPTY_CELL ? "" : formatted;
        })),
      });

      if (rows.length >= EXPORT_ROW_LIMIT) {
        setError(t("reports.exportTruncated", {limit: EXPORT_ROW_LIMIT}));
      }
    } catch (error) {
      setError(`${t("reports.exportFailed")}: ${error}`);
    } finally {
      exportInFlight.current = false;
      setIsExporting(false);
    }
  };

  const rangeLabel = result && result.rows.length > 0
    ? t("reports.rowRange", {from: offset + 1, to: offset + result.rows.length})
    : undefined;

  if (isLoading) {
    return (
      <ContentTheme title={t("reports.title")} titleBreadcrumbs={[{label: t("loading")}]}>
        <div className="space-y-4 p-4" aria-label={t("loading")}>
          <Skeleton className="h-24 w-full"/>
          <Skeleton className="h-64 w-full"/>
        </div>
      </ContentTheme>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <ContentTheme
      title={t("reports.title")}
      titleOnClick={() => navigate("/reports")}
      titleBreadcrumbs={[{label: detail.name}]}
      onExportExcel={result && result.rows.length > 0 ? handleExport : undefined}
    >
      <div className="space-y-4 p-2 md:p-4">
        {detail.description && <p className="text-sm text-muted-foreground">{detail.description}</p>}

        <Card>
          <CardContent className="p-4">
            {/*
              A persistent notice, not a toast: this says the screen is not showing what the URL
              asked for, which stays true until the user acts. A sonner toast auto-dismisses and
              would leave a silently-unfiltered report behind it.
            */}
            {linkProblems.length > 0 && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"
              >
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0"/>
                <div className="min-w-0">
                  <p className="font-medium">{t("reports.linkProblems.title")}</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    {linkProblems.map((problem) => (
                      <li key={`${problem.kind}-${problem.param}`} className="break-words">
                        {t(`reports.linkProblems.${problem.kind}`, {
                          param: problem.param,
                          value: problem.value ?? "",
                        })}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1 text-xs">{t("reports.linkProblems.hint")}</p>
                </div>
              </div>
            )}

            <ReportFilterBar
              slug={detail.slug}
              variables={detail.variables}
              values={values}
              // Reset restores how this page opened, not the report's declared defaults — otherwise
              // Reset-then-Run on a drill-down would silently show something a refresh would not.
              resetValues={prefill?.values}
              // An export re-runs the query page by page with the *current* filters; letting them
              // change mid-export would splice two different result sets into one spreadsheet.
              isRunning={isRunning || isExporting}
              onChange={setValues}
              onRun={() => execute(0, sort, values)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-2 md:p-4">
            <DataTable<ReportRow>
              columns={tableColumns}
              rows={result?.rows ?? []}
              isLoading={isRunning}
              sort={sort}
              onSortChange={handleSortChange}
              hasMore={result?.hasMore ?? false}
              hasPrevious={offset > 0}
              onNext={() => execute(offset + pageSize, sort, values)}
              // Clamped at 0: a short final page must not walk the offset negative.
              onPrevious={() => execute(Math.max(0, offset - pageSize), sort, values)}
              labels={{
                empty: result ? t("reports.noRows") : t("reports.notRunYet"),
                next: t("reports.next"),
                previous: t("reports.previous"),
                range: rangeLabel,
              }}
            />

            {result && (
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t pt-3 text-xs text-muted-foreground">
                <span>{t("reports.durationMs", {duration: result.durationMs})}</span>
                {isExporting && <span>{t("reports.exporting")}</span>}
                {detail.totalCountMode === ReportTotalCountMode.Exact && (
                  totalCount === null ? (
                    <Button type="button" variant="ghost" size="sm" onClick={handleShowCount} disabled={isCounting}>
                      <Sigma className="mr-1 h-3.5 w-3.5"/>
                      {isCounting ? t("reports.counting") : t("reports.showTotal")}
                    </Button>
                  ) : (
                    <span>{t("reports.totalRows", {total: totalCount})}</span>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ContentTheme>
  );
};

export default ReportRunner;
