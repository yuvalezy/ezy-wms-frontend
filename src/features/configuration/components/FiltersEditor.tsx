import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "sonner";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Skeleton} from "@/components/ui/skeleton";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {AlertTriangle, CheckCircle2, History, Loader2, Save, XCircle} from "lucide-react";
import {configurationService} from "../data/configuration-service";
import {ConfigSectionDetail} from "../data/types";
import {FiltersValidationResponse, filtersService} from "../data/filters-service";
import SectionHistoryDialog from "./SectionHistoryDialog";

interface Props {
  onSaved: () => void;
}

const SECTION = "Filters";

const FiltersEditor: React.FC<Props> = ({onSaved}) => {
  const {t} = useTranslation();
  const [detail, setDetail] = useState<ConfigSectionDetail | null>(null);
  const [vendors, setVendors] = useState("");
  const [pickPackQuery, setPickPackQuery] = useState("");
  const [pickPackGroupBy, setPickPackGroupBy] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [validation, setValidation] = useState<FiltersValidationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setErrors([]);
      setValidation(null);
      const d = await configurationService.get(SECTION);
      setDetail(d);
      const json = d.json ?? {};
      setVendors(json.Vendors ?? "");
      setPickPackQuery(json.PickPackOnly?.Query ?? "");
      setPickPackGroupBy(json.PickPackOnly?.GroupBy ?? "");
    } catch (error) {
      toast.error(`${t("configuration.loadFailed")}: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  /** Build the section payload (string-valued PascalCase), pruning empty filters. */
  const serialize = () => {
    const out: Record<string, any> = {};
    const v = vendors.trim();
    if (v) {
      out.Vendors = v;
    }
    const q = pickPackQuery.trim();
    if (q) {
      out.PickPackOnly = {Query: q, GroupBy: pickPackGroupBy.trim()};
    }
    return out;
  };

  const groupByMissing = pickPackQuery.trim().length > 0 && pickPackGroupBy.trim().length === 0;

  const runValidate = async () => {
    setErrors([]);
    setValidation(null);
    try {
      setValidating(true);
      const result = await filtersService.validateSql(serialize());
      setValidation(result);
      const allValid =
        (!result.vendors || result.vendors.valid) && (!result.pickPackOnly || result.pickPackOnly.valid);
      if (!result.vendors && !result.pickPackOnly) {
        toast.info(t("configuration.filters.nothingToValidate"));
      } else if (allValid) {
        toast.success(t("configuration.filters.validateOk"));
      } else {
        toast.error(t("configuration.filters.validateFailed"));
      }
    } catch (error: any) {
      const data = error?.response?.data;
      setErrors([data?.error_description ?? `${error}`]);
    } finally {
      setValidating(false);
    }
  };

  const save = async () => {
    if (!detail) {
      return;
    }
    setErrors([]);
    if (groupByMissing) {
      setErrors([t("configuration.filters.groupByRequired")]);
      return;
    }
    try {
      setSaving(true);
      await configurationService.update(SECTION, serialize(), detail.version);
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
        {Array.from({length: 2}).map((_, i) => <Skeleton key={i} className="h-40 w-full"/>)}
      </div>
    );
  }

  const renderFilterResult = (label: string, result?: FilterValidationResultLike | null) => {
    if (!result) {
      return null;
    }
    return (
      <Alert variant={result.valid ? "default" : "destructive"}>
        {result.valid ? <CheckCircle2 className="h-4 w-4"/> : <XCircle className="h-4 w-4"/>}
        <AlertDescription>
          <span className="font-medium">{label}:</span>{" "}
          {result.valid ? t("configuration.filters.filterValid") : result.message}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("configuration.filters.vendorsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label htmlFor="filters-vendors">{t("configuration.filters.vendorsLabel")}</Label>
          <Textarea
            id="filters-vendors"
            className="font-mono"
            rows={2}
            spellCheck={false}
            value={vendors}
            onChange={(e) => setVendors(e.target.value)}
            placeholder={`"QryGroup1" = 'Y'`}
          />
          <p className="text-xs text-muted-foreground">{t("configuration.filters.vendorsHelp")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("configuration.filters.pickPackTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filters-pickpack-query">{t("configuration.filters.pickPackQueryLabel")}</Label>
            <Textarea
              id="filters-pickpack-query"
              className="font-mono"
              rows={2}
              spellCheck={false}
              value={pickPackQuery}
              onChange={(e) => setPickPackQuery(e.target.value)}
              placeholder={`OCRD."QryGroup4" = 'Y'`}
            />
            <p className="text-xs text-muted-foreground">{t("configuration.filters.pickPackQueryHelp")}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="filters-pickpack-groupby">
              {t("configuration.filters.pickPackGroupByLabel")}
              {pickPackQuery.trim().length > 0 && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id="filters-pickpack-groupby"
              className="font-mono"
              rows={2}
              spellCheck={false}
              value={pickPackGroupBy}
              onChange={(e) => setPickPackGroupBy(e.target.value)}
              placeholder={`OCRD."QryGroup4"`}
              aria-invalid={groupByMissing}
            />
            <p className="text-xs text-muted-foreground">{t("configuration.filters.pickPackGroupByHelp")}</p>
            {groupByMissing && (
              <p className="text-xs text-destructive">{t("configuration.filters.groupByRequired")}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {validation && (
        <div className="space-y-2">
          {renderFilterResult(t("configuration.filters.vendorsTitle"), validation.vendors)}
          {renderFilterResult(t("configuration.filters.pickPackTitle"), validation.pickPackOnly)}
        </div>
      )}

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
          <Button type="button" variant="outline" onClick={runValidate} disabled={validating || saving || loading}>
            {validating ? <Loader2 className="h-4 w-4 mr-1 animate-spin"/> : <CheckCircle2 className="h-4 w-4 mr-1"/>}
            {t("configuration.filters.validate")}
          </Button>
          <Button type="button" onClick={save} disabled={saving || loading}>
            <Save className="h-4 w-4 mr-1"/>{t("save")}
          </Button>
        </div>
      </div>

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

interface FilterValidationResultLike {
  valid: boolean;
  message: string;
}

export default FiltersEditor;
