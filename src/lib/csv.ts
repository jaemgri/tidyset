import Papa from "papaparse";
import type { Dataset, Row } from "./data";

export function parseCsvFile(file: File): Promise<Dataset> {
  return new Promise((resolve, reject) => {
    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) =>
        resolve({
          fileName: file.name,
          columns: results.meta.fields ?? [],
          rows: results.data,
        }),
      error: (err) => reject(err),
    });
  });
}
