import { useState, type ChangeEvent } from "react";
import Papa from "papaparse";

// One row of the CSV: column name -> cell value
type Row = Record<string, string>;

function App() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<Row[]>([]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setFileName(file.name);
        setColumns(results.meta.fields ?? []);
        setRows(results.data);
      },
    });
  }

    const emptyCounts = columns.map((col) => ({
      column: col,
      empty: rows.filter((row) => !row[col] || row[col].trim() === "").length,
    }));

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold">Tidyset</h1>
      <p className="mb-6 text-gray-500">Know your data is clean.</p>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-6 block"
      />

      {fileName && (
        <p className="mb-4 text-sm text-gray-600">
          <strong>{fileName}</strong>: {rows.length} rows, {columns.length} columns
                {rows.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {emptyCounts.map(({ column, empty }) => (
            <span
              key={column}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                empty > 0 ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {column}: {empty === 0 ? "✓ complete" : `${empty} empty`}
            </span>
          ))}
        </div>
      )}
        </p>
      )}

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-3 py-2 text-left font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 50).map((row, i) => (
                <tr key={i} className="border-t">
                  {columns.map((col) => {
                    const value = row[col];
                    const isEmpty = !value || value.trim() === "";
                    return (
                      <td
                        key={col}
                        className={`px-3 py-2 ${isEmpty ? "bg-red-50 text-red-500" : ""}`}
                      >
                        {isEmpty ? "empty" : value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default App;
