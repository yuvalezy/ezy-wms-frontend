import React from "react";
import {useTranslation} from "react-i18next";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {INHERIT, OptionField} from "../data/options-schema";

interface Props {
  field: OptionField;
  /** Current string value, or undefined when the key is absent. */
  value: any;
  /** Pass undefined to clear (delete) the key. */
  onChange: (next: any) => void;
}

const OptionFieldRow: React.FC<Props> = ({field, value, onChange}) => {
  const {t} = useTranslation();
  const label = t(`configuration.options.fields.${field.key}.label`);
  const desc = t(`configuration.options.fields.${field.key}.desc`);
  const enumLabel = (val: string) =>
    field.enumLabel ? t(`configuration.options.enums.${field.enumLabel}.${val}`) : val;

  const control = () => {
    switch (field.kind) {
      case "bool":
        return (
          <Switch
            checked={String(value) === "true"}
            onCheckedChange={(c) => onChange(c ? "true" : "false")}
          />
        );
      case "enum":
        return (
          <Select value={value ?? field.enumValues![0]} onValueChange={(v) => onChange(v)}>
            <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>
              {field.enumValues!.map((v) => (
                <SelectItem key={v} value={v}>{enumLabel(v)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "enumNullable":
        return (
          <Select value={value ?? INHERIT} onValueChange={(v) => onChange(v === INHERIT ? undefined : v)}>
            <SelectTrigger className="w-full"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value={INHERIT}>{t("configuration.options.inherit")}</SelectItem>
              {field.enumValues!.map((v) => (
                <SelectItem key={v} value={v}>{enumLabel(v)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "int":
        return (
          <Input
            type="number"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
          />
        );
      case "string":
      default:
        return (
          <Input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value === "" ? undefined : e.target.value)}
          />
        );
    }
  };

  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="w-44 flex justify-end shrink-0">{control()}</div>
    </div>
  );
};

export default OptionFieldRow;
