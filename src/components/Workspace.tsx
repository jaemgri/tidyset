import { useState } from "react";
import type { Dataset } from "../lib/data";
import { runRules, type Rule } from "../lib/rules";
import { FileUpload } from "./FileUpload";
import { ColumnSummary } from "./ColumnSummary";
import { RuleBuilder } from "./RuleBuilder";
import { RuleResults } from "./RuleResults";
import { DataTable } from "./DataTable";

const DEMO_RULES: Rule[] = [
  { id: "r1", type: "unique", column: "id" },
  { id: "r2", type: "not_empty", column: "name" },
  { id: "r3", type: "email", column: "email" },
  { id: "r4", type: "range", column: "age", min: 0, max: 120 },
];

export function Workspace() {
  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [rules, setRules] = useState<Rule[]>(DEMO_RULES);

  function addRule(rule: Rule) {
    setRules([...rules, rule]);
  }

  function deleteRule(ruleId: string) {
    setRules(rules.filter((r) => r.id !== ruleId));
  }

  const activeRules = dataset ? rules.filter((r) => dataset.columns.includes(r.column)) : [];
  const results = dataset ? runRules(activeRules, dataset.rows) : [];
  const allFailures = results.flatMap((r) => r.failures);

  return (
    <>
      <FileUpload onLoad={setDataset} />

      {dataset && (
        <>
          <p className="mb-4 text-sm text-gray-600">
            <strong>{dataset.fileName}</strong>: {dataset.rows.length} rows,{" "}
            {dataset.columns.length} columns
          </p>
          <ColumnSummary columns={dataset.columns} rows={dataset.rows} />
          <RuleBuilder key={dataset.fileName} columns={dataset.columns} onAdd={addRule} />
          <RuleResults results={results} rowCount={dataset.rows.length} onDelete={deleteRule} />
          <DataTable columns={dataset.columns} rows={dataset.rows} failures={allFailures} />
        </>
      )}
    </>
  );
}
