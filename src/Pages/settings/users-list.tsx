import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Edit, Trash2, UserCheck, UserX} from "lucide-react";
import {useAuth, useThemeContext} from "@/components";
import {AuthorizationGroup, User, UserFilters, Warehouse} from "@/features/users/data/user";
import {userService} from "@/features/users/data/user-service";
import UserForm from "@/features/users/components/user-form";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "@/components/ui/alert-dialog";
import ContentTheme from "@/components/ContentTheme";

const UsersList: React.FC = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const {setLoading, setError} = useThemeContext();

  const [users, setUsers] = useState<User[]>([]);
  const [authorizationGroups, setAuthorizationGroups] = useState<AuthorizationGroup[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filters, setFilters] = useState<UserFilters>({includeInactive: true});
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadUsers();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, authGroupsData, warehousesData] = await Promise.all([
        userService.getAll(filters),
        userService.getAuthorizationGroups(),
        userService.getWarehouses()
      ]);
      setUsers(usersData);
      setAuthorizationGroups(authGroupsData);
      setWarehouses(warehousesData);
    } catch (error) {
      setError(`Failed to load data: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll(filters);
      setUsers(data);
    } catch (error) {
      setError(`Failed to load users: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({...prev, searchTerm}));
  };

  const handleWarehouseFilter = (warehouseId: string) => {
    setFilters(prev => ({
      ...prev,
      warehouseId: warehouseId === "all" ? undefined : warehouseId
    }));
  };

  const handleAuthGroupFilter = (authGroupId: string) => {
    setFilters(prev => ({
      ...prev,
      authorizationGroupId: authGroupId === "all" ? undefined : authGroupId
    }));
  };

  const handleIncludeInactive = (checked: boolean) => {
    setFilters(prev => ({...prev, includeInactive: checked}));
  };

  const handleCreate = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setIsLoading(true);
      await userService.delete(userToDelete.id);
      await loadUsers();
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      setError(`Failed to delete user: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      setIsLoading(true);
      if (user.active) {
        await userService.disable(user.id);
      } else {
        await userService.enable(user.id);
      }
      await loadUsers();
    } catch (error) {
      setError(`Failed to ${user.active ? 'disable' : 'enable'} user: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormClose = async (shouldReload: boolean = false) => {
    setShowForm(false);
    setEditingUser(null);
    if (shouldReload) {
      await loadUsers();
    }
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("users")}]} onAdd={handleCreate}>
      <div className="space-y-4">
        <Card>
          <CardContent>
            {/*<div className="flex gap-4 mb-4 flex-wrap">*/}
            {/*  <div className="flex-1 min-w-64">*/}
            {/*    <div className="relative">*/}
            {/*      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>*/}
            {/*      <Input*/}
            {/*        placeholder={t('searchUsers')}*/}
            {/*        className="pl-10"*/}
            {/*        onChange={(e) => handleSearch(e.target.value)}*/}
            {/*      />*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*  <Select onValueChange={handleWarehouseFilter} defaultValue="all">*/}
            {/*    <SelectTrigger className="w-48">*/}
            {/*      <SelectValue placeholder={t('warehouse')}/>*/}
            {/*    </SelectTrigger>*/}
            {/*    <SelectContent>*/}
            {/*      <SelectItem value="all">{t('allWarehouses')}</SelectItem>*/}
            {/*      {warehouses.map(warehouse => (*/}
            {/*        <SelectItem key={warehouse.id} value={warehouse.id}>*/}
            {/*          {warehouse.name}*/}
            {/*        </SelectItem>*/}
            {/*      ))}*/}
            {/*    </SelectContent>*/}
            {/*  </Select>*/}
            {/*  <Select onValueChange={handleAuthGroupFilter} defaultValue="all">*/}
            {/*    <SelectTrigger className="w-48">*/}
            {/*      <SelectValue placeholder={t('authorizationGroup')}/>*/}
            {/*    </SelectTrigger>*/}
            {/*    <SelectContent>*/}
            {/*      <SelectItem value="all">{t('allAuthorizationGroups')}</SelectItem>*/}
            {/*      {authorizationGroups.map(group => (*/}
            {/*        <SelectItem key={group.id} value={group.id}>*/}
            {/*          {group.name}*/}
            {/*        </SelectItem>*/}
            {/*      ))}*/}
            {/*    </SelectContent>*/}
            {/*  </Select>*/}
            {/*  <div className="flex items-center space-x-2">*/}
            {/*    <Checkbox*/}
            {/*      id="includeInactive"*/}
            {/*      checked={filters.includeInactive}*/}
            {/*      onCheckedChange={handleIncludeInactive}*/}
            {/*    />*/}
            {/*    <label htmlFor="includeInactive" className="text-sm font-medium">*/}
            {/*      {t('includeInactive')}*/}
            {/*    </label>*/}
            {/*  </div>*/}
            {/*</div>*/}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('fullName')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead>{t('position')}</TableHead>
                  <TableHead>{t('authorizationGroup')}</TableHead>
                  <TableHead>{t('warehouses')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-12 rounded-full" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Skeleton className="h-8 w-16" />
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {users?.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium"> {u.fullName} </TableCell>
                        <TableCell>{u.email || '-'}</TableCell>
                        <TableCell>{u.position || '-'}</TableCell>
                        <TableCell>{
                          !u.superUser ?
                            u.authorizationGroupName || '-' : (
                            <Badge variant="destructive" className="text-xs">
                              {t('superUser')}
                            </Badge>
                          )
                        }</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {u.warehouses.length > 0 &&
                              warehouses.filter(warehouse => u.warehouses.includes(warehouse.id)).map(warehouse => (
                                <Badge key={warehouse.id} variant="outline" className="text-xs">
                                  {warehouse.name}
                                </Badge>
                              ))}
                            {u.warehouses.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{u.warehouses.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.active ? "default" : "secondary"}>
                            {u.active ? t('active') : t('inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(u)}
                            >
                              <Edit className="h-4 w-4 mr-1"/>
                              {t('edit')}
                            </Button>
                            <Button
                              variant={u.active ? "secondary" : "default"}
                              disabled={u.id === user?.id}
                              size="sm"
                              onClick={() => handleToggleStatus(u)}
                            >
                              {u.active ? <UserX className="h-4 w-4 mr-1"/> : <UserCheck className="h-4 w-4 mr-1"/>}
                              {u.active ? t('disable') : t('enable')}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(u)}
                            >
                              <Trash2 className="h-4 w-4 mr-1"/>
                              {t('delete')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          {t('noUsersFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showForm && (
          <AlertDialog open={showForm} onOpenChange={setShowForm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{!editingUser ? t('editUser') : t('addUser')}</AlertDialogTitle>
              </AlertDialogHeader>
              <UserForm
                user={editingUser}
                authorizationGroups={authorizationGroups}
                warehouses={warehouses}
                onClose={handleFormClose}
              />
            </AlertDialogContent>
          </AlertDialog>
        )}

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmDeleteUser', {name: userToDelete?.fullName})}
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

export default UsersList;