import { useState } from "react";
import type { Dataset } from "./lib/data";
import { runRules, type Rule } from "./lib/rules";
import { FileUpload } from "./components/FileUpload";
import { ColumnSummary } from "./components/ColumnSummary";
import { RuleBuilder } from "./components/RuleBuilder";
import { RuleResults } from "./components/RuleResults";
import { DataTable } from "./components/DataTable";

// Starter rules for customers.csv, so the demo isn't empty
const DEMO_RULES: Rule[] = [
  { id: "r1", type: "unique", column: "id" },
  { id: "r2", type: "not_empty", column: "name" },
  { id: "r3", type: "email", column: "email" },
  { id: "r4", type: "range", column: "age", min: 0, max: 120 },
];

function App() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [rules, setRules] = useState<Rule[]>(DEMO_RULES);

  function addRule(rule: Rule) {
    setRules([...rules, rule]); // new array = React knows something changed
  }

  function deleteRule(ruleId: string) {
    setRules(rules.filter((r) => r.id !== ruleId));
  }

  // Only run rules whose column exists in this file
  const activeRules = dataset ? rules.filter((r) => dataset.columns.includes(r.column)) : [];
  const results = dataset ? runRules(activeRules, dataset.rows) : [];
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
          <RuleBuilder key={dataset.fileName} columns={dataset.columns} onAdd={addRule} />
          <RuleResults
            results={results}
            rowCount={dataset.rows.length}
            onDelete={deleteRule}
          />
          <DataTable columns={dataset.columns} rows={dataset.rows} failures={allFailures} />
        </>
      )}
    </main>
  );
}

export default App;
