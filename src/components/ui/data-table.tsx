import * as React from "react";
import {ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {cn} from "@/utils/css-utils";

/**
 * A generic, **controlled** data table.
 *
 * Unlike every other table in this repo, report columns are SQL-driven and only known at runtime,
 * so they cannot be hardcoded in JSX. This component encapsulates the four states each list page
 * currently copy-pastes inline — loading skeleton, empty, data, and the mobile-card /
 * desktop-table split — plus sortable headers and `hasMore`-driven paging.
 *
 * It is deliberately **presentational**: the parent owns sort and page state, fetches, and passes
 * values back down. It is also deliberately free of any report-specific types — cell rendering is
 * injected per column via `format`, so `components/ui` never depends on `features/`.
 */

export type DataTableAlign = "left" | "center" | "right";

/** Local vocabulary — callers using the reports API map to/from `ReportSortDirection` ("Asc"/"Desc"). */
export type DataTableSortDirection = "asc" | "desc";

export interface DataTableSort {
  key: string;
  direction: DataTableSortDirection;
}

export interface DataTableColumn<TRow> {
  /** Property read off the row, and the identity used for sorting. */
  key: string;
  header: React.ReactNode;
  /** Applied to both the desktop cell and its header. Defaults to `"left"`. */
  align?: DataTableAlign;
  /** Only a sortable column's header is clickable. Defaults to `false`. */
  sortable?: boolean;
  /** Renders the cell. Omitted → the raw value is stringified. */
  format?: (value: unknown, row: TRow) => React.ReactNode;
  /** Skips the column entirely (desktop and mobile). */
  hidden?: boolean;
  headerClassName?: string;
  cellClassName?: string;
  /** Width hint for the loading skeleton in this column, e.g. `"w-24"`. */
  skeletonClassName?: string;
}

export interface DataTableLabels {
  /** Shown when there are no rows and nothing is loading. */
  empty?: React.ReactNode;
  next?: string;
  previous?: string;
  /** Free-form paging context, e.g. `"1–50"`. Rendered between the buttons. */
  range?: React.ReactNode;
}

export interface DataTableProps<TRow extends Record<string, unknown> = Record<string, unknown>> {
  columns: DataTableColumn<TRow>[];
  rows: TRow[];
  /** Stable React key per row. Defaults to the row index — fine for a paged, read-only table. */
  getRowKey?: (row: TRow, index: number) => React.Key;

  /** Replaces the body with skeleton rows. */
  isLoading?: boolean;
  /** Skeleton row count while loading. Defaults to 5. */
  skeletonRows?: number;

  /** Current sort, or `null` when unsorted. Controlled — the parent re-fetches and passes the new value back. */
  sort?: DataTableSort | null;
  /** Fires with the next sort: same key toggles direction, a new key starts at `"asc"`. */
  onSortChange?: (sort: DataTableSort) => void;

  /**
   * Whether a next page exists. This is a **flag, not a total count** — the backend fetches
   * `limit + 1` rows and trims, so no `COUNT(*)` is paid to render Next/Prev.
   */
  hasMore?: boolean;
  /** Whether a previous page exists (typically `offset > 0`). */
  hasPrevious?: boolean;
  onNext?: () => void;
  onPrevious?: () => void;

  labels?: DataTableLabels;
  className?: string;
  /** Overrides the default label/value mobile card. */
  renderMobileCard?: (row: TRow, index: number) => React.ReactNode;
  /** Trailing actions cell, rendered on both layouts. */
  renderRowActions?: (row: TRow, index: number) => React.ReactNode;
  onRowClick?: (row: TRow, index: number) => void;
}

const alignClass = (align?: DataTableAlign): string => {
  switch (align) {
    case "right":
      return "text-right";
    case "center":
      return "text-center";
    default:
      return "text-left";
  }
};

const justifyClass = (align?: DataTableAlign): string => {
  switch (align) {
    case "right":
      return "justify-end";
    case "center":
      return "justify-center";
    default:
      return "justify-start";
  }
};

/**
 * Last-resort rendering when a column declares no `format`. Objects are rendered as empty rather
 * than handed to React, which would throw "Objects are not valid as a React child" mid-render.
 */
const defaultRender = (value: unknown): React.ReactNode => {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "object") {
    return React.isValidElement(value) ? value : "";
  }
  return String(value);
};

const nextSortFor = (column: string, current?: DataTableSort | null): DataTableSort => {
  if (current && current.key === column) {
    return {key: column, direction: current.direction === "asc" ? "desc" : "asc"};
  }
  return {key: column, direction: "asc"};
};

function SortIndicator({state}: { state: DataTableSortDirection | null }) {
  if (state === "asc") {
    return <ArrowUp className="h-3.5 w-3.5 shrink-0"/>;
  }
  if (state === "desc") {
    return <ArrowDown className="h-3.5 w-3.5 shrink-0"/>;
  }
  // Held in the layout (dimmed) so a column doesn't jump sideways when it becomes sorted.
  return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-30"/>;
}

export function DataTable<TRow extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  rows,
  getRowKey,
  isLoading = false,
  skeletonRows = 5,
  sort,
  onSortChange,
  hasMore = false,
  hasPrevious = false,
  onNext,
  onPrevious,
  labels,
  className,
  renderMobileCard,
  renderRowActions,
  onRowClick,
}: DataTableProps<TRow>) {
  const visibleColumns = React.useMemo(() => columns.filter((column) => !column.hidden), [columns]);
  const sortableColumns = React.useMemo(
    () => visibleColumns.filter((column) => column.sortable),
    [visibleColumns],
  );

  const columnCount = visibleColumns.length + (renderRowActions ? 1 : 0);
  const skeletonKeys = React.useMemo(
    () => Array.from({length: Math.max(1, skeletonRows)}, (_, index) => index),
    [skeletonRows],
  );

  const emptyLabel = labels?.empty ?? "No data found";
  const nextLabel = labels?.next ?? "Next";
  const previousLabel = labels?.previous ?? "Previous";

  const rowKey = React.useCallback(
    (row: TRow, index: number): React.Key => (getRowKey ? getRowKey(row, index) : index),
    [getRowKey],
  );

  const sortStateOf = React.useCallback(
    (key: string): DataTableSortDirection | null => (sort && sort.key === key ? sort.direction : null),
    [sort],
  );

  const handleSort = React.useCallback(
    (column: DataTableColumn<TRow>) => {
      if (!column.sortable || !onSortChange) {
        return;
      }
      onSortChange(nextSortFor(column.key, sort));
    },
    [onSortChange, sort],
  );

  const showPaging = Boolean(onNext || onPrevious);
  const isEmpty = !isLoading && rows.length === 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Mobile view - Card layout */}
      <div className="block sm:hidden">
        {sortableColumns.length > 0 && onSortChange && !isEmpty && (
          <div className="flex gap-2 overflow-x-auto pb-2" aria-label="Sort">
            {sortableColumns.map((column) => {
              const state = sortStateOf(column.key);
              return (
                <Button
                  key={column.key}
                  type="button"
                  variant={state ? "default" : "outline"}
                  size="sm"
                  className="shrink-0"
                  disabled={isLoading}
                  onClick={() => handleSort(column)}
                >
                  <span className="truncate max-w-32">{column.header}</span>
                  <SortIndicator state={state}/>
                </Button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {isLoading ? (
            skeletonKeys.map((key) => (
              <div key={`skeleton-card-${key}`} className="rounded-lg border p-4" aria-label="Loading...">
                <div className="flex flex-col gap-2">
                  {visibleColumns.map((column) => (
                    <div key={column.key} className="flex items-center justify-between gap-4">
                      <Skeleton className="h-4 w-24"/>
                      <Skeleton className={cn("h-4 w-20", column.skeletonClassName)}/>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : isEmpty ? (
            <div className="rounded-lg border p-8 text-center text-muted-foreground">{emptyLabel}</div>
          ) : (
            rows.map((row, index) => {
              const key = rowKey(row, index);
              if (renderMobileCard) {
                return <React.Fragment key={key}>{renderMobileCard(row, index)}</React.Fragment>;
              }
              return (
                <div
                  key={key}
                  className={cn("rounded-lg border p-4", onRowClick && "cursor-pointer hover:bg-muted/50")}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  <div className="flex flex-col gap-2">
                    {visibleColumns.map((column) => (
                      <div key={column.key} className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-muted-foreground shrink-0">{column.header}</span>
                        <span className={cn("font-medium break-words text-right", column.cellClassName)}>
                          {column.format
                            ? column.format(row[column.key], row)
                            : defaultRender(row[column.key])}
                        </span>
                      </div>
                    ))}
                  </div>
                  {renderRowActions && (
                    <div className="flex justify-end gap-2 pt-3 mt-3 border-t">
                      {renderRowActions(row, index)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Desktop view - Table layout */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => {
                const state = sortStateOf(column.key);
                const canSort = Boolean(column.sortable && onSortChange);
                return (
                  <TableHead
                    key={column.key}
                    className={cn(alignClass(column.align), column.headerClassName)}
                    aria-sort={state === "asc" ? "ascending" : state === "desc" ? "descending" : undefined}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleSort(column)}
                        className={cn(
                          "inline-flex items-center gap-1.5 font-medium hover:text-foreground/80 transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                          justifyClass(column.align),
                        )}
                      >
                        <span>{column.header}</span>
                        <SortIndicator state={state}/>
                      </button>
                    ) : (
                      column.header
                    )}
                  </TableHead>
                );
              })}
              {renderRowActions && <TableHead className="text-right">{""}</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonKeys.map((key) => (
                <TableRow key={`skeleton-${key}`}>
                  {visibleColumns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton className={cn("h-4 w-24", column.skeletonClassName)}/>
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-20"/>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center py-8 text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow
                  key={rowKey(row, index)}
                  className={cn(onRowClick && "cursor-pointer")}
                  onClick={onRowClick ? () => onRowClick(row, index) : undefined}
                >
                  {visibleColumns.map((column) => (
                    <TableCell key={column.key} className={cn(alignClass(column.align), column.cellClassName)}>
                      {column.format ? column.format(row[column.key], row) : defaultRender(row[column.key])}
                    </TableCell>
                  ))}
                  {renderRowActions && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">{renderRowActions(row, index)}</div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPaging && (
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={isLoading || !hasPrevious || !onPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1"/>
            {previousLabel}
          </Button>
          {labels?.range && <span className="text-sm text-muted-foreground">{labels.range}</span>}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNext}
            disabled={isLoading || !hasMore || !onNext}
          >
            {nextLabel}
            <ChevronRight className="h-4 w-4 ml-1"/>
          </Button>
        </div>
      )}
    </div>
  );
}
