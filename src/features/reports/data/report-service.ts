import {axiosInstance} from "@/utils/axios-instance";
import {
  CreateReportDefinitionRequest,
  ReportDefinitionDetail,
  ReportDefinitionSummary,
  ReportExecutionRequest,
  ReportLookupOption,
  ReportPageResult,
  ReportValidationResult,
  UpdateReportDefinitionRequest,
} from "./types";

/**
 * End-user report access (`Service/Controllers/ReportController`, `[Authorize]`).
 *
 * Per-report access is checked **live against the DB** on every call — never snapshotted into the
 * session — so a grant takes effect without re-login. A non-granted report returns 403, which the
 * axios interceptor already turns into a `/unauthorized` redirect; callers need no special handling.
 */
export const reportService = Object.freeze({
  /** Reports the current user may run. Enabled only, live-checked. Superusers see everything. */
  async list(): Promise<ReportDefinitionSummary[]> {
    const res = await axiosInstance.get<ReportDefinitionSummary[]>("report");
    return res.data;
  },

  /** Definition + column/variable metadata for the runner. `sql`/`countSql`/`lookupSql` are null unless superuser. */
  async get(slug: string): Promise<ReportDefinitionDetail> {
    const res = await axiosInstance.get<ReportDefinitionDetail>(`report/${encodeURIComponent(slug)}`);
    return res.data;
  },

  /** Runs one page. Paging is driven by the result's `hasMore` flag — there is no total count here. */
  async run(slug: string, request: ReportExecutionRequest): Promise<ReportPageResult> {
    const res = await axiosInstance.post<ReportPageResult>(`report/${encodeURIComponent(slug)}/run`, request);
    return res.data;
  },

  /**
   * Exact row count for the same filters — a **separate, lazy** endpoint so a slow count never
   * blocks the rows. Only meaningful when the report declares `totalCountMode: Exact`.
   */
  async count(slug: string, request: ReportExecutionRequest): Promise<number> {
    const res = await axiosInstance.post<number>(`report/${encodeURIComponent(slug)}/count`, request);
    return res.data;
  },

  /**
   * Options for a `SqlLookup` variable. All declared variables are bound to the lookup query, so
   * passing the current filter values enables cascading lookups (e.g. warehouse → bin).
   * Capped at 1000 rows server-side.
   */
  async lookup(slug: string, variableName: string, request: ReportExecutionRequest): Promise<ReportLookupOption[]> {
    const res = await axiosInstance.post<ReportLookupOption[]>(
      `report/${encodeURIComponent(slug)}/lookup/${encodeURIComponent(variableName)}`, request);
    return res.data;
  },
});

/**
 * Superuser report authoring (`Service/Controllers/ReportDefinitionController`, `[RequireSuperUser]`).
 * Definitions are WMS's own EF data; only report *execution* touches SAP.
 */
export const reportDefinitionService = Object.freeze({
  /** Every definition, **including disabled ones** — backs the settings list and the auth-group grant card. */
  async list(): Promise<ReportDefinitionSummary[]> {
    const res = await axiosInstance.get<ReportDefinitionSummary[]>("reportDefinition");
    return res.data;
  },

  async get(id: string): Promise<ReportDefinitionDetail> {
    const res = await axiosInstance.get<ReportDefinitionDetail>(`reportDefinition/${id}`);
    return res.data;
  },

  /**
   * The Test button: validates and compiles **both** shapes (page and count) plus every lookup
   * query inside an always-rollback scope, and discovers the columns. Never saves.
   * `valid: false` carries SQL Server's real error text in `errors`.
   */
  async test(request: CreateReportDefinitionRequest): Promise<ReportValidationResult> {
    const res = await axiosInstance.post<ReportValidationResult>("reportDefinition/test", request);
    return res.data;
  },

  async create(request: CreateReportDefinitionRequest): Promise<ReportDefinitionDetail> {
    const res = await axiosInstance.post<ReportDefinitionDetail>("reportDefinition", request);
    return res.data;
  },

  /**
   * The id travels in the **body**, not the path — `ReportDefinitionController.Update` is a bare
   * `[HttpPut]` on `api/[controller]`, matching `AuthorizationGroupController` (the style the spec
   * says this controller follows). A `PUT reportDefinition/{id}` matches no route and 404s.
   */
  async update(request: UpdateReportDefinitionRequest): Promise<ReportDefinitionDetail> {
    const res = await axiosInstance.put<ReportDefinitionDetail>("reportDefinition", request);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`reportDefinition/${id}`);
  },
});
