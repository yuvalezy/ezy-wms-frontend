
export const StringFormat = (template: string, ...args: any[]): string => {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined'
            ? args[index]
            : match;
    });
}

export const IsNullOrEmpty = (str: string | null | undefined) => {
    return str === null || str === undefined || str.trim() === '';
}

