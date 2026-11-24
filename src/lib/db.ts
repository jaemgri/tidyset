import { supabase } from "./supabase";
import type { Dataset, Row } from "./data";
import type { Rule } from "./rules";

// What the app works with
export type SavedDataset = Dataset & { id: string; createdAt: string };
export type DatasetSummary = { id: string; name: string; rowCount: number; createdAt: string };

// What the database returns (snake_case column names)
type DatasetRecord = {
  id: string;
  name: string;
  column_names: string[];
  row_data: Row[];
  created_at: string;
};
type RuleRecord = {
  id: string;
  type: Rule["type"];
  column_name: string;
  params: { min?: number; max?: number };
};

// ---- Converters: database shape <-> app shape ----

function toSavedDataset(r: DatasetRecord): SavedDataset {
  return {
    id: r.id,
    fileName: r.name,
    columns: r.column_names,
    rows: r.row_data,
    createdAt: r.created_at,
  };
}

export function toSummary(d: SavedDataset): DatasetSummary {
  return { id: d.id, name: d.fileName, rowCount: d.rows.length, createdAt: d.createdAt };
}

function toRule(r: RuleRecord): Rule {
  if (r.type === "range") {
    return { id: r.id, type: "range", column: r.column_name, min: r.params.min, max: r.params.max };
  }
  return { id: r.id, type: r.type, column: r.column_name };
}

// ---- Datasets ----

export async function listDatasets(): Promise<DatasetSummary[]> {
  const { data, error } = await supabase
    .from("datasets")
    .select("id, name, row_count, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  return data.map((d) => ({
    id: d.id,
    name: d.name,
    rowCount: d.row_count,
    createdAt: d.created_at,
  }));
}

export async function getDataset(id: string): Promise<SavedDataset> {
  const { data, error } = await supabase
    .from("datasets")
    .select("id, name, column_names, row_data, created_at")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return toSavedDataset(data as DatasetRecord);
}

export async function createDataset(dataset: Dataset): Promise<SavedDataset> {
  const { data, error } = await supabase
    .from("datasets")
    .insert({
      name: dataset.fileName,
      column_names: dataset.columns,
      row_data: dataset.rows,
      row_count: dataset.rows.length,
    })
    .select("id, name, column_names, row_data, created_at")
    .single();
  if (error) throw new Error(error.message);
  return toSavedDataset(data as DatasetRecord);
}

export async function deleteDataset(id: string): Promise<void> {
  const { error } = await supabase.from("datasets").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Rules ----

export async function listRules(datasetId: string): Promise<Rule[]> {
  const { data, error } = await supabase
    .from("rules")
    .select("id, type, column_name, params")
    .eq("dataset_id", datasetId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data as RuleRecord[]).map(toRule);
}

export async function createRule(datasetId: string, rule: Rule): Promise<void> {
  const { error } = await supabase.from("rules").insert({
    id: rule.id, // reuse the id the rule builder generated
    dataset_id: datasetId,
    type: rule.type,
    column_name: rule.column,
    params: rule.type === "range" ? { min: rule.min, max: rule.max } : {},
  });
  if (error) throw new Error(error.message);
}

export async function deleteRule(id: string): Promise<void> {
  const { error } = await supabase.from("rules").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Check runs ----

export type CheckRun = {
  id: string;
  createdAt: string;
  score: number;
  cleanRows: number;
  totalRows: number;
  ruleCount: number;
  ruleResults: { description: string; failures: number }[];
};

type CheckRunRecord = {
  id: string;
  created_at: string;
  score: number;
  clean_rows: number;
  total_rows: number;
  rule_count: number;
  rule_results: { description: string; failures: number }[];
};

const CHECK_RUN_COLUMNS = "id, created_at, score, clean_rows, total_rows, rule_count, rule_results";

function toCheckRun(r: CheckRunRecord): CheckRun {
  return {
    id: r.id,
    createdAt: r.created_at,
    score: r.score,
    cleanRows: r.clean_rows,
    totalRows: r.total_rows,
    ruleCount: r.rule_count,
    ruleResults: r.rule_results,
  };
}

export async function listCheckRuns(datasetId: string): Promise<CheckRun[]> {
  const { data, error } = await supabase
    .from("check_runs")
    .select(CHECK_RUN_COLUMNS)
    .eq("dataset_id", datasetId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data as CheckRunRecord[]).map(toCheckRun);
}

export async function createCheckRun(
  datasetId: string,
  run: Omit<CheckRun, "id" | "createdAt">,
): Promise<CheckRun> {
  const { data, error } = await supabase
    .from("check_runs")
    .insert({
      dataset_id: datasetId,
      score: run.score,
      clean_rows: run.cleanRows,
      total_rows: run.totalRows,
      rule_count: run.ruleCount,
      rule_results: run.ruleResults,
    })
    .select(CHECK_RUN_COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return toCheckRun(data as CheckRunRecord);
}

// Replace a dataset's data with a new version (rules and history are kept)
export async function updateDatasetData(id: string, dataset: Dataset): Promise<void> {
  const { error } = await supabase
    .from("datasets")
    .update({
      column_names: dataset.columns,
      row_data: dataset.rows,
      row_count: dataset.rows.length,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Demo ----

export async function seedDemoWorkspace(): Promise<void> {
  const { error } = await supabase.rpc("seed_demo_workspace");
  if (error) throw new Error(error.message);
}
