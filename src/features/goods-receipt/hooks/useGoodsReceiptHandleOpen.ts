import {useNavigate} from "react-router-dom";

export const useGoodsReceiptHandleOpen = (confirm: boolean = false) => {
  const navigate = useNavigate();
  return (type: string, id: string) => {
    const confirmation = confirm ? 'Confirmation' : '';
    switch (type) {
      case 'open':
        navigate(`/goodsReceipt${confirmation}/${id}`);
        break;
      case 'all':
        navigate(`/goodsReceipt${confirmation}ReportAll/${id}`);
        break;
      case 'vs':
        navigate(`/goodsReceipt${confirmation}VSExitReport/${id}`);
        break;
      case 'diff':
        navigate(`/goodsReceipt${confirmation}ProcessDifferenceReport/${id}`);
        break;
    }
  };
};