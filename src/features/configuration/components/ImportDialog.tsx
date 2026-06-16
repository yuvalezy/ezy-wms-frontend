import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, CheckCircle2, Upload} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {ConfigImportResult} from "../data/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
}

const ImportDialog: React.FC<Props> = ({open, onOpenChange, onImported}) => {
  const {t} = useTranslation();
  const [sections, setSections] = useState<Record<string, any> | null>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<ConfigImportResult | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setSections(null);
    setFileName("");
    setPreview(null);
  };

  const onFile = async (file?: File) => {
    if (!file) {
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const secs = parsed.sections ?? parsed;
      setSections(secs);
      setFileName(file.name);
      setBusy(true);
      setPreview(await configurationService.import(secs, true));
    } catch (error) {
      toast.error(`${t("configuration.invalidBundle")}: ${error}`);
      reset();
    } finally {
      setBusy(false);
    }
  };

  const apply = async () => {
    if (!sections) {
      return;
    }
    try {
      setBusy(true);
      const result = await configurationService.import(sections, false);
      if (result.success) {
        toast.success(t("configuration.imported"));
        onImported();
        onOpenChange(false);
        reset();
      } else {
        setPreview(result);
        toast.error(t("configuration.importHadErrors"));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.error_description ?? `${error}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Upload className="h-4 w-4"/>{t("configuration.import")}</DialogTitle>
        </DialogHeader>

        <Input type="file" accept="application/json,.json" onChange={(e) => onFile(e.target.files?.[0])}/>
        {fileName && <p className="text-xs text-muted-foreground">{fileName}</p>}

        {preview && (
          <div className="space-y-2 max-h-[45vh] overflow-auto">
            <Alert variant={preview.sections.every((s) => s.valid) ? "default" : "destructive"}>
              {preview.sections.every((s) => s.valid)
                ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
              <AlertDescription>
                {preview.dryRun ? t("configuration.dryRunResult") : t("configuration.importResult")}
              </AlertDescription>
            </Alert>
            {preview.sections.map((s) => (
              <div key={s.section} className="rounded border px-3 py-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{s.section}</span>
                  <Badge variant={s.valid ? "outline" : "destructive"}>
                    {s.applied ? t("configuration.applied") : s.valid ? t("configuration.valid") : t("configuration.invalid")}
                  </Badge>
                </div>
                {s.errors.length > 0 && (
                  <ul className="list-disc pl-4 text-xs text-destructive mt-1">
                    {s.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t("cancel")}</Button>
          <Button onClick={apply}
                  disabled={busy || !sections || !preview || !preview.sections.every((s) => s.valid)}>
            {t("configuration.applyImport")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
