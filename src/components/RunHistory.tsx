import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CheckRun } from "../lib/db";

type RunHistoryProps = {
  runs: CheckRun[];
  canRecord: boolean;
  onRecord: () => void;
  onNewVersion: (file: File) => void;
};

const LINE_COLOUR = "#2a78d6";
const AXIS_TEXT = { fontSize: 12, fill: "#6b7280" };

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RunHistory({ runs, canRecord, onRecord, onNewVersion }: RunHistoryProps) {
  const chartData = runs.map((r) => ({ label: formatTime(r.createdAt), score: r.score }));

  const latest = runs.at(-1);
  const previous = runs.at(-2);
  const change = latest && previous ? latest.score - previous.score : null;

  return (
    <section className="mb-6 rounded-lg border p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">Quality over time</h2>
          {change !== null && (
            <p className="text-sm text-gray-500">
              {change === 0 ? "No change" : `${change > 0 ? "▲ +" : "▼ "}${change} pts`} since the
              previous check
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm">
          <label className="cursor-pointer text-gray-600 underline hover:text-gray-900">
            Upload new version
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onNewVersion(file);
                e.target.value = "";
              }}
            />
          </label>
          <button
            onClick={onRecord}
            disabled={!canRecord}
            title={canRecord ? undefined : "Add at least one rule first"}
            className="h-8 rounded bg-gray-900 px-3 font-medium text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Record check
          </button>
        </div>
      </div>

      {runs.length < 2 ? (
        <p className="text-sm text-gray-500">
          {runs.length === 0
            ? canRecord
              ? "No checks recorded yet. Click “Record check” to save today's score."
              : "Add a rule, then record a check to start tracking quality over time."
            : "One check recorded. Upload a new version of the data to see the trend."}
        </p>
      ) : (
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                tick={AXIS_TEXT}
                tickLine={false}
                axisLine={{ stroke: "#d1d5db" }}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={AXIS_TEXT}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Quality score"]}
                cursor={{ stroke: "#9ca3af", strokeDasharray: "3 3" }}
              />
              <Line
                type="linear"
                dataKey="score"
                stroke={LINE_COLOUR}
                strokeWidth={2}
                dot={{ r: 4, fill: LINE_COLOUR, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {runs.length > 0 && (
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-gray-500">
            <tr>
              <th className="py-1 font-medium">When</th>
              <th className="py-1 font-medium">Score</th>
              <th className="py-1 font-medium">Clean rows</th>
              <th className="py-1 font-medium">Rules</th>
            </tr>
          </thead>
          <tbody>
            {[...runs]
              .reverse()
              .slice(0, 5)
              .map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-1.5">{formatTime(r.createdAt)}</td>
                  <td className="py-1.5 font-medium">{r.score}%</td>
                  <td className="py-1.5">
                    {r.cleanRows}/{r.totalRows}
                  </td>
                  <td className="py-1.5">{r.ruleCount}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
