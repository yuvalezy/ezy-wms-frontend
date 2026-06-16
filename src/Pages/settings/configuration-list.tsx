import React, {useEffect, useState} from "react";
import {useSearchParams} from "react-router";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AlertTriangle, CheckCircle2, Download, Edit, KeyRound, RotateCw, Upload} from "lucide-react";
import {useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {configurationService} from "@/features/configuration/data/configuration-service";
import {ConfigMigrationStatus, ConfigSectionSummary} from "@/features/configuration/data/types";
import SectionEditorDialog from "@/features/configuration/components/SectionEditorDialog";
import CustomFieldsEditor from "@/features/configuration/components/CustomFieldsEditor";
import ImportDialog from "@/features/configuration/components/ImportDialog";
import OptionsEditor from "@/features/configuration/components/OptionsEditor";
import SboSettingsEditor from "@/features/configuration/components/SboSettingsEditor";

type ConfigView = "Options" | "SboSettings" | "CustomFields" | "Other";

const CONFIG_VIEWS: ConfigView[] = ["Options", "SboSettings", "CustomFields", "Other"];

/** Restore the section from the URL hash (#Section) first, then the ?view= query, else Options. */
function resolveInitialView(queryView: string | null): ConfigView {
  const hash = (typeof window !== "undefined" ? window.location.hash.replace("#", "") : "") as ConfigView;
  if (CONFIG_VIEWS.includes(hash)) {
    return hash;
  }
  if (queryView && CONFIG_VIEWS.includes(queryView as ConfigView)) {
    return queryView as ConfigView;
  }
  return "Options";
}

const ConfigurationList: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const [sections, setSections] = useState<ConfigSectionSummary[]>([]);
  const [status, setStatus] = useState<ConfigMigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<ConfigView>(() => resolveInitialView(searchParams.get("view")));

  // Persist the selected section in the URL hash so a refresh restores it.
  const changeView = (next: ConfigView) => {
    setView(next);
    window.history.replaceState(null, "", `#${next}`);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setIsLoading(true);
      const [list, st] = await Promise.all([
        configurationService.list(),
        configurationService.migrationStatus().catch(() => null),
      ]);
      setSections(list);
      setStatus(st);
    } catch (error) {
      setError(`${t("configuration.listFailed")}: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const download = (data: unknown, name: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAll = async () => {
    try {
      download(await configurationService.exportAll(), "ezy-wms-configuration.json");
      toast.success(t("configuration.exported"));
    } catch (error) {
      setError(`${error}`);
    }
  };

  const openEditor = (s: ConfigSectionSummary) => {
    setEditingSection(s.section);
  };

  // Options, SBO Settings and Custom Fields have their own friendly editors; the table lists the rest.
  const otherSections = sections.filter(
    (s) => s.section !== "Options" && s.section !== "SboSettings" && s.section !== "CustomFields",
  );

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("configuration.title")}]}>
      <div className="space-y-4">
        {status && (
          <Alert variant={status.status === "Failed" ? "destructive" : "default"}>
            {status.status === "Verified"
              ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
            <AlertTitle>{t("configuration.migrationStatus")}: {status.status}</AlertTitle>
            <AlertDescription>
              {status.source} · {status.sectionsCount ?? 0} {t("configuration.sections")}
              {status.archivePath ? ` · ${t("configuration.archivedTo")} ${status.archivePath}` : ""}
              {status.detail ? ` · ${status.detail}` : ""}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="w-56">
            <Select value={view} onValueChange={(v) => changeView(v as ConfigView)}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Options">{t("configuration.view.options")}</SelectItem>
                <SelectItem value="SboSettings">{t("configuration.view.sbo")}</SelectItem>
                <SelectItem value="CustomFields">{t("configuration.view.customFields")}</SelectItem>
                <SelectItem value="Other">{t("configuration.view.other")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 mr-1"/>{t("configuration.import")}
            </Button>
            <Button variant="outline" size="sm" onClick={exportAll}>
              <Download className="h-4 w-4 mr-1"/>{t("configuration.exportAll")}
            </Button>
          </div>
        </div>

        {view === "Options" ? (
          <OptionsEditor onSaved={load}/>
        ) : view === "SboSettings" ? (
          <SboSettingsEditor onSaved={load}/>
        ) : view === "CustomFields" ? (
          <CustomFieldsEditor onSaved={load}/>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("configuration.section")}</TableHead>
                    <TableHead>{t("configuration.version")}</TableHead>
                    <TableHead>{t("configuration.updatedAt")}</TableHead>
                    <TableHead>{t("configuration.flags")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({length: 6}).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}><Skeleton className="h-5 w-full"/></TableCell>
                      </TableRow>
                    ))
                  ) : otherSections.length === 0 ? (
                    <TableRow><TableCell colSpan={5}>{t("configuration.noSections")}</TableCell></TableRow>
                  ) : (
                    otherSections.map((s) => (
                      <TableRow key={s.section}>
                        <TableCell className="font-medium">{s.section}</TableCell>
                        <TableCell>v{s.version}</TableCell>
                        <TableCell>{new Date(s.updatedAtUtc).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {s.reloadKind === "RequiresRestart" && (
                              <Badge variant="secondary" className="gap-1">
                                <RotateCw className="h-3 w-3"/>{t("configuration.restart")}
                              </Badge>
                            )}
                            {s.isAdvanced && <Badge variant="outline">{t("configuration.advanced")}</Badge>}
                            {s.hasSecrets && (
                              <Badge variant="outline" className="gap-1">
                                <KeyRound className="h-3 w-3"/>{t("configuration.secrets")}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openEditor(s)}>
                            <Edit className="h-4 w-4 mr-1"/>{t("edit")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {editingSection && (
        <SectionEditorDialog
          section={editingSection}
          open={!!editingSection}
          onOpenChange={(o) => !o && setEditingSection(null)}
          onSaved={load}
        />
      )}
      <ImportDialog open={importOpen} onOpenChange={setImportOpen} onImported={load}/>
    </ContentTheme>
  );
};

export default ConfigurationList;
