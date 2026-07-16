import {ReportVariableDescriptor, ReportVariableType} from "@/features/reports/data/types";
import {isCalendarDate, isCalendarDateTime, normalizeDateTime} from "@/features/reports/utils/report-date";
import {ReportVariableValues} from "@/features/reports/utils/report-variable-values";

/**
 * Reads report filter values out of a URL query string, so one report can drill down into another
 * (`/reports/bin-stock?ItemCode=A001&WhsCode=01`).
 *
 * ## The contract
 *
 * - Single-valued: `?ItemCode=A001`
 * - `allowMultiple`: `?Whs=01,02` (CSV — mirrors how a declared `defaultValue` is already split, and
 *   how the backend binds it: one CSV parameter). Repeated keys (`?Whs=01&Whs=02`) work too.
 * - `DateRange`: `?XFrom=2026-01-01&XTo=2026-03-31`, mirroring the backend's `@XFrom`/`@XTo`.
 * - Names match **case-insensitively**, like every other column/variable lookup in this system.
 * - `?X=` (present but empty) is an explicit clear to null — it overrides a declared default. Absent
 *   is different: absent keeps the default.
 * - Params starting with `__` are **reserved for the runner itself** (a future `__sort`/`__offset`)
 *   and are skipped silently. They can never collide with a variable, because the backend rejects
 *   variable names starting with `__`.
 * - Anything unrecognised or unrepresentable is reported as a {@link ReportQueryProblem} rather than
 *   dropped, so the caller can refuse to auto-run instead of quietly showing a *wider* result set
 *   than the link promised.
 *
 * ## Validate and normalize — never convert
 *
 * Values stay strings the whole way; the backend parses strictly and is the authority. But
 * *validating that a string is representable*, and *normalizing between dialects*, are different
 * acts from converting — and both are load-bearing here:
 *
 * - A `{Flag}` placeholder substituted from a SAP `char(1)` column arrives as `"Y"`, while the
 *   filter bar's select and the backend both speak `"true"`/`"false"`. Without normalizing, a
 *   drill-down on a `YesNo` column would render a blank control *and* 400 the run.
 * - `?Qty=abc` for an Integer must be rejected: `<input type="number">` silently discards a
 *   non-numeric value and renders **empty**, so the control would show nothing while still sending
 *   `"abc"` — a broken control and a failed run.
 * - `?Date=2026-02-31` must be rejected: JS rolls it forward to Mar 3, so the picker would display
 *   **March 3** while the value sent to SQL Server says February 31st.
 *
 * ## Known limitation
 *
 * A CSV multi-value cannot represent a value that itself contains a comma. The backend's
 * `STRING_SPLIT` binding has the identical flaw, so such a report is already ambiguous.
 */

/** Query params starting with this are the runner's own, never a variable's. */
export const RUNNER_PARAM_PREFIX = "__";

export type ReportQueryProblemKind =
  /** No variable answers to this name. */
  | "unknownParam"
  /** A recognised variable, but the value is not representable in its canonical encoding. */
  | "invalidValue"
  /** Two param keys resolve to the same variable, or a single-valued variable got repeated keys. */
  | "duplicateParam";

export interface ReportQueryProblem {
  /** The key exactly as it appeared in the URL — echoed back verbatim, never the normalized form. */
  param: string;
  kind: ReportQueryProblemKind;
  value?: string;
}

export interface ReportQueryPrefill {
  /** `base` with every recognised, valid param layered over it. Safe to render *and* to send. */
  values: ReportVariableValues;
  /** Non-empty → the URL asked for something that cannot be honoured honestly. Do not auto-run. */
  problems: ReportQueryProblem[];
}

const INTEGER_PATTERN = /^[+-]?\d+$/;
const DECIMAL_PATTERN = /^[+-]?(\d+(\.\d*)?|\.\d+)$/;

const TRUE_TOKENS = new Set(["true", "y", "yes", "1"]);
const FALSE_TOKENS = new Set(["false", "n", "no", "0"]);

/** Which half of a `DateRange` a param names. */
type RangeEdge = "from" | "to";

interface Resolution {
  variable: ReportVariableDescriptor;
  edge?: RangeEdge;
}

/**
 * Validates and normalizes one scalar against a variable's type.
 * Returns the canonical string, or `null` when the value is not representable.
 */
const canonicalize = (raw: string, variable: ReportVariableDescriptor): string | null => {
  const value = raw.trim();

  switch (variable.type) {
    case ReportVariableType.Integer:
      return INTEGER_PATTERN.test(value) ? value : null;
    case ReportVariableType.Decimal:
      return DECIMAL_PATTERN.test(value) ? value : null;
    case ReportVariableType.Date:
    // A DateRange reaches here one edge at a time, and each edge is exactly a Date — without this
    // case it would fall to the pass-through default and skip validation entirely.
    case ReportVariableType.DateRange:
      return isCalendarDate(value) ? value : null;
    case ReportVariableType.DateTime:
      return isCalendarDateTime(value) ? normalizeDateTime(value) : null;
    case ReportVariableType.Boolean:
    case ReportVariableType.YesNo: {
      // SAP's Y/N and a bit column's true/false both reach a link template; both must work.
      const token = value.toLowerCase();
      if (TRUE_TOKENS.has(token)) {
        return "true";
      }
      return FALSE_TOKENS.has(token) ? "false" : null;
    }
    case ReportVariableType.SelectList: {
      // Options are on the descriptor, so an impossible choice is knowable now — emit the option's
      // own casing, never the URL's, so it matches the <SelectItem> that renders it.
      const match = variable.options.find((option) => option.value.toLowerCase() === value.toLowerCase());
      return match ? match.value : null;
    }
    case ReportVariableType.SqlLookup:
      // Options are fetched async and are often a filtered/top-N set, so membership is genuinely
      // unknowable here. A value that matches nothing returns zero rows, which is correct.
      return value;
    case ReportVariableType.Text:
    default:
      return value;
  }
};

/** Builds the name → variable index, including each `DateRange`'s `XFrom`/`XTo` keys. */
const buildIndex = (variables: ReportVariableDescriptor[]) => {
  const byName = new Map<string, Resolution>();
  const byRangeKey = new Map<string, Resolution>();

  for (const variable of variables) {
    byName.set(variable.name.toLowerCase(), {variable});
    if (variable.type === ReportVariableType.DateRange) {
      const name = variable.name.toLowerCase();
      byRangeKey.set(`${name}from`, {variable, edge: "from"});
      byRangeKey.set(`${name}to`, {variable, edge: "to"});
    }
  }
  return {byName, byRangeKey};
};

/**
 * Layers a URL's filters over a set of base values.
 *
 * @param variables The target report's declared variables.
 * @param searchParams The URL's query string.
 * @param base Values to start from — normally `buildInitialVariableValues(variables)`, so a variable
 *   the URL does not mention keeps its declared default. Never mutated.
 */
export function variableValuesFromQuery(
  variables: ReportVariableDescriptor[],
  searchParams: URLSearchParams,
  base: ReportVariableValues,
): ReportQueryPrefill {
  const {byName, byRangeKey} = buildIndex(variables);
  const values: ReportVariableValues = {...base};
  const problems: ReportQueryProblem[] = [];

  // Which param key already claimed a given variable+edge, so a second one is a reported collision
  // rather than a silent last-write-wins.
  const claimed = new Map<string, string>();

  for (const key of new Set(searchParams.keys())) {
    if (key.startsWith(RUNNER_PARAM_PREFIX)) {
      continue;
    }

    // Exact name first: a variable literally named "FooFrom" outranks a DateRange "Foo"'s From half.
    // The backend has the same collision on @FooFrom, so this is author-avoidable either way.
    const resolution = byName.get(key.toLowerCase()) ?? byRangeKey.get(key.toLowerCase());
    if (!resolution) {
      problems.push({param: key, kind: "unknownParam"});
      continue;
    }

    const {variable, edge} = resolution;

    // A DateRange addressed by its bare name has no meaning — it is two params, not one.
    if (!edge && variable.type === ReportVariableType.DateRange) {
      problems.push({param: key, kind: "invalidValue", value: searchParams.get(key) ?? ""});
      continue;
    }

    const claimKey = `${variable.name.toLowerCase()}|${edge ?? ""}`;
    const priorKey = claimed.get(claimKey);
    if (priorKey !== undefined) {
      problems.push({param: key, kind: "duplicateParam", value: priorKey});
      continue;
    }
    claimed.set(claimKey, key);

    const raw = searchParams.getAll(key);

    // DateRange precedence must match buildInitialVariableValues, which checks DateRange BEFORE
    // allowMultiple — otherwise a DateRange marked allowMultiple gets {values:[]} in one place and
    // {from,to} in the other, and the filter bar and the query disagree about its shape.
    if (edge) {
      if (raw.length > 1) {
        problems.push({param: key, kind: "duplicateParam"});
        continue;
      }
      const existing = values[variable.name] ?? {from: null, to: null};
      const text = raw[0].trim();
      if (text.length === 0) {
        values[variable.name] = {...existing, [edge]: null};
        continue;
      }
      const canonical = canonicalize(text, variable);
      if (canonical === null) {
        problems.push({param: key, kind: "invalidValue", value: text});
        continue;
      }
      values[variable.name] = {...existing, [edge]: canonical};
      continue;
    }

    if (variable.allowMultiple) {
      // `?X=a,b` and `?X=a&X=b` are both natural URL idioms and mean the same thing here.
      const parts = raw.flatMap((entry) => entry.split(",")).map((part) => part.trim()).filter(Boolean);
      const canonical: string[] = [];
      let invalid: string | null = null;
      for (const part of parts) {
        const one = canonicalize(part, variable);
        if (one === null) {
          invalid = part;
          break;
        }
        canonical.push(one);
      }
      if (invalid !== null) {
        problems.push({param: key, kind: "invalidValue", value: invalid});
        continue;
      }
      values[variable.name] = {values: canonical};
      continue;
    }

    if (raw.length > 1) {
      problems.push({param: key, kind: "duplicateParam"});
      continue;
    }

    const text = raw[0];
    // Present-but-empty is not the same as absent: the URL mentioned it, so it is an explicit clear
    // that overrides the declared default.
    if (text.trim().length === 0) {
      values[variable.name] = {value: null};
      continue;
    }

    const canonical = canonicalize(text, variable);
    if (canonical === null) {
      problems.push({param: key, kind: "invalidValue", value: text});
      continue;
    }
    values[variable.name] = {value: canonical};
  }

  return {values, problems};
}

/** True when the URL carries anything the runner should act on. */
export const hasReportQueryParams = (searchParams: URLSearchParams): boolean =>
  [...searchParams.keys()].some((key) => !key.startsWith(RUNNER_PARAM_PREFIX));
