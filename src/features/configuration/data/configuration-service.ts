import {axiosInstance} from "@/utils/axios-instance";
import {
  ConfigAuditEntry,
  ConfigExportBundle,
  ConfigImportResult,
  ConfigMigrationStatus,
  ConfigSectionDetail,
  ConfigSectionSummary,
  ConfigValidationResult,
} from "./types";

export const configurationService = {
  async list(): Promise<ConfigSectionSummary[]> {
    const res = await axiosInstance.get<ConfigSectionSummary[]>("configuration");
    return res.data;
  },

  async get(section: string): Promise<ConfigSectionDetail> {
    const res = await axiosInstance.get<ConfigSectionDetail>(`configuration/${section}`);
    return res.data;
  },

  async validate(section: string, json: any): Promise<ConfigValidationResult> {
    const res = await axiosInstance.post<ConfigValidationResult>(`configuration/${section}/validate`, {json});
    return res.data;
  },

  async update(section: string, json: any, expectedVersion?: number): Promise<ConfigSectionDetail> {
    const res = await axiosInstance.put<ConfigSectionDetail>(`configuration/${section}`, {json, expectedVersion});
    return res.data;
  },

  async history(section: string): Promise<ConfigAuditEntry[]> {
    const res = await axiosInstance.get<ConfigAuditEntry[]>(`configuration/${section}/history`);
    return res.data;
  },

  async restore(section: string, version: number): Promise<ConfigSectionDetail> {
    const res = await axiosInstance.post<ConfigSectionDetail>(`configuration/${section}/restore/${version}`);
    return res.data;
  },

  async migrationStatus(): Promise<ConfigMigrationStatus | null> {
    const res = await axiosInstance.get<ConfigMigrationStatus | null>("configuration/migration-status");
    return res.data;
  },

  async exportAll(): Promise<ConfigExportBundle> {
    const res = await axiosInstance.get<ConfigExportBundle>("configuration/export");
    return res.data;
  },

  async exportSection(section: string): Promise<ConfigExportBundle> {
    const res = await axiosInstance.get<ConfigExportBundle>(`configuration/export/${section}`);
    return res.data;
  },

  async import(sections: Record<string, any>, dryRun: boolean): Promise<ConfigImportResult> {
    const res = await axiosInstance.post<ConfigImportResult>(`configuration/import?dryRun=${dryRun}`, {sections});
    return res.data;
  },

  /** Tests a draft SBO connection without saving. Masked secrets are resolved server-side. */
  async testSboConnection(json: any): Promise<{ success: boolean; message?: string }> {
    const res = await axiosInstance.post<{ success: boolean; message?: string }>(
      "configuration/SboSettings/test-connection", {json});
    return res.data;
  },
};
