import { useState } from "react";
import type { Rule } from "../lib/rules";

type RuleType = Rule["type"]; // "not_empty" | "unique" | "email" | "range"

const RULE_TYPES: { value: RuleType; label: string }[] = [
  { value: "not_empty", label: "is never empty" },
  { value: "unique", label: "is unique" },
  { value: "email", label: "is a valid email" },
  { value: "range", label: "is a number between" },
];

type RuleBuilderProps = {
  columns: string[];
  onAdd: (rule: Rule) => void;
};

export function RuleBuilder({ columns, onAdd }: RuleBuilderProps) {
  const [column, setColumn] = useState(columns[0] ?? "");
  const [type, setType] = useState<RuleType>("not_empty");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

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

  const inputClass = "h-8 rounded border bg-white px-2";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // stop the browser reloading the page
        addRule();
      }}
      className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border bg-gray-50 p-4 text-sm"
    >
      <span className="font-medium">Add rule:</span>

      <select value={column} onChange={(e) => setColumn(e.target.value)} className={inputClass}>
        {columns.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={type}
        onChange={(e) => setType(e.target.value as RuleType)}
        className={inputClass}
      >
        {RULE_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {type === "range" && (
        <>
          <input
            type="number"
            placeholder="min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className={`${inputClass} w-20`}
          />
          <span>and</span>
          <input
            type="number"
            placeholder="max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className={`${inputClass} w-20`}
          />
        </>
      )}

      <button
        type="submit"
        className="h-8 rounded bg-gray-900 px-3 font-medium text-white hover:bg-gray-700"
      >
        Add
      </button>
    </form>
  );
}
