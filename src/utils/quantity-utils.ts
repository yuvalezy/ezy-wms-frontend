/**
 * Utility functions for handling quantity inputs with optional decimal support
 */

/**
 * Parses a quantity string into a number based on decimal settings
 * @param value - The string value to parse
 * @param enableDecimals - Whether decimals are enabled
 * @returns Parsed number value
 */
export function parseQuantity(value: string, enableDecimals: boolean): number {
  if (value === '' || value === null || value === undefined) {
    return 0;
  }

  if (enableDecimals) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  } else {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
}

/**
 * Formats a quantity number for display based on decimal settings
 * @param value - The number value to format
 * @param enableDecimals - Whether decimals are enabled
 * @returns Formatted string
 */
export function formatQuantity(value: number, enableDecimals: boolean): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  if (enableDecimals) {
    return value.toFixed(2);
  } else {
    return Math.floor(value).toString();
  }
}

/**
 * Gets the step value for number inputs based on decimal settings
 * @param enableDecimals - Whether decimals are enabled
 * @returns Step value as string ("0.01" or "1")
 */
export function getQuantityStep(enableDecimals: boolean): string {
  return enableDecimals ? "0.01" : "1";
}

/**
 * Gets the decimal precision for quantity display based on decimal settings
 * @param enableDecimals - Whether decimals are enabled
 * @returns Precision value (2 or 0)
 */
export function getQuantityPrecision(enableDecimals: boolean): number {
  return enableDecimals ? 2 : 0;
}

/**
 * Validates a quantity input value
 * @param value - The value to validate
 * @param enableDecimals - Whether decimals are enabled
 * @param min - Minimum allowed value (default 0)
 * @param max - Maximum allowed value (optional)
 * @returns True if valid, false otherwise
 */
export function isValidQuantity(
  value: number,
  enableDecimals: boolean,
  min: number = 0,
  max?: number
): boolean {
  if (isNaN(value) || value < min) {
    return false;
  }

  if (max !== undefined && value > max) {
    return false;
  }

  // If decimals are not enabled, check if value is an integer
  if (!enableDecimals && !Number.isInteger(value)) {
    return false;
  }

  return true;
}
