import { useEffect, useState } from "react";
import type { Dataset } from "../lib/data";
import { describeRule, isSameRule, runRules, summarise, type Rule } from "../lib/rules";
import { parseCsvFile } from "../lib/csv";
import { supabase } from "../lib/supabase";
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
  seedDemoWorkspace,
  toSummary,
  type CheckRun,
  type DatasetSummary,
  type SavedDataset,
} from "../lib/db";
import { Logo } from "./Logo";
import { DatasetList } from "./DatasetList";
import { FileUpload } from "./FileUpload";
import { RuleBuilder } from "./RuleBuilder";
import { RuleResults } from "./RuleResults";
import { RunHistory } from "./RunHistory";
import { DataTable } from "./DataTable";

type WorkspaceProps = {
  userEmail: string;
  isDemo: boolean;
};

function activeRulesFor(dataset: Dataset, rules: Rule[]) {
  return rules.filter((r) => dataset.columns.includes(r.column));
}

export function Workspace({ userEmail, isDemo }: WorkspaceProps) {
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [dataset, setDataset] = useState<SavedDataset | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [runs, setRuns] = useState<CheckRun[]>([]);
  const [error, setError] = useState<string | null>(null);

  function showError(e: unknown) {
    setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
  }

  // On load: seed the demo if needed, then fetch datasets.
  // In the demo, open the first dataset straight away.
  useEffect(() => {
    async function load() {
      if (isDemo) await seedDemoWorkspace();
      const list = await listDatasets();
      setDatasets(list);
      if (isDemo && list.length > 0) await handleSelect(list[0].id);
    }
    load().catch(showError);
  }, [isDemo]);

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
    if (rules.some((r) => isSameRule(r, rule))) {
      setError(`“${describeRule(rule)}” is already a rule on this dataset.`);
      return;
    }
    try {
      await createRule(dataset.id, rule);
      setRules((prev) => [...prev, rule]);
      setError(null);
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

  async function saveRun(target: SavedDataset, ruleList: Rule[]) {
    const active = activeRulesFor(target, ruleList);
    if (active.length === 0) return;

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
      await saveRun(updated, rules);
    } catch (e) {
      showError(e);
    }
  }

  const activeRules = dataset ? activeRulesFor(dataset, rules) : [];
  const results = dataset ? runRules(activeRules, dataset.rows) : [];
  const allFailures = results.flatMap((r) => r.failures);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="flex flex-col border-b bg-white md:sticky md:top-0 md:h-screen md:border-r md:border-b-0">
        <div className="px-5 pt-6 pb-6">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          <DatasetList
            datasets={datasets}
            selectedId={dataset?.id ?? null}
            onSelect={handleSelect}
            onDelete={handleDeleteDataset}
            onNew={handleNew}
          />
        </div>
        <div className="border-t px-5 py-4 text-sm">
          {isDemo ? (
            <>
              <p className="font-medium">Demo workspace</p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="mt-0.5 text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                Exit demo
              </button>
            </>
          ) : (
            <>
              <p className="truncate text-muted">{userEmail}</p>
              <button
                onClick={() => supabase.auth.signOut()}
                className="mt-0.5 font-medium underline-offset-4 hover:underline"
              >
                Log out
              </button>
            </>
          )}
        </div>
      </aside>

      <main className="min-w-0 px-5 py-8 md:px-10 md:py-10">
        <div className="max-w-5xl">
          {isDemo && (
            <p className="mb-8 rounded-lg border bg-white px-4 py-3 text-sm">
              You're exploring a demo workspace with sample data. Try adding a rule, or upload a
              new version of a dataset. Everything resets when you exit the demo.
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mb-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800"
            >
              {error}
            </p>
          )}

          {!dataset && (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Check a new dataset</h1>
              <p className="mt-1 mb-8 max-w-prose text-muted">
                Upload a CSV and set the rules it should follow. Tidyset checks every row and keeps
                a history as the data changes.
              </p>
              <FileUpload onLoad={handleUpload} />
            </>
          )}

          {dataset && (
            <>
              <header className="mb-10">
                <h1 className="text-2xl font-semibold tracking-tight">{dataset.fileName}</h1>
                <p className="mt-1 text-sm text-muted">
                  {dataset.rows.length} rows, {dataset.columns.length} columns
                </p>
              </header>

              <section className="mb-10">
                <h2 className="mb-3 text-base font-semibold">Checks</h2>
                <div className="rounded-xl border bg-white">
                  <RuleResults
                    results={results}
                    rowCount={dataset.rows.length}
                    onDelete={removeRule}
                  />
                  <div className="border-t px-5 py-4">
                    <RuleBuilder
                      key={dataset.id}
                      columns={dataset.columns}
                      rows={dataset.rows}
                      onAdd={addRule}
                    />
                  </div>
                </div>
              </section>

              <section className="mb-10">
                <h2 className="mb-3 text-base font-semibold">Quality over time</h2>
                <RunHistory
                  runs={runs}
                  canRecord={activeRules.length > 0}
                  onRecord={handleRecord}
                  onNewVersion={handleNewVersion}
                />
              </section>

              <section className="mb-10">
                <h2 className="text-base font-semibold">Data</h2>
                <p className="mt-0.5 mb-3 text-sm text-muted">
                  Highlighted values break at least one rule. Hover over one to see why.
                </p>
                <DataTable
                  columns={dataset.columns}
                  rows={dataset.rows}
                  failures={allFailures}
                />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
