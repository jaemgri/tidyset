import { useState } from "react";
import type { Dataset } from "./lib/data";
import { FileUpload } from "./components/FileUpload";
import { ColumnSummary } from "./components/ColumnSummary";
import { DataTable } from "./components/DataTable";

function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">Tidyset</h1>
      <p className="mb-6 text-gray-500">Know your data is clean.</p>

      <FileUpload onLoad={setDataset} />

      {dataset && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            <strong>{dataset.fileName}</strong>: {dataset.rows.length} rows,{" "}
            {dataset.columns.length} columns
          </p>
          <ColumnSummary columns={dataset.columns} rows={dataset.rows} />
          <DataTable columns={dataset.columns} rows={dataset.rows} />
        </>
      )}
    </main>
  );
}

export default App;
