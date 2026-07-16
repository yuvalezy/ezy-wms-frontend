import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router";
import {Sigma} from "lucide-react";
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
import {
  buildInitialVariableValues,
  getInvalidDateRanges,
  getMissingRequiredVariables,
  ReportFilterBar,
  ReportVariableValues,
} from "@/features/reports/components/ReportFilterBar";

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
  /**
   * Re-entrancy guard, separate from the state above: `setIsExporting(true)` does not take effect
   * until the next render, so a fast double-click would otherwise start two 50k-row exports.
   */
  const exportInFlight = useRef(false);

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
    if (!slug || !detail) {
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
    const load = async () => {
      if (!slug) {
        return;
      }
      try {
        setIsLoading(true);
        const data = await reportService.get(slug);
        setDetail(data);
        setValues(buildInitialVariableValues(data.variables));
        setSort(data.defaultSortColumnKey
          ? {key: data.defaultSortColumnKey, direction: toTableDirection(data.defaultSortDirection)}
          : null);
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
   * Auto-runs once the definition lands, but only when nothing required is missing — a report whose
   * mandatory date range is still empty must wait for the user rather than fire a guaranteed error.
   */
  useEffect(() => {
    if (!detail || result) {
      return;
    }
    const initial = buildInitialVariableValues(detail.variables);
    if (getMissingRequiredVariables(detail.variables, initial).length === 0) {
      execute(0, detail.defaultSortColumnKey
        ? {key: detail.defaultSortColumnKey, direction: toTableDirection(detail.defaultSortDirection)}
        : null, initial);
    }
  }, [detail]);

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
        format: (value: unknown) => formatCell(value, column),
      })),
    [activeColumns, formatCell],
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
            <ReportFilterBar
              slug={detail.slug}
              variables={detail.variables}
              values={values}
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
