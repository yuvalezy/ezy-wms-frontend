import {ItemCheckResponse} from "../Item";
import {useTranslation} from "react-i18next";

interface ItemDetailsListProps {
    result: ItemCheckResponse;
}
const ItemDetailsList : React.FC<ItemDetailsListProps> = ({result}) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-3 p-4">
            <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">{t('description')}:</span>
                <span className="text-base">{result.itemName}</span>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">{t('purPackUn')}:</span>
                <span className="text-base">{result.numInBuy} {result.buyUnitMsr}</span>
            </div>
            <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">{t('packUn')}:</span>
                <span className="text-base">{result.purPackUn} {result.purPackMsr}</span>
            </div>
        </div>
    );
};
export default ItemDetailsList;
