import { CustomField, CustomFieldType } from "@/features/items/data/items";

export function formatCustomFieldValue(field: CustomField, value: unknown, dateFormat: (date: Date) => string): string | null {
  if (value == null) {
    return null;
  }

  switch (field.type) {
    case CustomFieldType.Date:
      return dateFormat(value as Date);
    default:
      return value.toString();
  }
}

export function renderCustomFields<T>(
  customFields: Record<string, unknown> | undefined,
  availableFields: CustomField[],
  dateFormat: (date: Date) => string,
  renderFunction: (field: CustomField, value: string | null, index: number) => T
): T[] {
  return availableFields.map((field, index) => {
    const customFieldValue = customFields?.[field.key];
    const formattedValue = formatCustomFieldValue(field, customFieldValue, dateFormat);
    return renderFunction(field, formattedValue, index);
  });
}