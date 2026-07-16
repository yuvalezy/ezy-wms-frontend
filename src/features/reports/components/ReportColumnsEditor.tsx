import React from "react";
import {useTranslation} from "react-i18next";
import {ArrowDown, ArrowUp} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {
  ReportColumnAlign,
  ReportColumnDescriptor,
  ReportColumnFormat,
  ReportColumnRequest,
} from "@/features/reports/data/types";

/**
 * Per-column presentation settings for a report definition.
 *
 * **Column keys are not editable and cannot be hand-added.** A key must be byte-identical to the
 * SQL statement's output column name — it is what the row `Dictionary` is keyed by and what gets
 * bracket-quoted into `ORDER BY`. The only trustworthy source for that is SQL Server's own
 * `GetColumnSchema()`, delivered by the Test button, so keys arrive from discovery and this editor
 * only decorates them (label, format, alignment, visibility, sortability, order).
 */

export interface ReportColumnsEditorProps {
  columns: ReportColumnRequest[];
  onChange: (columns: ReportColumnRequest[]) => void;
  /**
   * Keys the last discovery reported as unsortable (`text`, `ntext`, `image`, `xml`, `geography`,
   * `geometry` — SQL Server errors on `ORDER BY` over these). Their Sortable switch is locked off:
   * flipping it on would save cleanly and then fail at runtime on the user's first header click.
   */
  unsortableKeys?: ReadonlySet<string>;
  disabled?: boolean;
}

const ALIGN_AUTO = "auto";

/** A discovered column → an editable column, defaults intact. */
export const columnFromDescriptor = (descriptor: ReportColumnDescriptor, order: number): ReportColumnRequest => ({
  key: descriptor.key,
  label: descriptor.label,
  format: descriptor.format,
  align: descriptor.align ?? null,
  decimals: descriptor.decimals,
  visible: descriptor.visible,
  sortable: descriptor.sortable,
  nullable: descriptor.nullable,
  order,
});

/**
 * Folds a fresh discovery into the columns already on the form.
 *
 * Existing columns keep their authored label/format/alignment **and their position** — re-testing
 * after a small SQL tweak must not silently discard the ordering someone just arranged. Columns the
 * SQL no longer returns are dropped (a stale key would break `ORDER BY` and the row lookup); new
 * ones are appended. `sortable` is `AND`-ed rather than overwritten, so discovery can always veto
 * (`text`/`image`/… can never be ordered by) while an author's deliberate "off" still sticks.
 */
export const mergeDiscoveredColumns = (
  existing: ReportColumnRequest[],
  discovered: ReportColumnDescriptor[],
): ReportColumnRequest[] => {
  const discoveredByKey = new Map(discovered.map((column) => [column.key, column]));
  const existingKeys = new Set(existing.map((column) => column.key));

  const kept = existing
    .filter((column) => discoveredByKey.has(column.key))
    .map((column) => {
      const fresh = discoveredByKey.get(column.key)!;
      return {...column, sortable: column.sortable && fresh.sortable, nullable: fresh.nullable};
    });

  const added = discovered
    .filter((column) => !existingKeys.has(column.key))
    .map((column) => columnFromDescriptor(column, 0));

  return [...kept, ...added].map((column, index) => ({...column, order: index}));
};

const FORMAT_ORDER: ReportColumnFormat[] = [
  ReportColumnFormat.Text,
  ReportColumnFormat.Number,
  ReportColumnFormat.Currency,
  ReportColumnFormat.Percent,
  ReportColumnFormat.Date,
  ReportColumnFormat.DateTime,
  ReportColumnFormat.Time,
  ReportColumnFormat.Boolean,
  ReportColumnFormat.Binary,
];

const ALIGN_OPTIONS: ReportColumnAlign[] = ["left", "center", "right"];

/** Decimals only mean anything for the numeric formats. */
const usesDecimals = (format: ReportColumnFormat): boolean =>
  format === ReportColumnFormat.Number
  || format === ReportColumnFormat.Currency
  || format === ReportColumnFormat.Percent;

export function ReportColumnsEditor({
  columns,
  onChange,
  unsortableKeys,
  disabled = false,
}: ReportColumnsEditorProps) {
  const {t} = useTranslation();

  const patch = (index: number, changes: Partial<ReportColumnRequest>) => {
    onChange(columns.map((column, i) => (i === index ? {...column, ...changes} : column)));
  };

  /**
   * Moves a column and rewrites every `order` from the resulting array position. Order is
   * renumbered densely rather than swapping two values, so a definition saved from a list that was
   * edited across several sessions can never end up with duplicate or gapped orders.
   */
  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= columns.length) {
      return;
    }
    const next = [...columns];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next.map((column, i) => ({...column, order: i})));
  };

  if (columns.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm font-medium">{t("reports.noColumns")}</p>
        <p className="mt-1 text-xs text-muted-foreground">{t("reports.noColumnsHint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {columns.map((column, index) => {
        const lockedUnsortable = unsortableKeys?.has(column.key) ?? false;
        return (
          <div key={column.key} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 basis-48">
                <Label className="text-xs text-muted-foreground">{t("reports.columnKey")}</Label>
                {/* Read-only: it must stay identical to the SQL output column name. */}
                <p className="truncate font-mono text-sm font-medium" title={column.key}>{column.key}</p>
              </div>

              <div className="min-w-0 flex-1 basis-48">
                <Label className="text-xs text-muted-foreground" htmlFor={`column-label-${column.key}`}>
                  {t("reports.columnLabel")}
                </Label>
                <Input
                  id={`column-label-${column.key}`}
                  value={column.label}
                  disabled={disabled}
                  onChange={(e) => patch(index, {label: e.target.value})}
                />
              </div>

              <div className="basis-40">
                <Label className="text-xs text-muted-foreground">{t("reports.columnFormat")}</Label>
                <Select
                  value={column.format}
                  disabled={disabled}
                  onValueChange={(value) => patch(index, {format: value as ReportColumnFormat})}
                >
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    {FORMAT_ORDER.map((format) => (
                      <SelectItem key={format} value={format}>{t(`reports.formats.${format}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="basis-36">
                <Label className="text-xs text-muted-foreground">{t("reports.columnAlign")}</Label>
                <Select
                  // `align: null` means "let the client derive it from the format" — represented by a
                  // non-empty sentinel because a SelectItem may never carry an empty value.
                  value={column.align ?? ALIGN_AUTO}
                  disabled={disabled}
                  onValueChange={(value) =>
                    patch(index, {align: value === ALIGN_AUTO ? null : (value as ReportColumnAlign)})}
                >
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALIGN_AUTO}>{t("reports.alignAuto")}</SelectItem>
                    {ALIGN_OPTIONS.map((align) => (
                      <SelectItem key={align} value={align}>{t(`reports.aligns.${align}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {usesDecimals(column.format) && (
                <div className="basis-24">
                  <Label className="text-xs text-muted-foreground" htmlFor={`column-decimals-${column.key}`}>
                    {t("reports.columnDecimals")}
                  </Label>
                  <Input
                    id={`column-decimals-${column.key}`}
                    type="number"
                    min={0}
                    max={10}
                    value={column.decimals}
                    disabled={disabled}
                    onChange={(e) => {
                      // Server-side [Range(0,10)]. An empty/garbage box must not send NaN, which
                      // serializes to null and trips model validation with an unhelpful message.
                      const parsed = Number.parseInt(e.target.value, 10);
                      patch(index, {decimals: Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : 0});
                    }}
                  />
                </div>
              )}

              <div className="flex items-center gap-2 pb-2">
                <Switch
                  id={`column-visible-${column.key}`}
                  checked={column.visible}
                  disabled={disabled}
                  onCheckedChange={(checked) => patch(index, {visible: checked})}
                />
                <Label htmlFor={`column-visible-${column.key}`} className="text-xs">{t("reports.columnVisible")}</Label>
              </div>

              <div className="flex items-center gap-2 pb-2" title={lockedUnsortable ? t("reports.columnNotSortable") : undefined}>
                <Switch
                  id={`column-sortable-${column.key}`}
                  checked={column.sortable && !lockedUnsortable}
                  disabled={disabled || lockedUnsortable}
                  onCheckedChange={(checked) => patch(index, {sortable: checked})}
                />
                <Label htmlFor={`column-sortable-${column.key}`} className="text-xs">{t("reports.columnSortable")}</Label>
              </div>

              <div className="flex gap-1 pb-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("reports.moveUp")}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="h-4 w-4"/>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={t("reports.moveDown")}
                  disabled={disabled || index === columns.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ReportColumnsEditor;
