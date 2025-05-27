import {ItemCheckResponse} from "../Item";
import {useTranslation} from "react-i18next";
import {List, StandardListItem} from "@ui5/webcomponents-react";

interface ItemDetailsListProps {
    result: ItemCheckResponse;
}
const ItemDetailsList : React.FC<ItemDetailsListProps> = ({result}) => {
    const { t } = useTranslation();
    return (
        <List>
            <StandardListItem><strong>{t('description')}:</strong> {result.itemName}</StandardListItem>
            <StandardListItem><strong>{t('purPackUn')}:</strong> {result.numInBuy} {result.buyUnitMsr}</StandardListItem>
          <StandardListItem><strong>{t('packUn')}:</strong> {result.purPackUn} {result.purPackMsr}</StandardListItem>
        </List>
    );
};
export default ItemDetailsList;
