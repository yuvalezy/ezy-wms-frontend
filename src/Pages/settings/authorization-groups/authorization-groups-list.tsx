import React, {useState, useEffect, useContext} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faEdit, faTrash, faSearch, faUsers} from "@fortawesome/free-solid-svg-icons";
import {useThemeContext} from "@/components";
import {AuthorizationGroup, AuthorizationGroupFilters} from "./data/authorization-group";
import {authorizationGroupService} from "./data/authorization-group-service";
import AuthorizationGroupForm from "./components/authorization-group-form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import ContentTheme from "@/components/ContentTheme";
import {useNavigate} from "react-router-dom";

const AuthorizationGroupsList: React.FC = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();
  const navigate = useNavigate();

  const [groups, setGroups] = useState<AuthorizationGroup[]>([]);
  const [filters, setFilters] = useState<AuthorizationGroupFilters>({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<AuthorizationGroup | null>(null);

  useEffect(() => {
    loadGroups();
  }, [filters]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const data = await authorizationGroupService.getAll(filters);
      setGroups(data);
    } catch (error) {
      setError(`Failed to load authorization groups: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({...prev, searchTerm}));
  };

  const handleCreate = () => {
    navigate('add')
  };

  const handleEdit = (group: AuthorizationGroup) => {
    navigate(group.id)
  };

  const handleDelete = (group: AuthorizationGroup) => {
    if (!group.canDelete) {
      setError(t('cannotDeleteSystemGroup'));
      return;
    }
    setGroupToDelete(group);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;

    try {
      setLoading(true);
      await authorizationGroupService.delete(groupToDelete.id);
      await loadGroups();
      setShowDeleteDialog(false);
      setGroupToDelete(null);
    } catch (error) {
      setError(`Failed to delete authorization group: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // const handleFormClose = async (shouldReload: boolean = false) => {
  //   setShowForm(false);
  //   setEditingGroup(null);
  //   if (shouldReload) {
  //     await loadGroups();
  //   }
  // };

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

  const groupRolesByCategory = (authorizations: any[]) => {
    const roleInfo = authorizationGroupService.getRoleInfo();
    const grouped = authorizations.reduce((acc, auth) => {
      const info = roleInfo.find(r => r.role === auth);
      if (info) {
        if (!acc[info.category]) {
          acc[info.category] = [];
        }
        acc[info.category].push(info);
      }
      return acc;
    }, {} as Record<string, any[]>);
    return grouped;
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("authorizationGroups")}]} onAdd={handleCreate}>
      <div className="space-y-4">
        <Card>
          <CardContent>
            {/*<div className="flex gap-4 mb-4">*/}
            {/*  <div className="flex-1">*/}
            {/*    <div className="relative">*/}
            {/*      <FontAwesomeIcon icon={faSearch}*/}
            {/*                       className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"/>*/}
            {/*      <Input*/}
            {/*        placeholder={t('searchAuthorizationGroups')}*/}
            {/*        className="pl-10"*/}
            {/*        onChange={(e) => handleSearch(e.target.value)}*/}
            {/*      />*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</div>*/}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('authorizations')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  const rolesByCategory = groupRolesByCategory(group.authorizations);
                  // @ts-ignore
                  return (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {group.name}
                          {!group.canDelete && (
                            <Badge variant="outline" className="text-xs">
                              {t('system')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={group.description}>
                          {group.description || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="space-y-2">
                          {Object.entries(rolesByCategory).map(([category, roles]) => (
                            <div key={category} className="flex flex-wrap gap-1">
                              <Badge
                                variant={getCategoryBadgeVariant(category)}
                                className="text-xs font-semibold mr-1"
                              >
                                {t(category.toLowerCase())}
                              </Badge>
                              <span className="text-xs text-gray-600">
                              {(roles as any[]).length} {t('roles')}
                            </span>
                            </div>
                          ))}
                          {group.authorizations.length === 0 && (
                            <span className="text-xs text-gray-500">{t('noRoles')}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : ''}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(group)}
                          >
                            <FontAwesomeIcon icon={faEdit} className="mr-1"/>
                            {t('edit')}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(group)}
                            disabled={!group.canDelete}
                          >
                            <FontAwesomeIcon icon={faTrash} className="mr-1"/>
                            {t('delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {groups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('noAuthorizationGroupsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmDeleteAuthorizationGroup', {name: groupToDelete?.name})}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}
                                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentTheme>
  );
};

export default AuthorizationGroupsList;