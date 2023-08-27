export const IsNumeric = (value: string) => {
    return /^\d+$/.test(value);
}
export const StringFormat = (template: string, ...args: any[]): string => {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined'
            ? args[index]
            : match;
    });
}