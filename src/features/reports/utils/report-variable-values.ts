import {ReportVariableValue} from "@/features/reports/data/types";

/**
 * The filter values for one report run, keyed by variable name.
 *
 * Lives in `utils/` rather than beside the filter bar so that pure modules (the query-string parser)
 * can name it without importing a component. `ReportFilterBar` re-exports it, so its public surface
 * is unchanged.
 */
export type ReportVariableValues = Record<string, ReportVariableValue>;
