import React, {useState, useEffect, useContext} from "react";
import {useTranslation} from "react-i18next";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import {Plus, Edit, Trash2, Search, X} from "lucide-react";
import {CancellationReason, CancellationReasonFilters} from "@/features/cancellation-reasons/data/cancellation-reason";
import {cancellationReasonService} from "@/features/cancellation-reasons/data/cancellation-reason-service";
import CancellationReasonForm from "@/features/cancellation-reasons/components/cancellation-reason-form";
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
import {Checkbox, useThemeContext} from "@/components";
import ContentTheme from "@/components/ContentTheme";

const CancellationReasonsList: React.FC = () => {
  const {t} = useTranslation();
  const {setLoading, setError} = useThemeContext();

  const [reasons, setReasons] = useState<CancellationReason[]>([]);
  const [filters, setFilters] = useState<CancellationReasonFilters>({includeDisabled: false});
  const [showForm, setShowForm] = useState(false);
  const [editingReason, setEditingReason] = useState<CancellationReason | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reasonToDelete, setReasonToDelete] = useState<CancellationReason | null>(null);

  useEffect(() => {
    loadReasons();
  }, [filters]);

  const loadReasons = async () => {
    try {
      setLoading(true);
      const data = await cancellationReasonService.getAll(filters);
      setReasons(data);
    } catch (error) {
      setError(`Failed to load cancellation reasons: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({...prev, searchTerm}));
  };

  const handleActiveFilter = (checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      includeDisabled: checked,
    }));
  };

  const handleCreate = () => {
    setEditingReason(null);
    setShowForm(true);
  };

  const handleEdit = (reason: CancellationReason) => {
    setEditingReason(reason);
    setShowForm(true);
  };

  const handleDelete = (reason: CancellationReason) => {
    setReasonToDelete(reason);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!reasonToDelete) return;

    try {
      setLoading(true);
      await cancellationReasonService.delete(reasonToDelete.id);
      await loadReasons();
      setShowDeleteDialog(false);
      setReasonToDelete(null);
    } catch (error) {
      setError(`Failed to delete cancellation reason: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = async (shouldReload: boolean = false) => {
    setShowForm(false);
    setEditingReason(null);
    if (shouldReload) {
      await loadReasons();
    }
  };

  return (
    <ContentTheme title={t("settings")} titleBreadcrumbs={[{label: t("cancellationReasons")}]} onAdd={handleCreate}>
      <div className="space-y-4">
        <Card>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                  {(filters?.searchTerm && filters?.searchTerm?.length > 0) && <X className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer h-4 w-4" onClick={() => setFilters({...filters, searchTerm: ''})}/>}
                  <Input
                    placeholder={t('searchCancellationReasons')}
                    className="pl-10"
                    onChange={(e) => handleSearch(e.target.value)}
                    value={filters?.searchTerm}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInactive"
                  checked={filters.includeDisabled}
                  onCheckedChange={handleActiveFilter}
                />
                <label htmlFor="includeInactive" className="text-sm font-medium">
                  {t('includeInactive')}
                </label>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('reason')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead>{t('goodsReceipt')}</TableHead>
                  <TableHead>{t('transfer')}</TableHead>
                  <TableHead>{t('counting')}</TableHead>
                  <TableHead className="text-right">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reasons.map((reason) => (
                  <TableRow key={reason.id}>
                    <TableCell className="font-medium">{reason.name}</TableCell>
                    <TableCell>
                      <Badge variant={reason.isEnabled ? "default" : "secondary"}>
                        {reason.isEnabled ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reason.goodsReceipt ? "default" : "secondary"}>
                        {reason.goodsReceipt ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reason.transfer ? "default" : "secondary"}>
                        {reason.transfer ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={reason.counting ? "default" : "secondary"}>
                        {reason.counting ? t('active') : t('inactive')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reason)}
                        >
                          <Edit className="h-4 w-4 mr-1"/>
                          {t('edit')}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(reason)}
                        >
                          <Trash2 className="h-4 w-4 mr-1"/>
                          {t('delete')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {reasons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      {t('noCancellationReasonsFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {showForm && (
          <AlertDialog open={showForm} onOpenChange={setShowForm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{!editingReason ? t('addCancellationReason') : t('editCancellationReason')}</AlertDialogTitle>
              </AlertDialogHeader>
              <CancellationReasonForm
                reason={editingReason}
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
                {t('confirmDeleteCancellationReason', {name: reasonToDelete?.name})}
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

export default CancellationReasonsList;