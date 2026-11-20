import { describe, it, expect } from "vitest";
import { runRules, describeRule, type Rule } from "./rules";
import type { Row } from "./data";

// A small, deliberately messy dataset
const rows: Row[] = [
  { id: "1", name: "Aiko", email: "aiko@example.com", age: "29" },
  { id: "2", name: "", email: "ben@example", age: "-5" },
  { id: "1", name: "Chloe", email: "", age: "abc" },
];

// Helper: run a single rule and return its failures
function failuresFor(rule: Rule) {
  return runRules([rule], rows)[0].failures;
}

describe("not_empty", () => {
  it("flags empty cells", () => {
    const failures = failuresFor({ id: "r", type: "not_empty", column: "name" });
    expect(failures.map((f) => f.rowIndex)).toEqual([1]);
    expect(failures[0].message).toBe("is empty");
  });
});

describe("unique", () => {
  it("flags the second occurrence of a duplicate", () => {
    const failures = failuresFor({ id: "r", type: "unique", column: "id" });
    expect(failures).toHaveLength(1);
    expect(failures[0].rowIndex).toBe(2);
    expect(failures[0].message).toBe("duplicates row 1");
  });

  it("ignores empty cells", () => {
    const emptyRows: Row[] = [{ code: "" }, { code: "" }];
    const [result] = runRules([{ id: "r", type: "unique", column: "code" }], emptyRows);
    expect(result.failures).toHaveLength(0);
  });
});

describe("email", () => {
  it("flags invalid emails but leaves empty cells to not_empty", () => {
    const failures = failuresFor({ id: "r", type: "email", column: "email" });
    expect(failures.map((f) => f.value)).toEqual(["ben@example"]);
  });
});

describe("range", () => {
  it("flags numbers outside the range and non-numbers", () => {
    const failures = failuresFor({ id: "r", type: "range", column: "age", min: 0, max: 120 });
    expect(failures.map((f) => f.message)).toEqual(["is below 0", "is not a number"]);
  });

  it("works with only a max", () => {
    const failures = failuresFor({ id: "r", type: "range", column: "age", max: 20 });
    expect(failures.map((f) => f.message)).toEqual(["is above 20", "is not a number"]);
  });

  it("treats the limits as allowed (inclusive)", () => {
    const edgeRows: Row[] = [{ age: "0" }, { age: "120" }];
    const [result] = runRules(
      [{ id: "r", type: "range", column: "age", min: 0, max: 120 }],
      edgeRows,
    );
    expect(result.failures).toHaveLength(0);
  });
});

describe("runRules", () => {
  it("returns one result per rule, in order", () => {
    const rules: Rule[] = [
      { id: "a", type: "not_empty", column: "name" },
      { id: "b", type: "unique", column: "id" },
    ];
    const results = runRules(rules, rows);
    expect(results.map((r) => r.rule.id)).toEqual(["a", "b"]);
  });
});

describe("describeRule", () => {
  it("describes range rules in plain English", () => {
    expect(describeRule({ id: "r", type: "range", column: "age", min: 0, max: 120 })).toBe(
      "age is between 0 and 120",
    );
    expect(describeRule({ id: "r", type: "range", column: "age", min: 18 })).toBe(
      "age is at least 18",
    );
  });
});
