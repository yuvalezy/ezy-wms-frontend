import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {BinLocation} from "@/features/items/data/items";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {UserInfo} from "@/features/login/data/login";
import {BreadcrumbItem} from "@/components/ui/responsive-breadcrumbs";

interface UseTransferBreadcrumbsProps {
  info: TransferDocument | null;
  scanCode?: string;
  binLocation?: BinLocation | null;
  user?: UserInfo | null;
  onBinClear?: () => void;
  pageType?: 'source' | 'targetBins' | 'targetItems';
}

/**
 * Custom hook to generate consistent breadcrumb navigation for transfer pages
 * Handles transfer number, page type, and bin location breadcrumbs
 */
export const useTransferBreadcrumbs = ({
  info,
  scanCode,
  binLocation,
  user,
  onBinClear,
  pageType
}: UseTransferBreadcrumbsProps): BreadcrumbItem[] => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const breadcrumbs: BreadcrumbItem[] = [];

  // Add transfer number breadcrumb with high priority
  if (info?.number || scanCode) {
    breadcrumbs.push({
      label: info?.number?.toString() ?? scanCode ?? '',
      onClick: scanCode ? () => navigate(`/transfer/${scanCode}`) : undefined,
      priority: 'high' // Transfer number is important for context
    });
  }

  // Add page type breadcrumb with normal priority
  if (pageType) {
    let label = '';
    let priority: 'high' | 'normal' | 'low' = 'normal';

    switch (pageType) {
      case 'source':
        label = user?.binLocations ? t("selectTransferSource") : t("selectSourceItems");
        priority = binLocation ? 'high' : 'normal'; // Higher priority when bin is selected to allow going back
        break;
      case 'targetBins':
        label = t("selectTransferTargetBins");
        priority = 'normal';
        break;
      case 'targetItems':
        label = t("selectTransferTargetItems");
        priority = 'normal';
        break;
    }

    if (label) {
      breadcrumbs.push({
        label,
        onClick: binLocation ? onBinClear : undefined,
        priority
      });
    }
  }

  // Add bin location breadcrumb with low priority (it's the current context)
  if (binLocation) {
    breadcrumbs.push({
      label: binLocation.code,
      onClick: undefined,
      priority: 'low' // Current location is less important as it's shown elsewhere
    });
  }

  return breadcrumbs;
};
