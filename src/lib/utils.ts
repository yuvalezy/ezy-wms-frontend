import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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

export function wd(value: string | null | undefined, defaultValue: string): string {
  if (value != null && value.trim().length != 0)
    return value;
  return defaultValue;
}
