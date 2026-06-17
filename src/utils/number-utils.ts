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
  // Guard against undefined/null/NaN (e.g. a missing quantity field) so a single
  // bad number can never throw during render and blank an operational screen.
  const safeValue = Number.isFinite(value) ? value : 0;
  return safeValue.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}