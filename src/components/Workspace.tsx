import { useEffect, useState } from "react";
import type { Dataset } from "../lib/data";
import { describeRule, runRules, summarise, type Rule } from "../lib/rules";
import { parseCsvFile } from "../lib/csv";
import {
  listDatasets,
  getDataset,
  createDataset,
  deleteDataset,
  updateDatasetData,
  listRules,
  createRule,
  deleteRule,
  listCheckRuns,
  createCheckRun,
  toSummary,
  type CheckRun,
  type DatasetSummary,
  type SavedDataset,
} from "../lib/db";
import { DatasetList } from "./DatasetList";
import { FileUpload } from "./FileUpload";
import { ColumnSummary } from "./ColumnSummary";
import { RuleBuilder } from "./RuleBuilder";
import { RuleResults } from "./RuleResults";
import { RunHistory } from "./RunHistory";
import { DataTable } from "./DataTable";

// Only rules whose column exists in this dataset
function activeRulesFor(dataset: Dataset, rules: Rule[]) {
  return rules.filter((r) => dataset.columns.includes(r.column));
}

export function Workspace() {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [dataset, setDataset] = useState<SavedDataset | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [runs, setRuns] = useState<CheckRun[]>([]);
  const [error, setError] = useState<string | null>(null);

  function showError(e: unknown) {
    setError(e instanceof Error ? e.message : "Something went wrong");
  }

  // Load the user's saved datasets once, when the workspace appears
  useEffect(() => {
    listDatasets().then(setDatasets).catch(showError);
  }, []);

  // "+ New dataset": clear the selection so the upload box shows
  function handleNew() {
    setDataset(null);
    setRules([]);
    setRuns([]);
    setError(null);
  }

  async function handleUpload(newDataset: Dataset) {
    try {
      const saved = await createDataset(newDataset);
      setDatasets((prev) => [toSummary(saved), ...prev]);
      setDataset(saved);
      setRules([]);
      setRuns([]);
      setError(null);
    } catch (e) {
      showError(e);
    }
  }

  async function handleSelect(id: string) {
    try {
      // Load the dataset, its rules and its history at the same time
      const [loaded, loadedRules, loadedRuns] = await Promise.all([
        getDataset(id),
        listRules(id),
        listCheckRuns(id),
      ]);
      setDataset(loaded);
      setRules(loadedRules);
      setRuns(loadedRuns);
      setError(null);
    } catch (e) {
      showError(e);
    }
  }

  async function handleDeleteDataset(id: string) {
    if (!window.confirm("Delete this dataset, its rules and its history?")) return;
    try {
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((d) => d.id !== id));
      if (dataset?.id === id) {
        setDataset(null);
        setRules([]);
        setRuns([]);
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

  // Run the rules against a dataset and save the result as a check run
  async function saveRun(target: SavedDataset, ruleList: Rule[]) {
    const active = activeRulesFor(target, ruleList);
    if (active.length === 0) return; // no rules = nothing meaningful to record

    const ruleResults = runRules(active, target.rows);
    const run = await createCheckRun(target.id, {
      ...summarise(ruleResults, target.rows.length),
      ruleCount: active.length,
      ruleResults: ruleResults.map((r) => ({
        description: describeRule(r.rule),
        failures: r.failures.length,
      })),
    });
    setRuns((prev) => [...prev, run]);
  }

  async function handleRecord() {
    if (!dataset) return;
    try {
      await saveRun(dataset, rules);
    } catch (e) {
      showError(e);
    }
  }

  async function handleNewVersion(file: File) {
    if (!dataset) return;
    try {
      const parsed = await parseCsvFile(file);
      await updateDatasetData(dataset.id, parsed);
      const updated: SavedDataset = { ...dataset, columns: parsed.columns, rows: parsed.rows };
      setDataset(updated);
      setDatasets((prev) =>
        prev.map((d) => (d.id === updated.id ? { ...d, rowCount: updated.rows.length } : d)),
      );
      await saveRun(updated, rules); // new data = automatically record a check
    } catch (e) {
      showError(e);
    }
  }

  // Derived state: recalculated on every render
  const activeRules = dataset ? activeRulesFor(dataset, rules) : [];
  const results = dataset ? runRules(activeRules, dataset.rows) : [];
  const allFailures = results.flatMap((r) => r.failures);

  return (
    <div className="grid gap-8 md:grid-cols-[14rem_1fr]">
      <DatasetList
        datasets={datasets}
        selectedId={dataset?.id ?? null}
        onSelect={handleSelect}
        onDelete={handleDeleteDataset}
        onNew={handleNew}
      />

      <div className="min-w-0">
        {error && <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {!dataset && <FileUpload onLoad={handleUpload} />}

        {dataset && (
          <>
            <p className="mb-4 text-sm text-gray-600">
              <strong>{dataset.fileName}</strong>: {dataset.rows.length} rows,{" "}
              {dataset.columns.length} columns
            </p>
            <ColumnSummary columns={dataset.columns} rows={dataset.rows} />
            <RuleBuilder
              key={dataset.id}
              columns={dataset.columns}
              rows={dataset.rows}
              onAdd={addRule}
            />
            <RuleResults results={results} rowCount={dataset.rows.length} onDelete={removeRule} />
            <RunHistory
              runs={runs}
              canRecord={activeRules.length > 0}
              onRecord={handleRecord}
              onNewVersion={handleNewVersion}
            />
            <DataTable columns={dataset.columns} rows={dataset.rows} failures={allFailures} />
          </>
        )}
      </div>
    </div>
  );
}
