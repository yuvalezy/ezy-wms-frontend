import React, {useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {useNavigate, useParams} from "react-router";
import {AlertTriangle, CheckCircle2, FlaskConical, Save, X} from "lucide-react";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {Skeleton} from "@/components/ui/skeleton";
import {useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {reportDefinitionService} from "@/features/reports/data/report-service";
import {
  CreateReportDefinitionRequest,
  ReportColumnRequest,
  ReportSortDirection,
  ReportTotalCountMode,
  ReportValidationResult,
  ReportVariableRequest,
} from "@/features/reports/data/types";
import {columnFromDescriptor, mergeDiscoveredColumns, ReportColumnsEditor} from "./ReportColumnsEditor";
import {ReportVariablesEditor, validateReportVariables} from "./ReportVariablesEditor";
import {SqlEditor} from "./SqlEditor";

/**
 * Create/edit screen for a SQL-backed report definition (`/settings/reports/add`, `/settings/reports/:id`).
 *
 * The screen is built around one idea: **only SQL Server can tell you whether the SQL is valid and
 * what it returns.** So there is no client-side SQL parsing here — the Test button posts the
 * in-progress definition to `/reportDefinition/test`, which compiles both the page and count shapes
 * plus every lookup query inside an always-rollback transaction, and answers with the real error
 * text or the discovered columns. Columns can therefore only be *discovered*, never hand-typed:
 * a key must match the statement's output column name exactly or the row dictionary and the
 * `ORDER BY` both break.
 */

const SORT_NONE = "__none";

interface ReportDefinitionFormData {
  name: string;
  slug: string;
  description: string;
  sql: string;
  countSql: string;
  enabled: boolean;
  recompile: boolean;
  totalCountMode: ReportTotalCountMode;
  defaultPageSize: number;
  defaultSortColumnKey: string;
  defaultSortDirection: ReportSortDirection;
  timeoutSeconds: number;
  columns: ReportColumnRequest[];
  variables: ReportVariableRequest[];
}

const DEFAULT_SQL = `SELECT T0."DocNum", T0."DocDate", T1."CardName"
FROM OINV T0 INNER JOIN OCRD T1 ON T0."CardCode" = T1."CardCode"
WHERE (@FromDate IS NULL OR T0."DocDate" >= @FromDate)
ORDER BY {{orderBy}}, T0."DocEntry"
{{paging}}`;

const defaultFormValues: ReportDefinitionFormData = {
  name: "",
  slug: "",
  description: "",
  sql: DEFAULT_SQL,
  countSql: "",
  enabled: true,
  recompile: false,
  totalCountMode: ReportTotalCountMode.None,
  defaultPageSize: 50,
  defaultSortColumnKey: "",
  defaultSortDirection: ReportSortDirection.Asc,
  timeoutSeconds: 60,
  columns: [],
  variables: [],
};

/** Lowercase, hyphenated, ASCII — a slug travels in the URL of every run request. */
const slugify = (value: string): string =>
  value
    .normalize("NFD")
    // Strip the combining marks NFD just split off, so "Año" slugs as "ano", not "an-o".
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

const ReportDefinitionForm: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();
  const navigate = useNavigate();
  const {id} = useParams<{ id: string }>();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ReportValidationResult | null>(null);

  const form = useForm<ReportDefinitionFormData>({defaultValues: defaultFormValues});

  const columns = form.watch("columns");
  const variables = form.watch("variables");
  const totalCountMode = form.watch("totalCountMode");

  /** Populated by the last Test only — see `ReportColumnsEditor.unsortableKeys`. */
  const unsortableKeys = useMemo(
    () => new Set((testResult?.columns ?? []).filter((column) => !column.sortable).map((column) => column.key)),
    [testResult],
  );

  const variableErrors = useMemo(() => validateReportVariables(variables), [variables]);

  const sortableColumns = useMemo(() => columns.filter((column) => column.sortable), [columns]);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }
      try {
        setIsLoading(true);
        const detail = await reportDefinitionService.get(id);
        form.reset({
          name: detail.name,
          slug: detail.slug,
          description: detail.description ?? "",
          sql: detail.sql ?? "",
          countSql: detail.countSql ?? "",
          enabled: detail.enabled,
          recompile: detail.recompile,
          totalCountMode: detail.totalCountMode,
          defaultPageSize: detail.defaultPageSize,
          defaultSortColumnKey: detail.defaultSortColumnKey ?? "",
          defaultSortDirection: detail.defaultSortDirection,
          timeoutSeconds: detail.timeoutSeconds,
          columns: [...detail.columns]
            .sort((a, b) => a.order - b.order)
            .map((column, index) => columnFromDescriptor(column, index)),
          variables: [...detail.variables]
            .sort((a, b) => a.order - b.order)
            .map((variable, index) => ({
              name: variable.name,
              label: variable.label,
              type: variable.type,
              decimals: variable.decimals,
              required: variable.required,
              allowMultiple: variable.allowMultiple,
              defaultValue: variable.defaultValue ?? null,
              options: variable.options ?? [],
              lookupSql: variable.lookupSql ?? null,
              order: index,
            })),
        });
      } catch (error) {
        setError(`${t("reports.loadFailed")}: ${error}`);
        navigate("/settings/reports");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const buildRequest = (data: ReportDefinitionFormData): CreateReportDefinitionRequest => ({
    name: data.name.trim(),
    slug: data.slug.trim(),
    description: data.description.trim() || null,
    sql: data.sql,
    // Only meaningful under Exact — and an unused countSql would still be compiled at save time,
    // failing the save over SQL the report never runs.
    countSql: data.totalCountMode === ReportTotalCountMode.Exact && data.countSql.trim() ? data.countSql : null,
    enabled: data.enabled,
    recompile: data.recompile,
    totalCountMode: data.totalCountMode,
    defaultPageSize: data.defaultPageSize,
    defaultSortColumnKey: data.defaultSortColumnKey || null,
    defaultSortDirection: data.defaultSortDirection,
    timeoutSeconds: data.timeoutSeconds,
    columns: data.columns.map((column, index) => ({...column, label: column.label.trim() || column.key, order: index})),
    variables: data.variables.map((variable, index) => ({
      ...variable,
      name: variable.name.trim(),
      label: variable.label.trim(),
      order: index,
    })),
  });

  const handleTest = async () => {
    const data = form.getValues();
    try {
      setIsTesting(true);
      setTestResult(null);
      const result = await reportDefinitionService.test(buildRequest(data));
      setTestResult(result);
      // Populate whenever discovery produced columns, even if validation then failed. Gating this on
      // `valid` deadlocks any report whose error can only be fixed in the Columns editor — the editor is
      // empty until Test succeeds, and Test cannot succeed until the flags in it change. Discovery and
      // validation are separate answers: the errors stay on screen either way.
      if (result.columns.length > 0) {
        const merged = mergeDiscoveredColumns(data.columns, result.columns);
        form.setValue("columns", merged, {shouldDirty: true});
        // A default sort pointing at a column the SQL no longer returns (or that can no longer be
        // ordered by) would 400 every run — clear it rather than save a broken definition.
        const current = data.defaultSortColumnKey;
        if (current && !merged.some((column) => column.key === current && column.sortable)) {
          form.setValue("defaultSortColumnKey", "", {shouldDirty: true});
        }
      }
    } catch (error) {
      setError(`${t("reports.testFailed")}: ${error}`);
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: ReportDefinitionFormData) => {
    if (data.columns.length === 0) {
      setError(t("reports.errors.columnsRequired"));
      return;
    }
    if (variableErrors.size > 0) {
      setError(t("reports.errors.fixVariables"));
      return;
    }
    try {
      setIsSubmitting(true);
      const request = buildRequest(data);
      if (isEditing) {
        await reportDefinitionService.update({...request, id: id!});
      } else {
        await reportDefinitionService.create(request);
      }
      navigate("/settings/reports");
    } catch (error) {
      setError(`${t(isEditing ? "reports.updateFailed" : "reports.createFailed")}: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateBack = () => navigate("/settings/reports");

  const breadcrumbs = [
    {label: t("reports.definitions"), onClick: navigateBack},
    {label: isEditing ? t("reports.editReport") : t("reports.addReport")},
  ];

  if (isLoading) {
    return (
      <ContentTheme title={t("settings")} titleBreadcrumbs={breadcrumbs}>
        <div className="mx-auto max-w-5xl space-y-4 p-4" aria-label={t("loading")}>
          <Skeleton className="h-32 w-full"/>
          <Skeleton className="h-64 w-full"/>
          <Skeleton className="h-40 w-full"/>
        </div>
      </ContentTheme>
    );
  }

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={breadcrumbs}>
      <div className="mx-auto max-w-5xl p-2 md:p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">{t("reports.general")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{required: t("nameRequired"), maxLength: {value: 100, message: t("nameMaxLength")}}}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t("name")} *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            onBlur={(e) => {
                              field.onBlur();
                              // Convenience only, and only while creating: an existing slug is a
                              // live URL and must never be rewritten behind the author's back.
                              if (!isEditing && !form.getValues("slug")) {
                                form.setValue("slug", slugify(e.target.value), {shouldValidate: true});
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    rules={{
                      required: t("reports.errors.slugRequired"),
                      pattern: {value: /^[a-z0-9]+(-[a-z0-9]+)*$/, message: t("reports.errors.slugInvalid")},
                      maxLength: {value: 100, message: t("reports.errors.slugInvalid")},
                    }}
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>{t("reports.slug")} *</FormLabel>
                        <FormControl><Input {...field} className="font-mono"/></FormControl>
                        <p className="text-xs text-muted-foreground">{t("reports.slugHelp")}</p>
                        <FormMessage/>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[72px]"/></FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="report-enabled"
                      checked={form.watch("enabled")}
                      onCheckedChange={(checked) => form.setValue("enabled", checked, {shouldDirty: true})}
                    />
                    <Label htmlFor="report-enabled">{t("reports.enabled")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="report-recompile"
                      checked={form.watch("recompile")}
                      onCheckedChange={(checked) => form.setValue("recompile", checked, {shouldDirty: true})}
                    />
                    <Label htmlFor="report-recompile" title={t("reports.recompileHelp")}>{t("reports.recompile")}</Label>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{t("reports.recompileHelp")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t("reports.sql")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Alert variant="information">
                  <AlertDescription>
                    {/*
                      The tokens are written as JS string literals, never as translated text:
                      i18next would interpolate a literal {{orderBy}} inside a translation value and
                      substitute it away to an empty string, leaving help that documents nothing.
                    */}
                    <div className="space-y-1">
                      <p>{t("reports.sqlHelp")}</p>
                      <ul className="list-disc space-y-1 pl-4">
                        <li>
                          <code className="font-mono font-semibold">{"{{orderBy}}"}</code> — {t("reports.sqlHelpOrderBy")}
                        </li>
                        <li>
                          <code className="font-mono font-semibold">{"{{paging}}"}</code> — {t("reports.sqlHelpPaging")}
                        </li>
                      </ul>
                      <p>{t("reports.sqlHelpTiebreaker")}</p>
                      <p>{t("reports.sqlHelpVariables")}</p>
                    </div>
                  </AlertDescription>
                </Alert>
                <FormField
                  control={form.control}
                  name="sql"
                  rules={{required: t("reports.errors.sqlRequired")}}
                  render={({field}) => (
                    <FormItem>
                      <FormControl>
                        <SqlEditor value={field.value} onChange={field.onChange} minHeight="16rem" aria-label={t("reports.sql")}/>
                      </FormControl>
                      <FormMessage/>
                    </FormItem>
                  )}
                />

                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={handleTest} disabled={isTesting || isSubmitting}>
                    <FlaskConical className="mr-2 h-4 w-4"/>
                    {isTesting ? t("reports.testing") : t("reports.test")}
                  </Button>
                </div>

                {testResult && (
                  <div className="space-y-3">
                    {testResult.valid ? (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4 text-green-600"/>
                        <AlertTitle>{t("reports.testPassed")}</AlertTitle>
                        <AlertDescription>
                          {t("reports.testDiscovered", {columns: testResult.columns.length})}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>{t("reports.testFailed")}</AlertTitle>
                        <AlertDescription>
                          {/* SQL Server's own message, verbatim — the whole point of the Test button. */}
                          <ul className="list-disc space-y-1 pl-4 font-mono text-xs">
                            {testResult.errors.map((message, index) => <li key={index}>{message}</li>)}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                    {testResult.warnings.length > 0 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4 text-amber-600"/>
                        <AlertTitle>{t("reports.testWarnings")}</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc space-y-1 pl-4 text-xs">
                            {testResult.warnings.map((message, index) => <li key={index}>{message}</li>)}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t("reports.paging")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label htmlFor="report-page-size">{t("reports.defaultPageSize")}</Label>
                    <Input
                      id="report-page-size"
                      type="number"
                      min={1}
                      max={200}
                      {...form.register("defaultPageSize", {valueAsNumber: true, min: 1, max: 200})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="report-timeout">{t("reports.timeoutSeconds")}</Label>
                    <Input
                      id="report-timeout"
                      type="number"
                      min={5}
                      max={300}
                      {...form.register("timeoutSeconds", {valueAsNumber: true, min: 5, max: 300})}
                    />
                  </div>
                  <div>
                    <Label>{t("reports.defaultSortColumn")}</Label>
                    <Select
                      value={form.watch("defaultSortColumnKey") || SORT_NONE}
                      onValueChange={(value) =>
                        form.setValue("defaultSortColumnKey", value === SORT_NONE ? "" : value, {shouldDirty: true})}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SORT_NONE}>{t("reports.noDefaultSort")}</SelectItem>
                        {sortableColumns.map((column) => (
                          <SelectItem key={column.key} value={column.key}>{column.label || column.key}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t("reports.defaultSortDirection")}</Label>
                    <Select
                      value={form.watch("defaultSortDirection")}
                      onValueChange={(value) =>
                        form.setValue("defaultSortDirection", value as ReportSortDirection, {shouldDirty: true})}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ReportSortDirection.Asc}>{t("reports.sortAsc")}</SelectItem>
                        <SelectItem value={ReportSortDirection.Desc}>{t("reports.sortDesc")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label>{t("reports.totalCountMode")}</Label>
                    <Select
                      value={totalCountMode}
                      onValueChange={(value) => {
                        const mode = value as ReportTotalCountMode;
                        form.setValue("totalCountMode", mode, {shouldDirty: true});
                        if (mode === ReportTotalCountMode.None) {
                          form.setValue("countSql", "", {shouldDirty: true});
                        }
                      }}
                    >
                      <SelectTrigger><SelectValue/></SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ReportTotalCountMode.None}>{t("reports.totalCountModeNone")}</SelectItem>
                        <SelectItem value={ReportTotalCountMode.Exact}>{t("reports.totalCountModeExact")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="mt-1 text-xs text-muted-foreground">{t("reports.totalCountModeHelp")}</p>
                  </div>
                </div>

                {totalCountMode === ReportTotalCountMode.Exact && (
                  <div className="space-y-2">
                    <Label>{t("reports.countSql")}</Label>
                    <p className="text-xs text-muted-foreground">{t("reports.countSqlHelp")}</p>
                    <SqlEditor
                      value={form.watch("countSql")}
                      onChange={(value) => form.setValue("countSql", value, {shouldDirty: true})}
                      minHeight="8rem"
                      aria-label={t("reports.countSql")}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t("reports.columns")}</CardTitle></CardHeader>
              <CardContent>
                <ReportColumnsEditor
                  columns={columns}
                  unsortableKeys={unsortableKeys}
                  disabled={isSubmitting}
                  onChange={(next) => form.setValue("columns", next, {shouldDirty: true})}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">{t("reports.variables")}</CardTitle></CardHeader>
              <CardContent>
                <ReportVariablesEditor
                  variables={variables}
                  disabled={isSubmitting}
                  onChange={(next) => form.setValue("variables", next, {shouldDirty: true})}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4 pb-6">
              <Button type="submit" disabled={isSubmitting || isTesting} className="flex-1">
                <Save className="mr-2 h-4 w-4"/>
                {isSubmitting ? t("saving") : t("save")}
              </Button>
              <Button type="button" variant="outline" onClick={navigateBack} disabled={isSubmitting} className="flex-1">
                <X className="mr-2 h-4 w-4"/>
                {t("cancel")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ContentTheme>
  );
};

export default ReportDefinitionForm;
