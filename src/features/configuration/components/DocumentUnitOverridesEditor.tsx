import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
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
import {Plus, Trash2} from "lucide-react";
import {INHERIT, OBJECT_TYPE, UNIT_TYPE} from "../data/options-schema";

interface Props {
  /** The DocumentUnitOverrides object (string-valued leaves), or undefined. */
  value: Record<string, any> | undefined;
  onChange: (next: Record<string, any> | undefined) => void;
}

const TRI = [INHERIT, "true", "false"];

const DocumentUnitOverridesEditor: React.FC<Props> = ({value, onChange}) => {
  const {t} = useTranslation();
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const overrides = value ?? {};
  const entries = Object.entries(overrides);
  const usedTypes = entries.map(([k]) => k);
  const availableTypes = OBJECT_TYPE.filter((tp) => !usedTypes.includes(tp));

  const emit = (next: Record<string, any>) =>
    onChange(Object.keys(next).length ? next : undefined);

  const addOverride = () => {
    if (!availableTypes.length) {
      return;
    }
    emit({...overrides, [availableTypes[0]]: {}});
  };

  const removeOverride = (type: string) => {
    const next = {...overrides};
    delete next[type];
    emit(next);
  };

  const changeType = (oldType: string, newType: string) => {
    if (oldType === newType) {
      return;
    }
    const next: Record<string, any> = {};
    Object.entries(overrides).forEach(([k, v]) => {
      next[k === oldType ? newType : k] = v;
    });
    emit(next);
  };

  const setProp = (type: string, prop: string, val: any) => {
    const settings = {...(overrides[type] ?? {})};
    if (val === undefined) {
      delete settings[prop];
    } else {
      settings[prop] = val;
    }
    emit({...overrides, [type]: settings});
  };

  const objLabel = (v: string) => t(`configuration.options.enums.ObjectType.${v}`);
  const unitLabel = (v: string) => t(`configuration.options.enums.UnitType.${v}`);

  const unitSelect = (type: string, prop: string) => {
    const v = overrides[type]?.[prop] ?? INHERIT;
    return (
      <Select value={v} onValueChange={(nv) => setProp(type, prop, nv === INHERIT ? undefined : nv)}>
        <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
        <SelectContent>
          <SelectItem value={INHERIT}>{t("configuration.options.inherit")}</SelectItem>
          {UNIT_TYPE.map((u) => <SelectItem key={u} value={u}>{unitLabel(u)}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  };

  const triSelect = (type: string, prop: string) => {
    const v = overrides[type]?.[prop] ?? INHERIT;
    const triLabel = (x: string) =>
      x === INHERIT
        ? t("configuration.options.inherit")
        : x === "true"
          ? t("configuration.options.yes")
          : t("configuration.options.no");
    return (
      <Select value={v} onValueChange={(nv) => setProp(type, prop, nv === INHERIT ? undefined : nv)}>
        <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
        <SelectContent>
          {TRI.map((x) => <SelectItem key={x} value={x}>{triLabel(x)}</SelectItem>)}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("configuration.options.overridesHint")}</p>

      {entries.length === 0 && (
        <p className="text-sm text-muted-foreground">{t("configuration.options.noOverrides")}</p>
      )}

      {entries.map(([type]) => (
        <div key={type} className="rounded-md border p-3 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="w-56">
              <Select value={type} onValueChange={(nv) => changeType(type, nv)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value={type}>{objLabel(type)}</SelectItem>
                  {availableTypes.map((tp) => <SelectItem key={tp} value={tp}>{objLabel(tp)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setPendingDelete(type)}>
              <Trash2 className="h-4 w-4 text-destructive"/>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">{t("configuration.options.overrideFields.DefaultUnitType")}</Label>
              {unitSelect(type, "DefaultUnitType")}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("configuration.options.overrideFields.MaxUnitLevel")}</Label>
              {unitSelect(type, "MaxUnitLevel")}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("configuration.options.overrideFields.EnableUnitSelection")}</Label>
              {triSelect(type, "EnableUnitSelection")}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{t("configuration.options.overrideFields.EnableUseBaseUn")}</Label>
              {triSelect(type, "EnableUseBaseUn")}
            </div>
          </div>
        </div>
      ))}

      <Button size="sm" variant="outline" onClick={addOverride} disabled={!availableTypes.length}>
        <Plus className="h-4 w-4 mr-1"/>{t("configuration.options.addOverride")}
      </Button>

      <AlertDialog open={pendingDelete !== null} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("configuration.options.removeOverrideConfirm", {
                type: pendingDelete ? objLabel(pendingDelete) : "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  removeOverride(pendingDelete);
                }
                setPendingDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentUnitOverridesEditor;
