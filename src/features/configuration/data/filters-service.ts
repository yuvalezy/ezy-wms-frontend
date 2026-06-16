import {axiosInstance} from "@/utils/axios-instance";

/** Result of validating a single "Filters" SQL fragment against the external SAP database. */
export interface FilterValidationResult {
  valid: boolean;
  message: string;
}

/** Per-filter results of a "Filters" draft DB validation. A filter absent from the draft is omitted. */
export interface FiltersValidationResponse {
  vendors?: FilterValidationResult | null;
  pickPackOnly?: FilterValidationResult | null;
}

export const filtersService = {
  /**
   * Validates the draft "Filters" SQL fragments against the external SAP database. Each present
   * filter is spliced into the exact query shape it is used in at runtime and executed inside a
   * rolled-back transaction (guarded to return no rows), so syntax errors and unknown columns
   * surface without persisting anything.
   */
  async validateSql(json: any): Promise<FiltersValidationResponse> {
    const res = await axiosInstance.post<FiltersValidationResponse>(
      "configuration/Filters/validate-sql", {json});
    return res.data;
  },
};
