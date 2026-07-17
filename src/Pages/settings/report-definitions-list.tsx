import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {Download, Edit, Play, Trash2, Upload} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {reportDefinitionService} from "@/features/reports/data/report-service";
import {ReportDefinitionSummary} from "@/features/reports/data/types";
import ReportImportDialog from "@/features/reports/components/ReportImportDialog";

/**
 * Superuser list of report definitions (`/settings/reports`).
 *
 * Unlike `/reports`, this lists **every** definition including disabled ones — a disabled report
 * still needs to be findable to be re-enabled or deleted.
 *
 * Import/export moves a report between installs as a JSON file — the server exchanges plain JSON and
 * the browser does the file part, matching the configuration screen. See `ReportImportDialog`.
 */
const ReportDefinitionsList: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const navigate = useNavigate();

  const [reports, setReports] = useState<ReportDefinitionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<ReportDefinitionSummary | null>(null);
  const [showImport, setShowImport] = useState(false);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await reportDefinitionService.list();
      setReports(data);
    } catch (error) {
      setError(`${t("reports.loadFailed")}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  /**
   * Saves JSON as a file. Same idiom as the configuration screen's export — an anchor and an object
   * URL, rather than file-saver, which only `excelExport.ts` uses.
   */
  const download = (data: unknown, name: string) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type: "application/json"}));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = name;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = async () => {
    try {
      const bundle = await reportDefinitionService.exportAll();
      download(bundle, "ezy-wms-reports.json");
      toast.success(t("reports.import.exported", {count: bundle.reports.length}));
    } catch (error) {
      setError(`${t("reports.import.exportFailed")}: ${error}`);
    }
  };

  const exportOne = async (report: ReportDefinitionSummary) => {
    try {
      // Named for the slug, so a folder of these is readable and re-importing the right one is obvious.
      download(await reportDefinitionService.exportOne(report.id), `${report.slug}.json`);
      toast.success(t("reports.import.exported", {count: 1}));
    } catch (error) {
      setError(`${t("reports.import.exportFailed")}: ${error}`);
    }
  };

  const confirmDelete = async () => {
    if (!reportToDelete) {
      return;
    }
    try {
      setIsLoading(true);
      await reportDefinitionService.delete(reportToDelete.id);
      await loadReports();
    } catch (error) {
      setError(`${t("reports.deleteFailed")}: ${error}`);
    } finally {
      setShowDeleteDialog(false);
      setReportToDelete(null);
      setIsLoading(false);
    }
  };

  return (
    <ContentTheme
      title={t("settings")}
      titleBreadcrumbs={[{label: t("reports.definitions")}]}
      onAdd={() => navigate("/settings/reports/add")}
    >
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="mr-2 h-4 w-4"/>
            {t("reports.import.title")}
          </Button>
          <Button variant="outline" size="sm" onClick={exportAll} disabled={isLoading || reports.length === 0}>
            <Download className="mr-2 h-4 w-4"/>
            {t("reports.import.exportAll")}
          </Button>
        </div>

        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{t("reports.slug")}</TableHead>
                  <TableHead>{t("description")}</TableHead>
                  <TableHead className="text-center">{t("reports.columns")}</TableHead>
                  <TableHead className="text-center">{t("reports.variables")}</TableHead>
                  <TableHead>{t("status")}</TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({length: 5}).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-32"/></TableCell>
                      <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                      <TableCell><Skeleton className="h-4 w-40"/></TableCell>
                      <TableCell><Skeleton className="mx-auto h-4 w-8"/></TableCell>
                      <TableCell><Skeleton className="mx-auto h-4 w-8"/></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full"/></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-8 w-16"/>
                          <Skeleton className="h-8 w-20"/>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">{t("reports.noReportsFound")}</TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell className="font-mono text-xs">{report.slug}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={report.description ?? undefined}>
                          {report.description || "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{report.columnCount}</TableCell>
                      <TableCell className="text-center">{report.variableCount}</TableCell>
                      <TableCell>
                        <Badge variant={report.enabled ? "default" : "secondary"}>
                          {report.enabled ? t("reports.enabled") : t("reports.disabled")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t("reports.run")}
                            // Superusers implicitly have access to every report, so this always resolves.
                            onClick={() => navigate(`/reports/${encodeURIComponent(report.slug)}`)}
                          >
                            <Play className="h-4 w-4"/>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title={t("reports.import.exportOne")}
                            onClick={() => exportOne(report)}
                          >
                            <Download className="h-4 w-4"/>
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => navigate(`/settings/reports/${report.id}`)}>
                            <Edit className="mr-1 h-4 w-4"/>
                            {t("edit")}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setReportToDelete(report);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="mr-1 h-4 w-4"/>
                            {t("delete")}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("reports.confirmDeleteReport", {name: reportToDelete?.name ?? ""})}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <ReportImportDialog
          open={showImport}
          onOpenChange={setShowImport}
          onImported={loadReports}
        />
      </div>
    </ContentTheme>
  );
};

export default ReportDefinitionsList;
