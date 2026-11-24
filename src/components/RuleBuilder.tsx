import { useState } from "react";
import type { Rule } from "../lib/rules";
import { inferColumnKind, type ColumnKind, type Row } from "../lib/data";

type RuleType = Rule["type"];

const ALL_KINDS: ColumnKind[] = ["number", "email", "date", "text"];

const RULE_TYPES: { value: RuleType; label: string; kinds: ColumnKind[] }[] = [
  { value: "not_empty", label: "is never empty", kinds: ALL_KINDS },
  { value: "unique", label: "is unique", kinds: ALL_KINDS },
  { value: "email", label: "is a valid email", kinds: ["email"] },
  { value: "range", label: "is a number between", kinds: ["number"] },
];

type RuleBuilderProps = {
  columns: string[];
  rows: Row[];
  onAdd: (rule: Rule) => void;
};

export function RuleBuilder({ columns, rows, onAdd }: RuleBuilderProps) {
  const [column, setColumn] = useState(columns[0] ?? "");
  const [type, setType] = useState<RuleType>("not_empty");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const kinds = Object.fromEntries(columns.map((c) => [c, inferColumnKind(rows, c)]));
  const allowedTypes = RULE_TYPES.filter((t) => t.kinds.includes(kinds[column]));

  function handleColumnChange(newColumn: string) {
    setColumn(newColumn);
    const stillAllowed = RULE_TYPES.some(
      (t) => t.value === type && t.kinds.includes(kinds[newColumn]),
    );
    if (!stillAllowed) setType("not_empty");
  }

  function addRule() {
    if (!column) return;
    const id = crypto.randomUUID();

    if (type === "range") {
      onAdd({
        id,
        type,
        column,
        min: min === "" ? undefined : Number(min),
        max: max === "" ? undefined : Number(max),
      });
    } else {
      onAdd({ id, type, column });
    }

    setMin("");
    setMax("");
  }

  const inputClass = "h-9 rounded-md border bg-white px-2.5";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addRule();
      }}
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      <span className="mr-1 font-medium">Add a rule</span>

      <select
        aria-label="Column"
        value={column}
        onChange={(e) => handleColumnChange(e.target.value)}
        className={inputClass}
      >
        {columns.map((c) => (
          <option key={c} value={c}>
            {c} ({kinds[c]})
          </option>
        ))}
      </select>

      <select
        aria-label="Rule"
        value={type}
        onChange={(e) => setType(e.target.value as RuleType)}
        className={inputClass}
      >
        {allowedTypes.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {type === "range" && (
        <>
          <input
            type="number"
            aria-label="Minimum"
            placeholder="min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={`${inputClass} w-24`}
          />
          <span className="text-muted">and</span>
          <input
            type="number"
            aria-label="Maximum"
            placeholder="max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={`${inputClass} w-24`}
          />
        </>
      )}

      <button
        type="submit"
        className="h-9 rounded-md bg-ink px-3.5 font-medium text-white hover:bg-ink-soft"
      >
        Add rule
      </button>
    </form>
  );
}
