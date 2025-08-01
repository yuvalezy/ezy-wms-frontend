import {useTranslation} from 'react-i18next';

export function useObjectName() {
    const { t } = useTranslation();

    return (objectType: number | null | undefined, reserved: boolean = true) => {
        switch (objectType) {
            case 13:
                return t('reservedInvoice');
            case 17:
                return t('salesOrder');
            case 18:
                return reserved ? t('purchaseInvoice') : t('reservedInvoice');
            case 20:
                return t('goodsReceipt');
            case 22:
                return t('purchaseOrder');
            case 1250000001:
                return t('transferRequest');
            case 67:
                return t('transfer');
            default:
                return `Unknown object ${objectType}`; // You may also translate this part if needed
        }
    };
}