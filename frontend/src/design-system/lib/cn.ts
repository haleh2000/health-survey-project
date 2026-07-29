type ClassValue = string | false | null | undefined;

/** Joins conditional class names. Keeps JSX readable without pulling in clsx. */
export const cn = (...values: ClassValue[]): string =>
  values.filter(Boolean).join(" ");
