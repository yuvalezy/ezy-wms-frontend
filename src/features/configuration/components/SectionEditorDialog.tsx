import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Badge} from "@/components/ui/badge";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {AlertTriangle, CheckCircle2, History, KeyRound, RotateCw, Save, ShieldAlert} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {ConfigSectionDetail} from "../data/types";
import SectionHistoryDialog from "./SectionHistoryDialog";

interface Props {
  section: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

const SectionEditorDialog: React.FC<Props> = ({section, open, onOpenChange, onSaved}) => {
  const {t} = useTranslation();
  const [detail, setDetail] = useState<ConfigSectionDetail | null>(null);
  const [jsonText, setJsonText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (open) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, section]);

  const load = async () => {
    try {
      setLoading(true);
      setErrors([]);
      const d = await configurationService.get(section);
      setDetail(d);
      setJsonText(JSON.stringify(d.json ?? null, null, 2));
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const parse = (): { ok: boolean; value?: any } => {
    const text = jsonText.trim();
    if (text === "") {
      return {ok: true, value: null};
    }
    try {
      return {ok: true, value: JSON.parse(text)};
    } catch (e: any) {
      setErrors([`${t("configuration.invalidJson")}: ${e.message}`]);
      return {ok: false};
    }
  };

  const runValidate = async () => {
    setErrors([]);
    const parsed = parse();
    if (!parsed.ok) {
      return;
    }
    try {
      const result = await configurationService.validate(section, parsed.value);
      if (result.valid) {
        toast.success(t("configuration.valid"));
      } else {
        setErrors(result.errors);
      }
    } catch (error) {
      setErrors([`${error}`]);
    }
  };

  const save = async () => {
    setErrors([]);
    const parsed = parse();
    if (!parsed.ok || !detail) {
      return;
    }
    try {
      setSaving(true);
      await configurationService.update(section, parsed.value, detail.version);
      toast.success(t("configuration.saved"));
      onSaved();
      onOpenChange(false);
    } catch (error: any) {
      const data = error?.response?.data;
      const list: string[] = data?.errors?.length ? data.errors : [data?.error_description ?? `${error}`];
      setErrors(list);
    } finally {
      setSaving(false);
    }
  };

  const requiresRestart = detail?.reloadKind === "RequiresRestart";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              {section}
              {detail && <Badge variant="outline">v{detail.version}</Badge>}
              {requiresRestart && (
                <Badge variant="secondary" className="gap-1">
                  <RotateCw className="h-3 w-3"/>{t("configuration.appliesAfterRestart")}
                </Badge>
              )}
              {detail?.isAdvanced && <Badge variant="outline">{t("configuration.advanced")}</Badge>}
              {detail?.hasSecrets && (
                <Badge variant="outline" className="gap-1"><KeyRound className="h-3 w-3"/>{t("configuration.secrets")}</Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {detail?.isRestricted && (
            <Alert>
              <ShieldAlert className="h-4 w-4"/>
              <AlertDescription>{t("configuration.restrictedWarning")}</AlertDescription>
            </Alert>
          )}
          {detail?.hasSecrets && (
            <Alert>
              <KeyRound className="h-4 w-4"/>
              <AlertDescription>{t("configuration.secretsWarning")}</AlertDescription>
            </Alert>
          )}

          <Textarea
            className="font-mono text-xs h-[45vh]"
            spellCheck={false}
            value={jsonText}
            disabled={loading}
            onChange={(e) => setJsonText(e.target.value)}
          />

          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4"/>
              <AlertDescription>
                <ul className="list-disc pl-4">
                  {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter className="flex-wrap gap-2 sm:justify-between">
            <Button type="button" variant="ghost" onClick={() => setShowHistory(true)}>
              <History className="h-4 w-4 mr-1"/>{t("configuration.history")}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={runValidate} disabled={saving}>
                <CheckCircle2 className="h-4 w-4 mr-1"/>{t("configuration.validate")}
              </Button>
              <Button type="button" onClick={save} disabled={saving || loading}>
                <Save className="h-4 w-4 mr-1"/>{t("save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SectionHistoryDialog
        section={section}
        open={showHistory}
        onOpenChange={setShowHistory}
        onRestored={() => {
          onSaved();
          void load();
        }}
      />
    </>
  );
};

export default SectionEditorDialog;
