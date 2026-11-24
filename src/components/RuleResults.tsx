import { describeRule, summarise, type RuleResult } from "../lib/rules";

type RuleResultsProps = {
  results: RuleResult[];
  rowCount: number;
  onDelete: (ruleId: string) => void;
};

const MAX_TICKS = 200; // above this, show a single bar instead of one block per row

export function RuleResults({ results, rowCount, onDelete }: RuleResultsProps) {
  if (results.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="font-medium">Add your first rule</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted">
          Rules describe what clean data looks like, such as “email is a valid email”. Tidyset
          checks every row against them.
        </p>
      </div>
    );
  }

  const { score, cleanRows } = summarise(results, rowCount);
  const failedRows = new Set(results.flatMap((r) => r.failures.map((f) => f.rowIndex)));

  return (
    <div>
      {/* Score + legend */}
      <div className="flex flex-wrap items-end justify-between gap-4 px-5 pt-5 pb-4">
        <div>
          <p className="text-4xl font-semibold tracking-tight tabular-nums">{score}%</p>
          <p className="mt-1 text-sm text-muted">
            of rows pass every rule ({cleanRows} of {rowCount})
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-pass" aria-hidden="true" />
            Clean
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2.5 rounded-sm bg-marker" aria-hidden="true" />
            Needs fixing
          </span>
        </div>
      </div>

      {/* Row strip: one block per row */}
      {rowCount <= MAX_TICKS ? (
        <div className="flex flex-wrap gap-[3px] px-5 pb-5" aria-hidden="true">
          {Array.from({ length: rowCount }, (_, i) => (
            <span
              key={i}
              title={`Row ${i + 1}`}
              className={`h-5 w-3 rounded-[3px] ${failedRows.has(i) ? "bg-marker" : "bg-pass"}`}
            />
          ))}
        </div>
      ) : (
        <div className="mx-5 mb-5 flex h-3 overflow-hidden rounded-full" aria-hidden="true">
          <span className="bg-pass" style={{ width: `${(cleanRows / rowCount) * 100}%` }} />
          <span className="flex-1 bg-marker" />
        </div>
      )}

      {/* Rule list */}
      <ul className="border-t">
        {results.map(({ rule, failures }) => (
          <li key={rule.id} className="border-b px-5 py-3.5 last:border-b-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-medium">{describeRule(rule)}</span>
              {failures.length === 0 ? (
                <span className="text-pass">All rows pass</span>
              ) : (
                <span className="marker text-xs font-medium">{failures.length} failing</span>
              )}
              <button
                onClick={() => onDelete(rule.id)}
                className="ml-auto text-xs text-muted hover:text-red-700"
              >
                Remove
              </button>
            </div>

            {failures.length > 0 && (
              <ul className="mt-2 space-y-1 text-sm">
                {failures.slice(0, 5).map((f) => (
                  <li key={f.rowIndex} className="flex gap-3">
                    <span className="w-14 shrink-0 text-muted tabular-nums">Row {f.rowIndex + 1}</span>
                    <span>
                      {f.value ? (
                        <>
                          <span className="font-mono text-[13px]">“{f.value}”</span>{" "}
                          <span className="text-muted">{f.message}</span>
                        </>
                      ) : (
                        <span className="text-muted">
                          {f.column} {f.message}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
                {failures.length > 5 && (
                  <li className="pl-[4.25rem] text-muted">and {failures.length - 5} more</li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
