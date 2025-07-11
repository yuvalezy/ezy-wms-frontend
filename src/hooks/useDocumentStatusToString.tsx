import { useTranslation } from 'react-i18next';

import {Status} from "@/features/shared/data/shared";

export const useDocumentStatusToString = () => {
    const { t } = useTranslation();

    return (status: Status) => {
        switch (status) {
            case Status.Open:
                return t('openStatus');
            case Status.Processing:
                return t('processingStatus');
            case Status.Finished:
                return t('finishedStatus');
            case Status.Cancelled:
                return t('cancelledStatus');
            case Status.InProgress:
                return t('inProgressStatus');
            default:
                return '';
        }
    };
};
