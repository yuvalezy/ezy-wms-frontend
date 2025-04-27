// Helper function to format quantities based on package quantity
export const formatValueByPack = (value: number | null | undefined, packUnit: number | null | undefined, displayPackage: boolean): string | number => {
  // Return 0 or empty string if value is null/undefined
  if (value == null) {
    return 0; // Or potentially '' depending on desired output for null/undefined
  }

  // If calculation should not be applied, or packUnit is invalid, return original value
  if (!displayPackage || !packUnit || packUnit <= 0) {
    return value;
  }

  const calculatedValue = value / packUnit;

  // Check if the result is an integer (has no decimal part)
  if (Number.isInteger(calculatedValue)) {
    return calculatedValue;
  } else {
    // Round to maximum 2 decimal places and convert back to number to remove trailing zeros if necessary
    return parseFloat(calculatedValue.toFixed(2));
    // Alternative using Math.round for potentially better handling of floating point issues:
    // return Math.round(calculatedValue * 100) / 100;
  }
};

