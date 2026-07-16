import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Checkbox} from "@/components/ui/checkbox";
import {Card} from "@/components/ui/card";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Badge} from "@/components/ui/badge";
import {Save, X} from "lucide-react";
import {useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";
import {AuthorizationGroupFormData, RoleType} from "../data/authorization-group";
import {authorizationGroupService} from "../data/authorization-group-service";
import {useNavigate, useParams} from "react-router";
import {useAuthorizationGroupRoles} from "@/features/authorization-groups/hooks/useAuthorizationGroupRoles";
import {AuthorizationGroupFormSkeleton} from "./AuthorizationGroupFormSkeleton";
import {reportDefinitionService} from "@/features/reports/data/report-service";
import {ReportDefinitionSummary} from "@/features/reports/data/types";

const AuthorizationGroupForm = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGroup, setIsLoadingGroup] = useState(false);
  const navigate = useNavigate();
  const {id} = useParams<{ id: string }>();

  const isEditing = !!id;

  const [reports, setReports] = useState<ReportDefinitionSummary[]>([]);

  const form = useForm<AuthorizationGroupFormData>({
    defaultValues: {
      name: "",
      description: "",
      authorizations: [],
      reportIds: [],
    },
  });

  // Load group data when editing
  useEffect(() => {
    const loadGroup = async () => {
      if (!isEditing) return;

      try {
        setIsLoadingGroup(true);
        const groupData = await authorizationGroupService.getById(id);

        // Update form with loaded data
        form.reset({
          name: groupData.name,
          description: groupData.description,
          authorizations: groupData.authorizations,
          reportIds: groupData.reportIds ?? [],
        });
      } catch (error) {
        setError(`Failed to load authorization group: ${error}`);
        navigate('/settings/authorizationGroups');
      } finally {
        setIsLoadingGroup(false);
      }
    };

    loadGroup();
  }, [id, isEditing, form, navigate, setError]);

  /**
   * Every definition, including disabled ones — a grant on a temporarily-disabled report must stay
   * visible and editable, or saving the group would silently revoke it.
   *
   * A failure here is deliberately swallowed rather than surfaced: reports are an optional add-on,
   * and a broken reports endpoint must not block someone from editing a group's roles. The card
   * simply doesn't render, matching the "only when at least one report exists" rule.
   */
  useEffect(() => {
    const loadReports = async () => {
      try {
        setReports(await reportDefinitionService.list());
      } catch {
        setReports([]);
      }
    };

    loadReports();
  }, []);


  const {getRoleInfo} = useAuthorizationGroupRoles();
  const roleInfo = getRoleInfo();

  // Group roles by category for better organization
  const rolesByCategory = roleInfo.reduce((acc, role) => {
    if (!acc[role.category]) {
      acc[role.category] = [];
    }
    acc[role.category].push(role);
    return acc;
  }, {} as Record<string, typeof roleInfo>);

  const onSubmit = async (data: AuthorizationGroupFormData) => {
    try {
      setIsSubmitting(true);

      if (isEditing) {
        await authorizationGroupService.update(id, data);
      } else {
        await authorizationGroupService.create(data);
      }

      navigate('/settings/authorizationGroups');
    } catch (error) {
      setError(`Failed to ${isEditing ? 'update' : 'create'} authorization group: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateBack = () => {
    navigate('/settings/authorizationGroups');
  };

  const handleReportChange = (reportId: string, checked: boolean) => {
    const current = form.getValues("reportIds");
    form.setValue(
      "reportIds",
      checked ? [...current, reportId] : current.filter(id => id !== reportId),
      {shouldDirty: true},
    );
  };

  const handleRoleChange = (role: RoleType, checked: boolean) => {
    const currentAuthorizations = form.getValues("authorizations");
    if (checked) {
      form.setValue("authorizations", [...currentAuthorizations, role]);
    } else {
      form.setValue("authorizations", currentAuthorizations.filter(auth => auth !== role));
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'Operations':
        return 'default';
      case 'Supervision':
        return 'secondary';
      case 'Administration':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleSelectAllInCategory = (category: string, checked: boolean) => {
    const categoryRoles = rolesByCategory[category];
    const currentAuthorizations = form.getValues("authorizations");

    if (checked) {
      // Add all roles from this category
      const newRoles = categoryRoles.map(r => r.role).filter(role => !currentAuthorizations.includes(role));
      form.setValue("authorizations", [...currentAuthorizations, ...newRoles]);
    } else {
      // Remove all roles from this category
      const categoryRoleValues = categoryRoles.map(r => r.role);
      form.setValue("authorizations", currentAuthorizations.filter(auth => !categoryRoleValues.includes(auth)));
    }
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryRoles = rolesByCategory[category];
    const currentAuthorizations = form.watch("authorizations");
    return categoryRoles.every(role => currentAuthorizations.includes(role.role));
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryRoles = rolesByCategory[category];
    const currentAuthorizations = form.watch("authorizations");
    return categoryRoles.some(role => currentAuthorizations.includes(role.role)) && !isCategoryFullySelected(category);
  };

  // Show skeleton while loading group data or submitting
  if (isLoadingGroup || isSubmitting) {
    return <AuthorizationGroupFormSkeleton isEditing={isEditing} />;
  }

  return (
    <ContentTheme title={t("settings")}
                  titleBreadcrumbs={[{label: t("authorizationGroups"), onClick: navigateBack},
                    {label: isEditing ? t('editAuthorizationGroup') : t('addAuthorizationGroup')}]}>
      <div className="max-w-4xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                rules={{
                  required: t('nameRequired'),
                  minLength: {
                    value: 2,
                    message: t('nameMinLength')
                  },
                  maxLength: {
                    value: 100,
                    message: t('nameMaxLength')
                  }
                }}
                render={({field}) => (
                  <FormItem>
                    <FormLabel>{t('name')} *</FormLabel>
                    <FormControl>
                      <Input placeholder={t('enterGroupName')} {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem>
                    <FormLabel>{t('description')}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t('enterGroupDescription')}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormLabel className="text-base font-semibold">{t('authorizations.title')} *</FormLabel>

              {Object.entries(rolesByCategory).map(([category, roles]) => (
                <Card key={category} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getCategoryBadgeVariant(category)}>
                          {t(category.toLowerCase())}
                        </Badge>
                        <span className="text-sm text-gray-600">
                            ({roles.length} {t('roles')})
                          </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isCategoryFullySelected(category)}
                          onCheckedChange={(checked) => handleSelectAllInCategory(category, checked as boolean)}
                          className={isCategoryPartiallySelected(category) ? "data-[state=checked]:bg-orange-500" : ""}
                        />
                        <label className="text-sm font-medium cursor-pointer"
                               onClick={() => handleSelectAllInCategory(category, !isCategoryFullySelected(category))}>
                          {t('selectAll')}
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roles.map(roleInfo => (
                        <div key={roleInfo.role} className="flex items-start space-x-3 p-2 rounded border">
                          <Checkbox
                            id={`role-${roleInfo.role}`}
                            checked={form.watch("authorizations").includes(roleInfo.role)}
                            onCheckedChange={(checked) => handleRoleChange(roleInfo.role, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={`role-${roleInfo.role}`} className="text-sm font-medium cursor-pointer">
                              {roleInfo.displayName}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              {roleInfo.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}

              {form.watch("authorizations").length === 0 && (
                <p className="text-sm text-red-500">{t('atLeastOneAuthorizationRequired')}</p>
              )}
            </div>

            {/*
              Reports get their own card rather than joining the permission cards above: those are
              built from useAuthorizationGroupRoles(), which enumerates the static RoleType enum.
              Reports are rows in a table created at runtime, so they cannot ride that hook.
              Rendered only when at least one report exists, so installations that never author a
              report never see an empty section.
            */}
            {reports.length > 0 && (
              <div className="space-y-4">
                <FormLabel className="text-base font-semibold">{t('reports.access')}</FormLabel>
                <Card className="p-4">
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{t('reports.accessHelp')}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {reports.map(report => (
                        <div key={report.id} className="flex items-start space-x-3 p-2 rounded border">
                          <Checkbox
                            id={`report-${report.id}`}
                            checked={form.watch("reportIds").includes(report.id)}
                            onCheckedChange={(checked) => handleReportChange(report.id, checked as boolean)}
                          />
                          <div className="flex-1 min-w-0">
                            <label htmlFor={`report-${report.id}`}
                                   className="text-sm font-medium cursor-pointer flex items-center gap-2">
                              <span className="truncate">{report.name}</span>
                              {!report.enabled && (
                                <Badge variant="outline" className="text-xs">{t('reports.disabled')}</Badge>
                              )}
                            </label>
                            {report.description && (
                              <p className="text-xs text-gray-500 mt-1">{report.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting || form.watch("authorizations").length === 0}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2"/>
                {isSubmitting ? t('saving') : t('save')}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={navigateBack}
                disabled={isSubmitting}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2"/>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ContentTheme>
  );
};

export default AuthorizationGroupForm;