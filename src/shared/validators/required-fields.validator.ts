/**
 * Required-fields validator.
 *
 * Returns `true` only when every named field in `fields` is present in
 * `record` and not an empty string / null / undefined.
 */

export const hasAllRequiredFields = (
  record: Record<string, unknown>,
  fields: string[]
): boolean =>
  fields.every((field) => {
    const value = record[field];
    return value !== undefined && value !== null && value !== "";
  });
