import { useNavigate } from "react-router-dom";
import { Status } from "../../../Assets/Common";

export const activeStatuses = [Status.InProgress, Status.Processing, Status.Finished];
export const processStatuses = [Status.InProgress, Status.Processing];

export const useHandleOpen = () => {
    const navigate = useNavigate();
    return (e: React.MouseEvent<HTMLAnchorElement>, type: string, id: number) => {
        e.preventDefault();
        switch (type) {
            case 'open':
                navigate(`/goodsReceipt/${id}`);
                break;
            case 'all':
                navigate(`/goodsReceiptReportAll/${id}`);
                break;
            case 'vs':
                navigate(`/goodsReceiptVSExitReport/${id}`);
                break;
            case 'diff':
                navigate(`/goodsReceiptProcessDifferenceReport/${id}`);
                break;
        }
    };
};