import type { ChangeEvent } from "react";
import Papa from "papaparse";
import type { Dataset, Row } from "../lib/data";

type FileUploadProps = {
  onLoad: (dataset: Dataset) => void;
};

export function FileUpload({ onLoad }: FileUploadProps) {
  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        onLoad({
          fileName: file.name,
          columns: results.meta.fields ?? [],
          rows: results.data,
        });
      },
    });
  }

  return (
    <input
      type="file"
      accept=".csv"
      onChange={handleFileChange}
      className="mb-6 block"
    />
  );
}
