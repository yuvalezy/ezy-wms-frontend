export const Functions = {
    IsNumeric: (value: string) => {
        return /^\d+$/.test(value);
    }
}