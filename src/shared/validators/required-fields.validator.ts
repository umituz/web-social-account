
export const hasAllRequiredFields = (
  record: Record<string, unknown>,
  fields: string[]
): boolean =>
  fields.every((field) => {
    const value = record[field];
    return value !== undefined && value !== null && value !== "";
  });
