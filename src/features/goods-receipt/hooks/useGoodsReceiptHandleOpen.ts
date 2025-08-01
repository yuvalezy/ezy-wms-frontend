import {useNavigate} from "react-router-dom";
import {ProcessType} from "@/features/shared/data";

export const useGoodsReceiptHandleOpen = (processType: ProcessType = ProcessType.Regular) => {
  const navigate = useNavigate();
  return (type: string, id: string) => {
    let routePrefix: string;
    
    switch (processType) {
      case ProcessType.Confirmation:
        routePrefix = 'goodsReceiptConfirmation';
        break;
      case ProcessType.TransferConfirmation:
        routePrefix = 'transferConfirmation';
        break;
      default:
        routePrefix = 'goodsReceipt';
        break;
    }
    
    switch (type) {
      case 'open':
        navigate(`/${routePrefix}/${id}`);
        break;
      case 'all':
        navigate(`/${routePrefix}ReportAll/${id}`);
        break;
      case 'vs':
        navigate(`/${routePrefix}VSExitReport/${id}`);
        break;
      case 'diff':
        navigate(`/${routePrefix}ProcessDifferenceReport/${id}`);
        break;
    }
  };
};