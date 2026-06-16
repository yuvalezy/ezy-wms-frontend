export type ReloadKind = "Live" | "RequiresRestart" | string;

export interface ConfigSectionSummary {
  section: string;
  version: number;
  updatedAtUtc: string;
  updatedByUserId?: string | null;
  reloadKind: ReloadKind;
  isAdvanced: boolean;
  isRestricted: boolean;
  hasSecrets: boolean;
}

export interface ConfigSectionDetail extends ConfigSectionSummary {
  json: any;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ConfigAuditEntry {
  id: string;
  version: number;
  changeType: string;
  changedAtUtc: string;
  changedByUserId?: string | null;
  note?: string | null;
}

export interface ConfigMigrationStatus {
  status: string;
  source: string;
  lastRunAtUtc?: string | null;
  archivePath?: string | null;
  sectionsCount?: number | null;
  detail?: string | null;
}

export interface ConfigExportBundle {
  formatVersion: number;
  exportedAtUtc: string;
  sections: Record<string, any>;
}

export interface ConfigSectionImportResult {
  section: string;
  valid: boolean;
  applied: boolean;
  errors: string[];
}

export interface ConfigImportResult {
  success: boolean;
  dryRun: boolean;
  sections: ConfigSectionImportResult[];
}

/** Secret leaves are returned/accepted as this sentinel. */
export const SECRET_MASK = "********";
