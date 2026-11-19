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
