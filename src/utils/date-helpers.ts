// Function to check if a string is a valid UTC date
export const isUTCDate = (value: unknown): boolean => {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(value)
  );
};

// Recursive function to convert UTC date strings to Date objects
export const convertUTCStringsToDates = (data: any): any => {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(item => {
      if (isUTCDate(item)) {
        return new Date(item.substring(0, item.length - 1)); // Convert to Date object
      }
      return convertUTCStringsToDates(item);
    });
  }

  return Object.keys(data).reduce((acc, key) => {
    const value = data[key];

    if (isUTCDate(value)) {
      acc[key] = new Date(value.substring(0, value.length - 1)); // Convert to Date object
    } else if (typeof value === "object" && value !== null) {
      acc[key] = convertUTCStringsToDates(value); // Recursively process objects
    } else {
      acc[key] = value;
    }

    return acc;
  }, {} as Record<string, any>);
};
