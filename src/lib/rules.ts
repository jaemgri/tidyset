import { isEmpty, type Row } from "./data";

// Every kind of rule Tidyset supports.
// "type" tells TypeScript which extra fields each rule has.
export type Rule =
  | { id: string; type: "not_empty"; column: string }
  | { id: string; type: "unique"; column: string }
  | { id: string; type: "email"; column: string }
  | { id: string; type: "range"; column: string; min?: number; max?: number };

// One broken cell
export type Failure = {
  ruleId: string;
  rowIndex: number;
  column: string;
  value: string;
  message: string;
};

export type RuleResult = {
  rule: Rule;
  failures: Failure[];
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Human-readable description, e.g. "age is between 0 and 120"
export function describeRule(rule: Rule): string {
  switch (rule.type) {
    case "not_empty":
      return `${rule.column} is never empty`;
    case "unique":
      return `${rule.column} is unique`;
    case "email":
      return `${rule.column} is a valid email`;
    case "range": {
      if (rule.min !== undefined && rule.max !== undefined)
        return `${rule.column} is between ${rule.min} and ${rule.max}`;
      if (rule.min !== undefined) return `${rule.column} is at least ${rule.min}`;
      if (rule.max !== undefined) return `${rule.column} is at most ${rule.max}`;
      return `${rule.column} is a number`;
    }
  }
}

// Check one rule against every row
function checkRule(rule: Rule, rows: Row[]): Failure[] {
  const failures: Failure[] = [];
  const seen = new Map<string, number>(); // for "unique": value -> first row it appeared in

  rows.forEach((row, rowIndex) => {
    const value = row[rule.column] ?? "";

    function fail(message: string) {
      failures.push({ ruleId: rule.id, rowIndex, column: rule.column, value, message });
    }

    switch (rule.type) {
      case "not_empty":
        if (isEmpty(value)) fail("is empty");
        break;

      case "unique": {
        if (isEmpty(value)) break;
        const firstRow = seen.get(value);
        if (firstRow !== undefined) fail(`duplicates row ${firstRow + 1}`);
        else seen.set(value, rowIndex);
        break;
      }

      case "email":
        if (isEmpty(value)) break; // empty cells are the "not_empty" rule's job
        if (!EMAIL_PATTERN.test(value)) fail("is not a valid email");
        break;

      case "range": {
        if (isEmpty(value)) break;
        const num = Number(value);
        if (Number.isNaN(num)) fail("is not a number");
        else if (rule.min !== undefined && num < rule.min) fail(`is below ${rule.min}`);
        else if (rule.max !== undefined && num > rule.max) fail(`is above ${rule.max}`);
        break;
      }
    }
  });

  return failures;
}

// Run every rule and collect the results
export function runRules(rules: Rule[], rows: Row[]): RuleResult[] {
  return rules.map((rule) => ({ rule, failures: checkRule(rule, rows) }));
}

export function summarise(results: RuleResult[], rowCount: number) {
  const failedRows = new Set(results.flatMap((r) => r.failures.map((f) => f.rowIndex)));
  const cleanRows = rowCount - failedRows.size;
  const score = rowCount === 0 ? 100 : Math.round((cleanRows / rowCount) * 100);
  return { score, cleanRows, totalRows: rowCount };
}
