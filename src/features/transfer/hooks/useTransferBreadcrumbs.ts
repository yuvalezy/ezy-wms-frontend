import {useTranslation} from "react-i18next";
import {useNavigate} from "react-router";
import {BinLocation} from "@/features/items/data/items";
import {TransferDocument} from "@/features/transfer/data/transfer";
import {UserInfo} from "@/features/login/data/login";

export interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

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
}: UseTransferBreadcrumbsProps): Breadcrumb[] => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const breadcrumbs: Breadcrumb[] = [];

  // Add transfer number breadcrumb
  if (info?.number || scanCode) {
    breadcrumbs.push({
      label: info?.number?.toString() ?? scanCode ?? '',
      onClick: scanCode ? () => navigate(`/transfer/${scanCode}`) : undefined
    });
  }

  // Add page type breadcrumb
  if (pageType) {
    let label = '';
    switch (pageType) {
      case 'source':
        label = user?.binLocations ? t("selectTransferSource") : t("selectSourceItems");
        break;
      case 'targetBins':
        label = t("selectTransferTargetBins");
        break;
      case 'targetItems':
        label = t("selectTransferTargetItems");
        break;
    }

    if (label) {
      breadcrumbs.push({
        label,
        onClick: binLocation ? onBinClear : undefined
      });
    }
  }

  // Add bin location breadcrumb if present
  if (binLocation) {
    breadcrumbs.push({
      label: binLocation.code,
      onClick: undefined
    });
  }

  return breadcrumbs;
};
