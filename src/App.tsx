import { useState } from "react";
import type { Dataset } from "./lib/data";
import { runRules, type Rule } from "./lib/rules";
import { FileUpload } from "./components/FileUpload";
import { ColumnSummary } from "./components/ColumnSummary";
import { RuleResults } from "./components/RuleResults";
import { DataTable } from "./components/DataTable";

// Temporary: fixed rules for customers.csv. The rule builder UI replaces this next.
const DEMO_RULES: Rule[] = [
  { id: "r1", type: "unique", column: "id" },
  { id: "r2", type: "not_empty", column: "name" },
  { id: "r3", type: "not_empty", column: "email" },
  { id: "r4", type: "email", column: "email" },
  { id: "r5", type: "range", column: "age", min: 0, max: 120 },
  { id: "r6", type: "not_empty", column: "country" },
];

function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  // Derived state: recalculated whenever the dataset changes
  const results = dataset ? runRules(DEMO_RULES, dataset.rows) : [];
  const allFailures = results.flatMap((r) => r.failures);

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
          <RuleResults results={results} rowCount={dataset.rows.length} />
          <DataTable columns={dataset.columns} rows={dataset.rows} failures={allFailures} />
        </>
      )}
    </main>
  );
}

export default App;
