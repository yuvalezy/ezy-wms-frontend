import React, {useEffect, useMemo, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {ChevronsUpDown, Eraser, Play} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Checkbox} from "@/components/ui/checkbox";
import {Combobox, ComboboxItem} from "@/components/ui/combobox";
import {DatePicker} from "@/components/ui/date-picker";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/utils/css-utils";
import {reportService} from "@/features/reports/data/report-service";
import {
  ReportLookupOption,
  ReportVariableDescriptor,
  ReportVariableType,
  ReportVariableValue,
} from "@/features/reports/data/types";

/**
 * The filter row for a report run.
 *
 * **Every value stays a string, all the way to the wire.** The backend parses strictly and rejects
 * rather than coercing, and binds each value as a typed `SqlParameter` — so pre-converting here
 * (e.g. sending a JS number, or a `Date`) would only make the client's guess authoritative and
 * defeat that. The one job this component has is producing *honest* strings.
 *
 * Dates are the sharp edge: a `Date` picked from the calendar is local midnight, and
 * `toISOString().slice(0, 10)` on it yields the **previous day** for every viewer east of UTC
 * (local midnight Jul 16 at UTC+2 is Jul 15 22:00Z). A filter that silently shifts a day is how a
 * report shows the wrong week's invoices, so dates are serialized from their local calendar
 * components and parsed back the same way.
 */

export type ReportVariableValues = Record<string, ReportVariableValue>;

const ANY_VALUE = "__any";

const pad = (value: number): string => String(value).padStart(2, "0");

/** `Date` → `yyyy-MM-dd` using the **local** calendar fields. Never `toISOString()`. See module docs. */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * `yyyy-MM-dd` → a local-midnight `Date`. Deliberately not `new Date("2026-07-16")`, which the spec
 * says to read as **UTC** midnight — that renders as the 15th in any negative offset.
 */
export const fromIsoDate = (value: string | null | undefined): Date | undefined => {
  if (!value) {
    return undefined;
  }
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return undefined;
  }
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

/** `<input type="datetime-local">` omits seconds; the backend parses ISO exactly, so normalize. */
const normalizeDateTime = (value: string): string =>
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? `${value}:00` : value;

/**
 * Seeds the filter values from each variable's declared default.
 * A multi-select default is read as CSV, matching how the backend binds it (one CSV parameter).
 */
export function buildInitialVariableValues(variables: ReportVariableDescriptor[]): ReportVariableValues {
  const values: ReportVariableValues = {};
  for (const variable of variables) {
    const defaultValue = variable.defaultValue ?? null;
    if (variable.type === ReportVariableType.DateRange) {
      values[variable.name] = {from: null, to: null};
    } else if (variable.allowMultiple) {
      values[variable.name] = {
        values: defaultValue ? defaultValue.split(",").map((part) => part.trim()).filter(Boolean) : [],
      };
    } else {
      values[variable.name] = {value: defaultValue};
    }
  }
  return values;
}

const isBlank = (value: ReportVariableValue | undefined, type: ReportVariableType): boolean => {
  if (!value) {
    return true;
  }
  if (type === ReportVariableType.DateRange) {
    return !value.from?.trim() || !value.to?.trim();
  }
  if (value.values !== undefined && value.values !== null) {
    return value.values.length === 0;
  }
  return !value.value?.trim();
};

/** Labels of the required variables the user has not filled in. Empty → the run may proceed. */
export function getMissingRequiredVariables(
  variables: ReportVariableDescriptor[],
  values: ReportVariableValues,
): string[] {
  return variables
    .filter((variable) => variable.required && isBlank(values[variable.name], variable.type))
    .map((variable) => variable.label);
}

/** Labels of `DateRange` variables whose From is after their To — the backend rejects these. */
export function getInvalidDateRanges(
  variables: ReportVariableDescriptor[],
  values: ReportVariableValues,
): string[] {
  return variables
    .filter((variable) => {
      if (variable.type !== ReportVariableType.DateRange) {
        return false;
      }
      const value = values[variable.name];
      return !!value?.from && !!value?.to && value.from > value.to;
    })
    .map((variable) => variable.label);
}

/**
 * Options for every `SqlLookup` variable, refetched (debounced) whenever any filter value changes.
 *
 * The refetch is not laziness — the backend binds **all** declared variables to each lookup query,
 * which is exactly what makes cascading lookups (warehouse → bin) work: the bin lookup's result
 * genuinely depends on the warehouse currently selected.
 */
function useReportLookups(slug: string, variables: ReportVariableDescriptor[], values: ReportVariableValues) {
  const [options, setOptions] = useState<Record<string, ReportLookupOption[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  // Guards against a slow early response overwriting a newer one (last-write-wins on a stale reply).
  const requestId = useRef(0);

  const lookupNames = useMemo(
    () => variables.filter((variable) => variable.hasLookup).map((variable) => variable.name),
    [variables],
  );

  const valuesKey = JSON.stringify(values);

  useEffect(() => {
    if (lookupNames.length === 0) {
      return;
    }
    const current = ++requestId.current;
    const timer = setTimeout(async () => {
      setLoading(Object.fromEntries(lookupNames.map((name) => [name, true])));
      const results = await Promise.all(
        lookupNames.map(async (name) => {
          try {
            const list = await reportService.lookup(slug, name, {variables: values, offset: 0});
            return [name, list] as const;
          } catch {
            // A lookup that fails must not blank the whole filter bar — the variable just shows no
            // options and the user can still run the report without it.
            return [name, [] as ReportLookupOption[]] as const;
          }
        }),
      );
      if (current !== requestId.current) {
        return;
      }
      setOptions(Object.fromEntries(results));
      setLoading({});
    }, 350);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lookupNames.join(","), valuesKey]);

  return {options, loading};
}

interface MultiSelectFilterProps {
  options: ReportLookupOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}

function MultiSelectFilter({options, selected, onChange, placeholder, disabled}: MultiSelectFilterProps) {
  const {t} = useTranslation();
  const selectedSet = new Set(selected);

  const label = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? options.find((option) => option.value === selected[0])?.label ?? selected[0]
      : t("reports.selectedCount", {selected: selected.length});

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-between font-normal", selected.length === 0 && "text-muted-foreground")}
        >
          <span className="truncate">{label}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50"/>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <ScrollArea className="max-h-64">
          <div className="space-y-1 p-2">
            {options.length === 0 ? (
              <p className="p-2 text-sm text-muted-foreground">{t("reports.noOptions")}</p>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={selectedSet.has(option.value)}
                    onCheckedChange={(checked) =>
                      onChange(checked
                        ? [...selected, option.value]
                        : selected.filter((value) => value !== option.value))}
                  />
                  <span className="truncate">{option.label}</span>
                </label>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export interface ReportFilterBarProps {
  slug: string;
  variables: ReportVariableDescriptor[];
  values: ReportVariableValues;
  onChange: (values: ReportVariableValues) => void;
  onRun: () => void;
  isRunning?: boolean;
}

export function ReportFilterBar({slug, variables, values, onChange, onRun, isRunning = false}: ReportFilterBarProps) {
  const {t} = useTranslation();
  const {options: lookupOptions, loading: lookupLoading} = useReportLookups(slug, variables, values);

  const setValue = (name: string, value: ReportVariableValue) => onChange({...values, [name]: value});

  const ordered = useMemo(() => [...variables].sort((a, b) => a.order - b.order), [variables]);

  const reset = () => onChange(buildInitialVariableValues(variables));

  const renderInput = (variable: ReportVariableDescriptor): React.ReactNode => {
    const value = values[variable.name] ?? {};
    const id = `filter-${variable.name}`;

    if (variable.type === ReportVariableType.SelectList || variable.type === ReportVariableType.SqlLookup) {
      const options = variable.type === ReportVariableType.SqlLookup
        ? lookupOptions[variable.name] ?? []
        : variable.options;
      const isLoading = variable.type === ReportVariableType.SqlLookup && !!lookupLoading[variable.name];

      if (variable.allowMultiple) {
        return (
          <MultiSelectFilter
            options={options}
            selected={value.values ?? []}
            disabled={isRunning}
            placeholder={isLoading ? t("reports.loadingOptions") : t("reports.selectPlaceholder")}
            onChange={(next) => setValue(variable.name, {values: next})}
          />
        );
      }
      return (
        <Combobox
          items={options as ComboboxItem[]}
          value={value.value ?? ""}
          disabled={isRunning}
          allowClear={!variable.required}
          clearLabel={t("reports.anyValue")}
          placeholder={isLoading ? t("reports.loadingOptions") : t("reports.selectPlaceholder")}
          searchPlaceholder={t("reports.searchPlaceholder")}
          emptyText={t("reports.noOptions")}
          // The Combobox emits "" when cleared; store null so nothing binds a real empty string.
          onChange={(next) => setValue(variable.name, {value: next.length > 0 ? next : null})}
        />
      );
    }

    switch (variable.type) {
      case ReportVariableType.Date:
        return (
          <DatePicker
            date={fromIsoDate(value.value)}
            placeholder={t("reports.selectDate")}
            onSelect={(date) => setValue(variable.name, {value: date ? toIsoDate(date) : null})}
          />
        );

      case ReportVariableType.DateRange:
        return (
          <div className="flex items-center gap-2">
            <DatePicker
              date={fromIsoDate(value.from)}
              placeholder={t("from")}
              onSelect={(date) => setValue(variable.name, {...value, from: date ? toIsoDate(date) : null})}
            />
            <span className="text-xs text-muted-foreground">–</span>
            <DatePicker
              date={fromIsoDate(value.to)}
              placeholder={t("to")}
              onSelect={(date) => setValue(variable.name, {...value, to: date ? toIsoDate(date) : null})}
            />
          </div>
        );

      case ReportVariableType.DateTime:
        return (
          <Input
            id={id}
            type="datetime-local"
            value={value.value ?? ""}
            disabled={isRunning}
            onChange={(e) => setValue(
              variable.name,
              {value: e.target.value ? normalizeDateTime(e.target.value) : null},
            )}
          />
        );

      case ReportVariableType.Integer:
      case ReportVariableType.Decimal:
        return (
          <Input
            id={id}
            type="number"
            inputMode={variable.type === ReportVariableType.Integer ? "numeric" : "decimal"}
            step={variable.type === ReportVariableType.Integer ? 1 : "any"}
            value={value.value ?? ""}
            disabled={isRunning}
            // Kept as the raw string: the backend parses strictly, and Number() here would turn a
            // half-typed "1e" into NaN and then into a lie.
            onChange={(e) => setValue(variable.name, {value: e.target.value.length > 0 ? e.target.value : null})}
          />
        );

      case ReportVariableType.Boolean:
      case ReportVariableType.YesNo: {
        // Both types go over the wire as the canonical JSON literals "true"/"false" — the strict
        // parse the backend performs for either. `YesNo` is 'Y'/'N' only at the *SQL* boundary:
        // `ReportParameterBinder` does that conversion itself when it builds the Char(1) param.
        // Sending "Y" here is rejected as "not a boolean" and 400s the whole run.
        const trueValue = "true";
        const falseValue = "false";
        return (
          <Select
            value={value.value?.trim() ? value.value : ANY_VALUE}
            disabled={isRunning}
            onValueChange={(next) => setValue(variable.name, {value: next === ANY_VALUE ? null : next})}
          >
            <SelectTrigger id={id}><SelectValue/></SelectTrigger>
            <SelectContent>
              {/* Sentinel, never empty: an empty SelectItem value is illegal in this repo. */}
              {!variable.required && <SelectItem value={ANY_VALUE}>{t("reports.anyValue")}</SelectItem>}
              <SelectItem value={trueValue}>{t("yes")}</SelectItem>
              <SelectItem value={falseValue}>{t("no")}</SelectItem>
            </SelectContent>
          </Select>
        );
      }

      case ReportVariableType.Text:
      default:
        return (
          <Input
            id={id}
            value={value.value ?? ""}
            disabled={isRunning}
            onChange={(e) => setValue(variable.name, {value: e.target.value.length > 0 ? e.target.value : null})}
          />
        );
    }
  };

  return (
    <div className="space-y-3">
      {ordered.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map((variable) => (
            <div key={variable.name} className="min-w-0 space-y-1">
              <Label htmlFor={`filter-${variable.name}`} className="text-xs text-muted-foreground">
                {variable.label}{variable.required ? " *" : ""}
              </Label>
              {renderInput(variable)}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={onRun} disabled={isRunning}>
          <Play className="mr-2 h-4 w-4"/>
          {isRunning ? t("reports.running") : t("reports.run")}
        </Button>
        {ordered.length > 0 && (
          <Button type="button" variant="outline" onClick={reset} disabled={isRunning}>
            <Eraser className="mr-2 h-4 w-4"/>
            {t("reports.resetFilters")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default ReportFilterBar;
