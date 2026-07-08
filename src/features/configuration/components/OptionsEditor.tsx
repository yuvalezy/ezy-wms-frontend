import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";
import {AlertTriangle, CheckCircle2, History, Info, Save} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {ConfigSectionDetail} from "../data/types";
import {OPTION_FIELDS, OPTION_GROUPS, OptionGroup} from "../data/options-schema";
import OptionFieldRow from "./OptionFieldRow";
import DocumentUnitOverridesEditor from "./DocumentUnitOverridesEditor";
import SectionHistoryDialog from "./SectionHistoryDialog";
import PickPathSortPreview from "./PickPathSortPreview";

interface Props {
  onSaved: () => void;
}

const OptionsEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [detail, setDetail] = useState<ConfigSectionDetail | null>(null);
  const [values, setValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setErrors([]);
      const d = await configurationService.get("Options");
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

  /** Build the payload, pruning empty per-document overrides. */
  const serialize = () => {
    const out: Record<string, any> = {...values};
    const ov = out.DocumentUnitOverrides;
    if (ov && typeof ov === "object") {
      const pruned: Record<string, any> = {};
      Object.entries(ov).forEach(([k, v]: [string, any]) => {
        if (v && typeof v === "object" && Object.keys(v).length) {
          pruned[k] = v;
        }
      });
      if (Object.keys(pruned).length) {
        out.DocumentUnitOverrides = pruned;
      } else {
        delete out.DocumentUnitOverrides;
      }
    }
    return out;
  };

  const runValidate = async () => {
    setErrors([]);
    try {
      const result = await configurationService.validate("Options", serialize());
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
    if (!detail) {
      return;
    }
    setErrors([]);
    try {
      setSaving(true);
      await configurationService.update("Options", serialize(), detail.version);
      toast.success(t("configuration.saved"));
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
        {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-32 w-full"/>)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4"/>
        <AlertDescription>{t("configuration.options.liveReloadNote")}</AlertDescription>
      </Alert>

      {(() => {
        const visibleGroups = OPTION_GROUPS.filter((group: OptionGroup) =>
          OPTION_FIELDS.some((f) => f.group === group && (!f.visibleWhen || f.visibleWhen(values))),
        );
        const firstGroup = visibleGroups[0];

        return (
          <Accordion type="single" collapsible defaultValue={firstGroup} className="space-y-4">
            {visibleGroups.map((group: OptionGroup) => {
              const fields = OPTION_FIELDS.filter(
                (f) => f.group === group && (!f.visibleWhen || f.visibleWhen(values)),
              );
              return (
                <AccordionItem key={group} value={group} className="border-b-0">
                  <Card>
                    <CardHeader>
                      <AccordionTrigger className="hover:no-underline py-0">
                        <CardTitle className="text-base">{t(`configuration.options.groups.${group}`)}</CardTitle>
                      </AccordionTrigger>
                    </CardHeader>
                    <AccordionContent>
                      <CardContent className="divide-y py-0">
                        {fields.map((f) => (
                          <OptionFieldRow key={f.key} field={f} value={values[f.key]} onChange={(v) => setField(f.key, v)}/>
                        ))}
                        {group === "picking" && (
                          <PickPathSortPreview
                            sortKey={values.PickPathSortKey}
                            enabled={String(values.EnablePickPathRouting) === "true"}
                          />
                        )}
                      </CardContent>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              );
            })}

            <AccordionItem value="overrides" className="border-b-0">
              <Card>
                <CardHeader>
                  <AccordionTrigger className="hover:no-underline py-0">
                    <CardTitle className="text-base">{t("configuration.options.groups.overrides")}</CardTitle>
                  </AccordionTrigger>
                </CardHeader>
                <AccordionContent>
                  <CardContent>
                    <DocumentUnitOverridesEditor
                      value={values.DocumentUnitOverrides}
                      onChange={(next) => setField("DocumentUnitOverrides", next)}
                    />
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          </Accordion>
        );
      })()}

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4"/>
          <AlertDescription>
            <ul className="list-disc pl-4">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap justify-between gap-2">
        <Button type="button" variant="ghost" onClick={() => setShowHistory(true)}>
          <History className="h-4 w-4 mr-1"/>{t("configuration.history")}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={runValidate} disabled={saving || loading}>
            <CheckCircle2 className="h-4 w-4 mr-1"/>{t("configuration.validate")}
          </Button>
          <Button type="button" onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-1"/>{t("save")}
          </Button>
        </div>
      </div>

      <SectionHistoryDialog
        section="Options"
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

export default OptionsEditor;
