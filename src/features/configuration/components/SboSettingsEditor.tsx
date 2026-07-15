import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertTriangle, CheckCircle2, Loader2, PlugZap, Save} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {ConfigSectionDetail} from "../data/types";
import {SBO_FIELDS, SBO_GROUPS, SboGroup} from "../data/sbo-settings-schema";
import {systemService} from "@/features/system/data/system-service";
import OptionFieldRow from "./OptionFieldRow";
import SectionHistoryDialog from "./SectionHistoryDialog";
import EditorActionBar from "./EditorActionBar";

interface Props {
  onSaved: () => void;
}

const SECTION = "SboSettings";

const SboSettingsEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [detail, setDetail] = useState<ConfigSectionDetail | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setErrors([]);
      const d = await configurationService.get(SECTION);
      setDetail(d);
      setValues({...(d.json ?? {})});
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const setField = (key: string, next: any) =>
    setValues((prev) => {
      const copy = {...prev};
      if (next === undefined) {
        delete copy[key];
      } else {
        copy[key] = next;
      }
      return copy;
    });

  const testConnection = async () => {
    setTestResult(null);
    try {
      setTesting(true);
      const result = await configurationService.testSboConnection(values);
      setTestResult(result);
      if (result.success) {
        toast.success(t("configuration.sbo.testOk"));
      }
    } catch (error: any) {
      const data = error?.response?.data;
      setTestResult({success: false, message: data?.error_description ?? `${error}`});
    } finally {
      setTesting(false);
    }
  };

  const save = async () => {
    if (!detail) {
      return;
    }
    setErrors([]);
    try {
      setSaving(true);
      await configurationService.update(SECTION, values, detail.version);
      toast.success(t("configuration.saved"));
      // SBO drives system readiness — re-evaluate so the lockdown can clear live.
      try {
        const status = await systemService.recheck();
        window.dispatchEvent(new Event("ezy:system-status"));
        if (status.ready) {
          toast.success(t("configuration.sbo.systemReady"));
        } else if (status.detail) {
          toast.warning(status.detail);
        }
      } catch {
        // recheck failures shouldn't block the save result
      }
      onSaved();
      await load();
    } catch (error: any) {
      const data = error?.response?.data;
      setErrors(data?.errors?.length ? data.errors : [data?.error_description ?? `${error}`]);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !detail) {
    return (
      <div className="space-y-3">
        {Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-40 w-full"/>)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {SBO_GROUPS.map((group: SboGroup) => {
        const fields = SBO_FIELDS.filter((f) => f.group === group);
        return (
          <Card key={group}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{t(`configuration.sbo.groups.${group}`)}</CardTitle>
            </CardHeader>
            <CardContent className="divide-y py-0">
              {fields.map((f) => (
                <OptionFieldRow
                  key={f.key}
                  field={f}
                  value={values[f.key]}
                  onChange={(v) => setField(f.key, v)}
                  i18nBase="configuration.sbo"
                  controlClassName="w-1/2 max-w-md"
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          {testResult.success ? <CheckCircle2 className="h-4 w-4"/> : <AlertTriangle className="h-4 w-4"/>}
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            <ul className="list-disc pl-4">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </AlertDescription>
        </Alert>
      )}

      <EditorActionBar onShowHistory={() => setShowHistory(true)}>
        <Button type="button" variant="outline" onClick={testConnection} disabled={testing || saving || loading}>
          {testing ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <PlugZap className="h-4 w-4 mr-1"/>}
          {t("configuration.sbo.testConnection")}
        </Button>
        <Button type="button" onClick={save} disabled={saving || loading}>
          <Save className="h-4 w-4 mr-1"/>{t("save")}
        </Button>
      </EditorActionBar>

      <SectionHistoryDialog
        section={SECTION}
        open={showHistory}
        onOpenChange={setShowHistory}
        onRestored={() => {
          onSaved();
          void load();
        }}
      />
    </div>
  );
};

export default SboSettingsEditor;
