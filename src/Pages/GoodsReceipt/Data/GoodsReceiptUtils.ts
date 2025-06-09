import { useNavigate } from "react-router-dom";
import { Status } from "@/assets";

export const activeStatuses = [Status.InProgress, Status.Processing, Status.Finished];
export const processStatuses = [Status.InProgress, Status.Processing];

export const useHandleOpen = (confirm: boolean = false) => {
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
