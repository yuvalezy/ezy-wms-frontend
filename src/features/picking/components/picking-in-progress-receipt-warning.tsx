import {AlertTriangle} from "lucide-react";
import {useTranslation} from "react-i18next";

/**
 * Inline warning shown for a picking item that is still being put away from a non-finalized goods
 * receipt. Lets the operator know up front that scanning this reference will be blocked.
 */
export const PickingInProgressReceiptWarning = () => {
  const {t} = useTranslation();
  return (
    <div className="flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-500">
      <AlertTriangle className="h-4 w-4 shrink-0"/>
      {t('itemInProgressGoodsReceiptWarning')}
    </div>
  );
};
