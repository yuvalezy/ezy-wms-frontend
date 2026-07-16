import React from "react";
import {useTranslation} from "react-i18next";
import {ArrowDown, ArrowUp, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ReportLookupOption, ReportVariableRequest, ReportVariableType} from "@/features/reports/data/types";
import {SqlEditor} from "./SqlEditor";

/**
 * Filter/sort variable declarations for a report definition.
 *
 * Variable **values** are the only untrusted input in the whole reporting feature — they come from
 * ordinary users and are bound as typed `SqlParameter`s, never interpolated. Variable **names** are
 * part of the SQL's shape, so they are constrained here to exactly what the backend enforces
 * ({@link VARIABLE_NAME_PATTERN} + the `__` reserved-prefix rejection + case-insensitive
 * uniqueness). This editor's checks are a courtesy that fails fast in the UI; the backend re-checks
 * every one of them and is the actual authority.
 */

/**
 * Mirrors the backend rule. `{0,59}` (not `{0,63}`) leaves room for `DateRange`'s `From`/`To`
 * suffix, which turns one declaration into the two parameters `@XFrom`/`@XTo`.
 */
export const VARIABLE_NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]{0,59}$/;

/**
 * `__` is reserved for the engine's own paging parameters (`@__offset`, `@__limit`). The name regex
 * alone happily accepts `__limit`, and a variable called that would silently hijack paging — so the
 * prefix is rejected explicitly rather than left to the pattern.
 */
const RESERVED_PREFIX = "__";

const NO_DEFAULT = "__noDefault";

const TYPE_ORDER: ReportVariableType[] = [
  ReportVariableType.Text,
  ReportVariableType.Integer,
  ReportVariableType.Decimal,
  ReportVariableType.Date,
  ReportVariableType.DateTime,
  ReportVariableType.DateRange,
  ReportVariableType.Boolean,
  ReportVariableType.YesNo,
  ReportVariableType.SelectList,
  ReportVariableType.SqlLookup,
];

/** Only these two produce a list of choices, so only they can meaningfully be multi-select. */
const isChoiceType = (type: ReportVariableType): boolean =>
  type === ReportVariableType.SelectList || type === ReportVariableType.SqlLookup;

/**
 * Validates the declarations client-side, returning translation keys per variable index.
 * Pure and exported so the form can block Save without duplicating the rules.
 */
export function validateReportVariables(variables: ReportVariableRequest[]): Map<number, string> {
  const errors = new Map<number, string>();
  const seen = new Map<string, number>();

  variables.forEach((variable, index) => {
    const name = variable.name.trim();
    if (name.length === 0) {
      errors.set(index, "reports.errors.variableNameRequired");
      return;
    }
    if (name.toLowerCase().startsWith(RESERVED_PREFIX)) {
      errors.set(index, "reports.errors.variableNameReserved");
      return;
    }
    if (!VARIABLE_NAME_PATTERN.test(name)) {
      errors.set(index, "reports.errors.variableNameInvalid");
      return;
    }
    // Case-insensitive: SqlCommand.Parameters lookup is case-insensitive, so @foo and @Foo collide.
    const key = name.toLowerCase();
    if (seen.has(key)) {
      errors.set(index, "reports.errors.variableNameDuplicate");
      return;
    }
    seen.set(key, index);

    if (variable.label.trim().length === 0) {
      errors.set(index, "reports.errors.variableLabelRequired");
      return;
    }
    if (variable.type === ReportVariableType.SelectList && variable.options.length === 0) {
      errors.set(index, "reports.errors.variableOptionsRequired");
      return;
    }
    if (variable.type === ReportVariableType.SqlLookup && !variable.lookupSql?.trim()) {
      errors.set(index, "reports.errors.lookupSqlRequired");
    }
  });

  return errors;
}

export const createReportVariable = (order: number): ReportVariableRequest => ({
  name: "",
  label: "",
  type: ReportVariableType.Text,
  decimals: 2,
  required: false,
  allowMultiple: false,
  defaultValue: null,
  options: [],
  lookupSql: null,
  order,
});

export interface ReportVariablesEditorProps {
  variables: ReportVariableRequest[];
  onChange: (variables: ReportVariableRequest[]) => void;
  disabled?: boolean;
}

export function ReportVariablesEditor({variables, onChange, disabled = false}: ReportVariablesEditorProps) {
  const {t} = useTranslation();
  const errors = validateReportVariables(variables);

  const patch = (index: number, changes: Partial<ReportVariableRequest>) => {
    onChange(variables.map((variable, i) => (i === index ? {...variable, ...changes} : variable)));
  };

  const renumber = (next: ReportVariableRequest[]) => next.map((variable, i) => ({...variable, order: i}));

  const add = () => onChange(renumber([...variables, createReportVariable(variables.length)]));

  const remove = (index: number) => onChange(renumber(variables.filter((_, i) => i !== index)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= variables.length) {
      return;
    }
    const next = [...variables];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(renumber(next));
  };

  /**
   * Changing the type drops the settings that no longer apply. Leaving a stale `lookupSql` on a
   * variable the author switched to `Text` would keep it in the payload, and the backend validates
   * every lookup query it is given — the report would fail to save over SQL that is no longer used.
   */
  const changeType = (index: number, type: ReportVariableType) => {
    patch(index, {
      type,
      options: type === ReportVariableType.SelectList ? variables[index].options : [],
      lookupSql: type === ReportVariableType.SqlLookup ? variables[index].lookupSql : null,
      allowMultiple: isChoiceType(type) ? variables[index].allowMultiple : false,
      defaultValue: null,
    });
  };

  const patchOptions = (index: number, options: ReportLookupOption[]) => patch(index, {options});

  return (
    <div className="space-y-3">
      {variables.map((variable, index) => {
        const errorKey = errors.get(index);
        return (
          <Card key={index}>
            <CardContent className="space-y-4 p-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1 basis-48">
                  <Label className="text-xs text-muted-foreground" htmlFor={`variable-name-${index}`}>
                    {t("reports.variableName")} *
                  </Label>
                  <Input
                    id={`variable-name-${index}`}
                    value={variable.name}
                    disabled={disabled}
                    className="font-mono"
                    placeholder="FromDate"
                    onChange={(e) => patch(index, {name: e.target.value})}
                  />
                </div>

                <div className="min-w-0 flex-1 basis-48">
                  <Label className="text-xs text-muted-foreground" htmlFor={`variable-label-${index}`}>
                    {t("reports.variableLabel")} *
                  </Label>
                  <Input
                    id={`variable-label-${index}`}
                    value={variable.label}
                    disabled={disabled}
                    onChange={(e) => patch(index, {label: e.target.value})}
                  />
                </div>

                <div className="basis-44">
                  <Label className="text-xs text-muted-foreground">{t("reports.variableType")}</Label>
                  <Select
                    value={variable.type}
                    disabled={disabled}
                    onValueChange={(value) => changeType(index, value as ReportVariableType)}
                  >
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {TYPE_ORDER.map((type) => (
                        <SelectItem key={type} value={type}>{t(`reports.variableTypes.${type}`)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {variable.type === ReportVariableType.Decimal && (
                  <div className="basis-24">
                    <Label className="text-xs text-muted-foreground" htmlFor={`variable-decimals-${index}`}>
                      {t("reports.columnDecimals")}
                    </Label>
                    <Input
                      id={`variable-decimals-${index}`}
                      type="number"
                      min={0}
                      max={10}
                      value={variable.decimals}
                      disabled={disabled}
                      onChange={(e) => {
                        const parsed = Number.parseInt(e.target.value, 10);
                        patch(index, {decimals: Number.isFinite(parsed) ? Math.min(10, Math.max(0, parsed)) : 0});
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center gap-2 pb-2">
                  <Switch
                    id={`variable-required-${index}`}
                    checked={variable.required}
                    disabled={disabled}
                    onCheckedChange={(checked) => patch(index, {required: checked})}
                  />
                  <Label htmlFor={`variable-required-${index}`} className="text-xs">{t("reports.variableRequired")}</Label>
                </div>

                {isChoiceType(variable.type) && (
                  <div className="flex items-center gap-2 pb-2">
                    <Switch
                      id={`variable-multiple-${index}`}
                      checked={variable.allowMultiple}
                      disabled={disabled}
                      onCheckedChange={(checked) => patch(index, {allowMultiple: checked, defaultValue: null})}
                    />
                    <Label htmlFor={`variable-multiple-${index}`} className="text-xs">
                      {t("reports.variableAllowMultiple")}
                    </Label>
                  </div>
                )}

                <div className="flex gap-1 pb-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t("reports.moveUp")}
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp className="h-4 w-4"/>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label={t("reports.moveDown")}
                    disabled={disabled || index === variables.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown className="h-4 w-4"/>
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label={t("reports.removeVariable")}
                    disabled={disabled}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4"/>
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-0 flex-1 basis-64">
                  <Label className="text-xs text-muted-foreground" htmlFor={`variable-default-${index}`}>
                    {t("reports.variableDefaultValue")}
                  </Label>
                  {variable.type === ReportVariableType.Boolean || variable.type === ReportVariableType.YesNo ? (
                    <Select
                      value={variable.defaultValue?.trim() ? variable.defaultValue : NO_DEFAULT}
                      disabled={disabled}
                      onValueChange={(value) => patch(index, {defaultValue: value === NO_DEFAULT ? null : value})}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NO_DEFAULT}>{t("reports.noDefault")}</SelectItem>
                        {/*
                          "true"/"false" for `YesNo` as well as `Boolean`: a stored DefaultValue is
                          parsed by the same strict boolean path at run time (BindVariable coalesces
                          submitted ?? DefaultValue). A "Y" default is worse than a bad run-time
                          value — save-time validation binds DBNull and never sees it, so the report
                          saves clean and then can never be run at all, even with the filter cleared.
                        */}
                        <SelectItem value="true">{t("yes")}</SelectItem>
                        <SelectItem value="false">{t("no")}</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={`variable-default-${index}`}
                      value={variable.defaultValue ?? ""}
                      disabled={disabled || variable.type === ReportVariableType.DateRange}
                      placeholder={t(`reports.defaultValuePlaceholders.${variable.type}`, {defaultValue: ""})}
                      // Empty box means "no default" — an empty string would bind as a real value.
                      onChange={(e) => patch(index, {defaultValue: e.target.value.length > 0 ? e.target.value : null})}
                    />
                  )}
                </div>
              </div>

              {variable.type === ReportVariableType.SelectList && (
                <div className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">{t("reports.variableOptions")} *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => patchOptions(index, [...variable.options, {value: "", label: ""}])}
                    >
                      <Plus className="mr-1 h-4 w-4"/>
                      {t("reports.addOption")}
                    </Button>
                  </div>
                  {variable.options.length === 0 ? (
                    <p className="py-2 text-xs text-muted-foreground">{t("reports.noOptions")}</p>
                  ) : (
                    variable.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          value={option.value}
                          disabled={disabled}
                          placeholder={t("reports.optionValue")}
                          className="font-mono"
                          onChange={(e) => patchOptions(
                            index,
                            variable.options.map((o, i) => (i === optionIndex ? {...o, value: e.target.value} : o)),
                          )}
                        />
                        <Input
                          value={option.label}
                          disabled={disabled}
                          placeholder={t("reports.optionLabel")}
                          onChange={(e) => patchOptions(
                            index,
                            variable.options.map((o, i) => (i === optionIndex ? {...o, label: e.target.value} : o)),
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("reports.removeOption")}
                          disabled={disabled}
                          onClick={() => patchOptions(index, variable.options.filter((_, i) => i !== optionIndex))}
                        >
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {variable.type === ReportVariableType.SqlLookup && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">{t("reports.lookupSql")} *</Label>
                  <p className="text-xs text-muted-foreground">{t("reports.lookupSqlHelp")}</p>
                  <SqlEditor
                    value={variable.lookupSql ?? ""}
                    readOnly={disabled}
                    minHeight="8rem"
                    aria-label={t("reports.lookupSql")}
                    onChange={(value) => patch(index, {lookupSql: value.length > 0 ? value : null})}
                  />
                </div>
              )}

              {errorKey && <p className="text-sm text-destructive">{t(errorKey)}</p>}
            </CardContent>
          </Card>
        );
      })}

      <Button type="button" variant="outline" disabled={disabled} onClick={add}>
        <Plus className="mr-2 h-4 w-4"/>
        {t("reports.addVariable")}
      </Button>
    </div>
  );
}

export default ReportVariablesEditor;
