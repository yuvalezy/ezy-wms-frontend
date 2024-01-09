import {useTranslation} from 'react-i18next';

export function useObjectName() {
    const { t } = useTranslation();

    return (objectType: number | null | undefined) => {
        switch (objectType) {
            case 13:
                return t('reservedInvoice');
            case 17:
                return t('salesOrder');
            case 18:
                return t('reservedInvoice');
            case 22:
                return t('purchaseOrder');
            case 1250000001:
                return t('transferRequest');
            default:
                return `Unknown object ${objectType}`; // You may also translate this part if needed
        }
    };
}