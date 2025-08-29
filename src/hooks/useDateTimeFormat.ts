import {useCallback} from 'react';

export function useDateTimeFormat() {
    const userLocale = navigator.language || 'en-US';

    const dateFormat = useCallback((date: Date | null | undefined) => {
        if (date == null) {
            return '';
        }
        return date.toLocaleDateString(userLocale, { timeZone: 'UTC' });
    }, [userLocale]);

    const timeFormat = useCallback((date: Date | null | undefined) => {
        if (date == null) {
            return '';
        }
        return date.toLocaleTimeString(userLocale, { timeZone: 'UTC' });
    }, [userLocale]);

    const dateTimeFormat = useCallback((date: Date | null | undefined) => {
        if (date == null) {
            return '';
        }
        return `${date.toLocaleDateString(userLocale, { timeZone: 'UTC' })} ${date.toLocaleTimeString(userLocale, { timeZone: 'UTC' })}`;
    }, [userLocale]);

    return { dateFormat, timeFormat, dateTimeFormat };
}
