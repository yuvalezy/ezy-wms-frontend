import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {Plus, Trash2} from "lucide-react";
import {useThemeContext} from "@/components";
import {
  AlertableObjectType,
  ExternalSystemAlert,
  ExternalSystemUser
} from "@/features/external-alerts/data/external-alert";
import {externalAlertService} from "@/features/external-alerts/data/external-alert-service";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Switch} from "@/components/ui/switch";
import {Label} from "@/components/ui/label";
import ContentTheme from "@/components/ContentTheme";

const ExternalAlertsList: React.FC = () => {
  const {t} = useTranslation();
  const {setError} = useThemeContext();

  const [alerts, setAlerts] = useState<ExternalSystemAlert[]>([]);
  const [externalUsers, setExternalUsers] = useState<ExternalSystemUser[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [alertToDelete, setAlertToDelete] = useState<ExternalSystemAlert | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state for adding new alert
  const [selectedObjectType, setSelectedObjectType] = useState<AlertableObjectType>(AlertableObjectType.Transfer);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [enabled, setEnabled] = useState<boolean>(true);

  const getObjectTypeName = (type: AlertableObjectType): string => {
    // Handle both numeric and string enum values from backend
    const typeValue = typeof type === 'string' ? type : type;

    // Check by enum value (number)
    switch (type) {
      case AlertableObjectType.Transfer:
        return t('transfer');
      case AlertableObjectType.GoodsReceipt:
        return t('goodsReceipt');
      case AlertableObjectType.InventoryCounting:
        return t('inventoryCounting');
      case AlertableObjectType.PickList:
        return t('pickList');
      case AlertableObjectType.ConfirmationAdjustments:
        return t('confirmationAdjustments');
      case AlertableObjectType.PickListCancellation:
        return t('pickListCancellation');
    }

    // Check by enum name (string)
    switch (typeValue) {
      case 'Transfer':
        return t('transfer');
      case 'GoodsReceipt':
        return t('goodsReceipt');
      case 'InventoryCounting':
        return t('inventoryCounting');
      case 'PickList':
        return t('pickList');
      case 'ConfirmationAdjustments':
        return t('confirmationAdjustments');
      case 'PickListCancellation':
        return t('pickListCancellation');
      default:
        return typeValue.toString();
    }
  };

  const getUserName = (userId: string): string => {
    const user = externalUsers.find(u => u.userId === userId);
    return user?.userName || userId;
  };

  useEffect(() => {
    loadAlerts();
    loadExternalUsers();
  }, []);

  const loadAlerts = async () => {
    try {
      setIsLoading(true);
      const data = await externalAlertService.getAll();
      // Sort by object type alphabetically
      const sorted = data.sort((a, b) => {
        const nameA = getObjectTypeName(a.objectType);
        const nameB = getObjectTypeName(b.objectType);
        return nameA.localeCompare(nameB);
      });
      setAlerts(sorted);
    } catch (error) {
      setError(`Failed to load external alerts: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadExternalUsers = async () => {
    try {
      const users = await externalAlertService.getExternalUsers();
      setExternalUsers(users);
    } catch (error) {
      setError(`Failed to load external users: ${error}`);
    }
  };

  const handleDelete = (alert: ExternalSystemAlert) => {
    setAlertToDelete(alert);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!alertToDelete) return;

    try {
      setIsLoading(true);
      await externalAlertService.delete(alertToDelete.id);
      await loadAlerts();
      setShowDeleteDialog(false);
      setAlertToDelete(null);
    } catch (error) {
      setError(`Failed to delete alert: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedObjectType(AlertableObjectType.Transfer);
    setSelectedUserId("");
    setEnabled(true);
    setShowAddDialog(true);
  };

  const handleCreate = async () => {
    if (!selectedUserId) {
      setError(t('pleaseSelectUser'));
      return;
    }

    // Check for duplicate
    const duplicate = alerts.find(
      a => a.objectType === selectedObjectType && a.externalUserId === selectedUserId
    );
    if (duplicate) {
      setError(t('alertAlreadyExists'));
      return;
    }

    try {
      setIsLoading(true);
      await externalAlertService.create({
        objectType: selectedObjectType,
        externalUserId: selectedUserId,
        enabled: enabled
      });
      await loadAlerts();
      setShowAddDialog(false);
    } catch (error) {
      setError(`Failed to create alert: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleEnabled = async (alert: ExternalSystemAlert) => {
    try {
      setIsLoading(true);
      await externalAlertService.update(alert.id, {enabled: !alert.enabled});
      await loadAlerts();
    } catch (error) {
      setError(`Failed to update alert: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("externalAlerts")}]} onAdd={handleAdd}>
      <div className="space-y-4">
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('objectType')}</TableHead>
                  <TableHead>{t('externalUser')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('createdAt')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton loading rows
                  Array.from({length: 5}).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell><Skeleton className="h-4 w-32"/></TableCell>
                      <TableCell><Skeleton className="h-4 w-40"/></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full"/></TableCell>
                      <TableCell><Skeleton className="h-4 w-24"/></TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Skeleton className="h-8 w-20"/>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell className="font-medium">
                          {getObjectTypeName(alert.objectType)}
                        </TableCell>
                        <TableCell>{getUserName(alert.externalUserId)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={alert.enabled}
                              onCheckedChange={() => handleToggleEnabled(alert)}
                            />
                            <Badge variant={alert.enabled ? 'default' : 'secondary'}>
                              {alert.enabled ? t('enabled') : t('disabled')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(alert)}
                            >
                              <Trash2 className="h-4 w-4 mr-1"/>
                              {t('delete')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && alerts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          {t('noExternalAlertsFound')}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Add Alert Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addExternalAlert')}</DialogTitle>
              <DialogDescription>
                {t('addExternalAlertDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="objectType">{t('objectType')}</Label>
                <Select
                  value={selectedObjectType.toString()}
                  onValueChange={(value) => setSelectedObjectType(parseInt(value) as AlertableObjectType)}
                >
                  <SelectTrigger>
                    <SelectValue/>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AlertableObjectType)
                      .filter(v => typeof v === 'number')
                      .sort((a, b) => {
                        const nameA = getObjectTypeName(a as AlertableObjectType);
                        const nameB = getObjectTypeName(b as AlertableObjectType);
                        return nameA.localeCompare(nameB);
                      })
                      .map((type) => (
                        <SelectItem key={type} value={type.toString()}>
                          {getObjectTypeName(type as AlertableObjectType)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="externalUser">{t('externalUser')}</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectUser')}/>
                  </SelectTrigger>
                  <SelectContent>
                    {externalUsers.map((user) => (
                      <SelectItem key={user.userId} value={user.userId}>
                        {user.userName} <span className="text-xs text-gray-500">({user.userId})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled}/>
                <Label htmlFor="enabled">{t('enabled')}</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-1"/>
                {t('create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('confirmDeleteExternalAlert')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {t('delete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ContentTheme>
  );
};

export default ExternalAlertsList;
