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
      setError("Please choose a .csv file");
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
      setError("Couldn't load the sample file");
      return;
    }
    const text = await response.text();
    const results = Papa.parse<Row>(text, PARSE_OPTIONS);
    setError(null);
    onLoad(toDataset(results, "customers.csv (sample)"));
  }

  return (
    <div className="mb-6">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault(); // allow dropping
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault(); // stop the browser opening the file
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) handleFile(file);
        }}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-10 text-center transition ${
          isDragging
            ? "border-gray-900 bg-gray-100"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <p className="font-medium">Drop a CSV here, or click to browse</p>
        <p className="mt-1 text-sm text-gray-500">Your data stays in your browser.</p>
      </div>

      {/* Hidden real file input: the box above "clicks" it for us */}
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = ""; // lets you re-upload the same file
        }}
      />

      <div className="mt-2 flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={loadSample}
          className="text-gray-600 underline hover:text-gray-900"
        >
          No CSV handy? Load sample data
        </button>
        {error && <span className="text-red-600">{error}</span>}
      </div>
    </div>
  );
}
