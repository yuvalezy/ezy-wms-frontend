import {axiosInstance} from "@/utils/axios-instance";

export interface SystemStatus {
  ready: boolean;
  sboConfigured: boolean;
  detail?: string | null;
  checkedAtUtc?: string | null;
  version?: string | null;
}

export const systemService = {
  /** Anonymous; never depends on SAP succeeding, so it's safe to poll during lockdown. */
  async getStatus(): Promise<SystemStatus> {
    const res = await axiosInstance.get<SystemStatus>("system/status");
    return res.data;
  },

  /** Superuser-only: re-evaluates readiness after fixing the configuration. */
  async recheck(): Promise<SystemStatus> {
    const res = await axiosInstance.post<SystemStatus>("system/recheck");
    return res.data;
  },
};
