import { useEffect, useState } from "react";
import type { Dataset } from "../lib/data";
import { runRules, type Rule } from "../lib/rules";
import {
  listDatasets,
  getDataset,
  createDataset,
  deleteDataset,
  listRules,
  createRule,
  deleteRule,
  toSummary,
  type DatasetSummary,
  type SavedDataset,
} from "../lib/db";
import { DatasetList } from "./DatasetList";
import { FileUpload } from "./FileUpload";
import { ColumnSummary } from "./ColumnSummary";
import { RuleBuilder } from "./RuleBuilder";
import { RuleResults } from "./RuleResults";
import { DataTable } from "./DataTable";

export function Workspace() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [dataset, setDataset] = useState<SavedDataset | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);

  function showError(e: unknown) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  }

  // Load the user's saved datasets once, when the workspace appears
  useEffect(() => {
    listDatasets().then(setDatasets).catch(showError);
  }, []);

  async function handleUpload(newDataset: Dataset) {
    try {
      const saved = await createDataset(newDataset);
      setDatasets((prev) => [toSummary(saved), ...prev]);
      setDataset(saved);
      setRules([]);
      setError(null);
    } catch (e) {
      showError(e);
    }
  }

  async function handleSelect(id: string) {
    try {
      // Load the dataset and its rules at the same time
      const [loaded, loadedRules] = await Promise.all([getDataset(id), listRules(id)]);
      setDataset(loaded);
      setRules(loadedRules);
      setError(null);
    } catch (e) {
      showError(e);
    }
  }

  async function handleDeleteDataset(id: string) {
    if (!window.confirm("Delete this dataset and its rules?")) return;
    try {
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      if (dataset?.id === id) {
        setDataset(null);
        setRules([]);
      }
    } catch (e) {
      showError(e);
    }
  }

  async function addRule(rule: Rule) {
    if (!dataset) return;
    try {
      await createRule(dataset.id, rule);
      setRules((prev) => [...prev, rule]);
    } catch (e) {
      showError(e);
    }
  }

  async function removeRule(ruleId: string) {
    try {
      await deleteRule(ruleId);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
    } catch (e) {
      showError(e);
    }
  }

  const activeRules = dataset ? rules.filter((r) => dataset.columns.includes(r.column)) : [];
  const results = dataset ? runRules(activeRules, dataset.rows) : [];
  const allFailures = results.flatMap((r) => r.failures);

  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <DatasetList
        datasets={datasets}
        selectedId={dataset?.id ?? null}
        onSelect={handleSelect}
        onDelete={handleDeleteDataset}
      />

      <div className="min-w-0">
        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        <FileUpload onLoad={handleUpload} />

        {dataset && (
          <>
            <p className="mb-4 text-sm text-gray-600">
              <strong>{dataset.fileName}</strong>: {dataset.rows.length} rows,{" "}
              {dataset.columns.length} columns
            </p>
            <ColumnSummary columns={dataset.columns} rows={dataset.rows} />
            <RuleBuilder key={dataset.id} columns={dataset.columns} rows={dataset.rows} onAdd={addRule}  />
            <RuleResults results={results} rowCount={dataset.rows.length} onDelete={removeRule} />
            <DataTable columns={dataset.columns} rows={dataset.rows} failures={allFailures} />
          </>
        )}
      </div>
    </div>
  );
}
