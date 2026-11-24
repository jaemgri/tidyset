// One row of the CSV: column name -> cell value
export type Row = Record<string, string>;

// A parsed CSV file
export type Dataset = {
  fileName: string;
  columns: string[];
  rows: Row[];
};

export function isEmpty(value: string | undefined): boolean {
  return !value || value.trim() === "";
}

export type ColumnKind = "number" | "email" | "date" | "text";

// Guess a column's kind by looking at its non-empty values.
// If 80%+ of values look like a number/email/date, that's its kind.
// (80%, not 100%, because the column might contain mistakes!)
export function inferColumnKind(rows: Row[], column: string): ColumnKind {
  const values = rows.map((row) => row[column]).filter((v) => !isEmpty(v));
  if (values.length === 0) return "text";

  const share = (test: (v: string) => boolean) =>
    values.filter(test).length / values.length;

  if (share((v) => !Number.isNaN(Number(v))) >= 0.8) return "number";
  if (share((v) => v.includes("@")) >= 0.8) return "email";
  if (share((v) => !Number.isNaN(Date.parse(v))) >= 0.8) return "date";
  return "text";
}
