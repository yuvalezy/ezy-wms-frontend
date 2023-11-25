import { useTranslation } from 'react-i18next';
import {DocumentStatus} from "./Document";

export const useDocumentStatusToString = () => {
    const { t } = useTranslation();

    return (status: DocumentStatus) => {
        switch (status) {
            case DocumentStatus.Open:
                return t('openStatus');
            case DocumentStatus.Processing:
                return t('processingStatus');
            case DocumentStatus.Finished:
                return t('finishedStatus');
            case DocumentStatus.Cancelled:
                return t('cancelledStatus');
            case DocumentStatus.InProgress:
                return t('inProgressStatus');
            default:
                return '';
        }
    };
};
