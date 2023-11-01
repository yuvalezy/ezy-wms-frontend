import {useTranslation} from 'react-i18next';

export function useObjectName() {
    const { t } = useTranslation();

    return (objectType: number | null | undefined) => {
        switch (objectType) {
            case 13:
                return t('ReservedInvoice');
            case 17:
                return t('SalesOrder');
            case 18:
                return t('ReservedInvoice');
            case 22:
                return t('PurchaseOrder');
            case 1250000001:
                return t('TransferRequest');
            default:
                return `Unknown object ${objectType}`; // You may also translate this part if needed
        }
    };
}