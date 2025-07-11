export const IsNumeric = (value: string) => {
  return /^\d+$/.test(value);
}

/**
 * Format a number with thousands separators and fixed decimals.
 * @param value  The number to format.
 * @param decimals  How many decimal places (default 2).
 * @param locale  BCP 47 locale (default 'en-US').
 */
export function formatNumber(
  value: number,
  decimals = 2,
  locale?: string,
): string {
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}