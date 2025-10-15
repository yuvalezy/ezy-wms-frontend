import {useCallback} from 'react';

export function useDateTimeFormat() {
    const userLocale = navigator.language || 'en-US';

    const dateFormat = useCallback((date: Date | string | null | undefined) => {
        if (date == null) {
            return '';
        }
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString(userLocale);
    }, [userLocale]);

    const timeFormat = useCallback((date: Date | string | null | undefined) => {
        if (date == null) {
            return '';
        }
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleTimeString(userLocale);
    }, [userLocale]);

    const dateTimeFormat = useCallback((date: Date | string | null | undefined) => {
        if (date == null) {
            return '';
        }
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return `${dateObj.toLocaleDateString(userLocale)} ${dateObj.toLocaleTimeString(userLocale)}`;
    }, [userLocale]);

    return { dateFormat, timeFormat, dateTimeFormat };
}
