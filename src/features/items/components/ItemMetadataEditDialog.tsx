import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from '@/components/ui/dialog';
import {Skeleton} from '@/components/ui/skeleton';
import {Edit} from 'lucide-react';
import {ItemDetails} from '../data/items';
import {getItemMetadata, ItemMetadataForm, MetadataDefinition} from '@/features/items';
import {useAuth} from "@/Components";
import {useThemeContext} from '@/components/ThemeContext';
import {RoleType} from "@/features/authorization-groups/data/authorization-group";

interface ItemMetadataEditDialogProps {
  itemCode: string;
  onItemUpdate?: (updatedItem: ItemDetails) => void;
  triggerButton?: React.ReactNode;
  className?: string;
}

export const ItemMetadataEditDialog: React.FC<ItemMetadataEditDialogProps> = ({
  itemCode,
  onItemUpdate,
  triggerButton,
  className
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { setError } = useThemeContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [metadataValues, setMetadataValues] = useState<Record<string, any>>({});
  const [itemData, setItemData] = useState<ItemDetails | null>(null);
  
  const definitions = user!.itemMetaData;
  const hasMetadata = definitions && definitions.length > 0;
  const hasEditableFields = definitions && definitions.some(def => !def.readOnly) && 
    (user!.superUser || user?.roles?.includes(RoleType.ITEM_MANAGEMENT));

  // Load metadata values when dialog opens
  useEffect(() => {
    const loadMetadata = async () => {
      if (!isDialogOpen || !hasMetadata) {
        return;
      }

      try {
        setIsLoading(true);
        const response = await getItemMetadata(itemCode);
        setMetadataValues(response.metadata || {});
        // Create a minimal ItemDetails object for the form
        setItemData({
          itemCode: itemCode,
          itemName: itemCode, // Use itemCode as default name
          customAttributes: response.metadata || {},
          metadataDefinitions: definitions,
          numInBuy: 1,
          purPackUn: 1
        } as ItemDetails);
      } catch (error) {
        console.error('Failed to load item metadata:', error);
        setError(error as Error);
        setMetadataValues({});
      } finally {
        setIsLoading(false);
      }
    };

    loadMetadata();
  }, [isDialogOpen, itemCode, hasMetadata, definitions, setError]);

  const handleSave = async (updatedItem: ItemDetails) => {
    onItemUpdate?.(updatedItem);
    setIsDialogOpen(false);
    
    // Reload metadata to show updated values
    try {
      const response = await getItemMetadata(itemCode);
      setMetadataValues(response.metadata || {});
    } catch (error) {
      console.error('Failed to reload item metadata:', error);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
  };

  // Don't render if no metadata or no editable fields
  if (!hasMetadata || !hasEditableFields) {
    return null;
  }

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 px-2">
      <Edit className="h-4 w-4" />
      <span className="ml-2">{t('editMetadata')}</span>
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild className={className}>
        {triggerButton || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('editMetadata')}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="space-y-4 p-4" aria-label="Loading...">
            {definitions?.slice(0, 3).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        ) : itemData ? (
          <ItemMetadataForm
            itemData={itemData}
            onSave={handleSave}
            onCancel={handleCancel}
            className="border-0 shadow-none"
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            {t('nodata')}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Helper function to check if metadata editing is available
export const canEditMetadata = (user: any): boolean => {
  const definitions = user?.itemMetaData;
  const hasMetadata = definitions && definitions.length > 0;
  const hasEditableFields = definitions && definitions.some((def: MetadataDefinition) => !def.readOnly);
  const hasPermission = user?.superUser || user?.roles?.includes(RoleType.ITEM_MANAGEMENT);

  return !!(hasMetadata && hasEditableFields && hasPermission);
};