import { describeRule, summarise, type RuleResult } from "../lib/rules";

type RuleResultsProps = {
  results: RuleResult[];
  rowCount: number;
  onDelete: (ruleId: string) => void;
};

export function RuleResults({ results, rowCount, onDelete }: RuleResultsProps) {
  if (results.length === 0) {
    return (
      <section className="mb-6 rounded-lg border border-dashed p-6 text-center text-sm text-gray-500">
        No rules yet. Add one above to start checking your data.
      </section>
    );
  }

  const { score, cleanRows } = summarise(results, rowCount);

  const scoreColour =
    score >= 90 ? "text-green-600" : score >= 60 ? "text-amber-500" : "text-red-600";

  return (
    <section className="mb-6 rounded-lg border p-4">
      <div className="mb-4 flex items-baseline gap-3">
        <span className={`text-4xl font-bold ${scoreColour}`}>{score}%</span>
        <span className="text-sm text-gray-500">
          of rows pass every rule ({cleanRows}/{rowCount})
        </span>
      </div>

      <ul className="space-y-3">
        {results.map(({ rule, failures }) => (
          <li key={rule.id} className="text-sm">
            <div className="flex items-center gap-2">
              <span>{failures.length === 0 ? "✅" : "❌"}</span>
              <span className="font-medium">{describeRule(rule)}</span>
              {failures.length > 0 && (
                <span className="text-red-600">{failures.length} failing</span>
              )}
              <button
                onClick={() => onDelete(rule.id)}
                className="ml-auto text-xs text-gray-400 hover:text-red-600"
              >
                Remove
              </button>
            </div>

            {failures.length > 0 && (
              <ul className="ml-7 mt-1 text-gray-600">
                {failures.slice(0, 5).map((f) => (
                  <li key={f.rowIndex}>
                    Row {f.rowIndex + 1} · {f.column}
                    {f.value && ` "${f.value}"`} {f.message}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
