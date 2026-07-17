import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {AlertTriangle, CheckCircle2, Upload} from "lucide-react";
import {toast} from "sonner";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {reportDefinitionService} from "@/features/reports/data/report-service";
import {
  CreateReportDefinitionRequest,
  ReportImportAction,
  ReportImportResult,
} from "@/features/reports/data/types";

/**
 * Imports a report bundle, previewing it first.
 *
 * Modelled on `features/configuration/components/ImportDialog` — same shape, same reasons: the file is
 * read in the browser and posted as a plain JSON body, and a dry run runs the moment a file is picked
 * so nothing is written before the operator has seen what it would do.
 *
 * **The dry run is the point.** It compiles every report's SQL against *this* install's SAP, so a
 * report needing a table or column the target lacks says so in SQL Server's own words — before
 * anything lands. Apply is all-or-nothing, so one bad report blocks the bundle rather than leaving a
 * half-imported set nobody can reason about.
 */

export interface ReportImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Fired after a successful apply, so the list can refetch. */
  onImported: () => void;
}

interface ParsedBundle {
  reports: CreateReportDefinitionRequest[];
  formatVersion: number;
}

export const ReportImportDialog: React.FC<ReportImportDialogProps> = ({open, onOpenChange, onImported}) => {
  const {t} = useTranslation();
  const [bundle, setBundle] = useState<ParsedBundle | null>(null);
  const [preview, setPreview] = useState<ReportImportResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setBundle(null);
    setPreview(null);
    setFileName(null);
  };

  const onFile = async (file?: File) => {
    if (!file) {
      return;
    }
    try {
      const parsed = JSON.parse(await file.text());
      // Tolerates both a full bundle and a bare array — someone will hand-edit one of these, and a
      // file that is obviously a list of reports should not be refused on a wrapper.
      const reports: CreateReportDefinitionRequest[] = Array.isArray(parsed) ? parsed : parsed.reports;
      if (!Array.isArray(reports)) {
        throw new Error(t("reports.import.notABundle"));
      }
      // Defaults to this build's version when absent: a hand-written file should not have to know it.
      const next: ParsedBundle = {reports, formatVersion: Array.isArray(parsed) ? 1 : parsed.formatVersion ?? 1};
      setBundle(next);
      setFileName(file.name);

      setBusy(true);
      setPreview(await reportDefinitionService.import(next, true));
    } catch (error) {
      toast.error(`${t("reports.import.invalidFile")}: ${error}`);
      reset();
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!bundle) {
      return;
    }
    try {
      setBusy(true);
      const result = await reportDefinitionService.import(bundle, false);
      if (result.success) {
        toast.success(t("reports.import.imported", {count: result.reports.length}));
        onImported();
        onOpenChange(false);
        reset();
      } else {
        // Between the dry run and Apply, the database moved (a slug was taken, SAP changed). Show the
        // fresh verdicts rather than the stale ones the operator approved.
        setPreview(result);
        toast.error(t("reports.import.hadErrors"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error_description ?? `${error}`);
    } finally {
      setBusy(false);
    }
  };

  const canApply = Boolean(bundle) && Boolean(preview?.success) && !busy;

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) {
        reset();
      }
    }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-4 w-4"/>
            {t("reports.import.title")}
          </DialogTitle>
        </DialogHeader>

        <Input type="file" accept="application/json,.json" onChange={(e) => onFile(e.target.files?.[0])}/>
        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}

        {/* A file-level problem (wrong format version, no reports) has no per-report rows to show. */}
        {preview && preview.errors.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4"/>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {preview.errors.map((error, i) => <li key={i}>{error}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {preview && preview.reports.length > 0 && (
          <div className="max-h-[45vh] space-y-2 overflow-auto">
            <Alert variant={preview.success ? "default" : "destructive"}>
              {preview.success ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
              <AlertDescription>
                {preview.success
                  ? t("reports.import.dryRunOk", {count: preview.reports.length})
                  : t("reports.import.dryRunFailed")}
              </AlertDescription>
            </Alert>

            {preview.reports.map((report) => (
              <div key={report.slug} className="rounded border px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-medium">{report.name}</span>
                    <span className="ml-2 font-mono text-xs text-muted-foreground">{report.slug}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {/* Overwrite is the one an operator must see before pressing Apply. */}
                    <Badge variant={report.action === ReportImportAction.Overwrite ? "secondary" : "outline"}>
                      {t(`reports.import.actions.${report.action}`)}
                    </Badge>
                    <Badge variant={report.valid ? "outline" : "destructive"}>
                      {report.applied
                        ? t("reports.import.applied")
                        : report.valid ? t("reports.import.valid") : t("reports.import.invalid")}
                    </Badge>
                  </div>
                </div>
                {report.errors.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-xs text-destructive">
                    {report.errors.map((error, i) => <li key={i} className="break-words">{error}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={apply} disabled={!canApply}>
            {t("reports.import.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportImportDialog;
