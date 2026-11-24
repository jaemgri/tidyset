import { useRef, useState } from "react";
import Papa, { type ParseResult } from "papaparse";
import type { Dataset, Row } from "../lib/data";

type FileUploadProps = {
  onLoad: (dataset: Dataset) => void;
};

const PARSE_OPTIONS = { header: true, skipEmptyLines: true };

function toDataset(results: ParseResult<Row>, fileName: string): Dataset {
  return {
    fileName,
    columns: results.meta.fields ?? [],
    rows: results.data,
  };
}

export function FileUpload({ onLoad }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("That isn't a CSV file. Choose a file ending in .csv.");
      return;
    }
    setError(null);
    Papa.parse<Row>(file, {
      ...PARSE_OPTIONS,
      complete: (results) => onLoad(toDataset(results, file.name)),
    });
  }

  async function loadSample() {
    const response = await fetch("/samples/customers.csv");
    if (!response.ok) {
      setError("The sample file couldn't be loaded. Try again.");
      return;
    }
    const text = await response.text();
    const results = Papa.parse<Row>(text, PARSE_OPTIONS);
    setError(null);
    onLoad(toDataset(results, "customers.csv (sample)"));
  }

  return (
    <div className="mb-8">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors ${
          isDragging ? "border-ink bg-white" : "bg-white/60 hover:border-muted hover:bg-white"
        }`}
      >
        <p className="text-base font-medium">Drop a CSV file here</p>
        <p className="mt-1 text-sm text-muted">
          or <span className="text-ink underline underline-offset-4">browse your computer</span>.
          It's saved privately to your account.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <button
          type="button"
          onClick={loadSample}
          className="font-medium underline underline-offset-4"
        >
          Try it with sample data
        </button>
        {error && (
          <span role="alert" className="text-red-700">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
