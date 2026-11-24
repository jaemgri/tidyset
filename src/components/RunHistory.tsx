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

// Match the design tokens in index.css
const INK = "#1b2333";
const MUTED = "#5e6778";
const LINE = "#e1e5eb";
const AXIS_TEXT = { fontSize: 12, fill: MUTED, fontFamily: "IBM Plex Sans" };

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

  let summary: string;
  if (change !== null) {
    summary =
      change === 0
        ? "No change since the previous check."
        : `${change > 0 ? "▲ Up" : "▼ Down"} ${Math.abs(change)} points since the previous check.`;
  } else if (runs.length === 1) {
    summary = "One check recorded. Upload a new version of the data to see the trend.";
  } else if (canRecord) {
    summary = "Record a check to save today's score.";
  } else {
    summary = "Add a rule, then record a check to start tracking quality.";
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{summary}</p>

        <div className="flex items-center gap-2 text-sm">
          <label className="flex h-9 cursor-pointer items-center rounded-md border px-3 font-medium hover:bg-paper">
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
            className="h-9 rounded-md bg-ink px-3.5 font-medium text-white hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            Record check
          </button>
        </div>
      </div>

      {runs.length >= 2 && (
        <div className="mt-6 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis
                dataKey="label"
                tick={AXIS_TEXT}
                tickLine={false}
                axisLine={{ stroke: LINE }}
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
                cursor={{ stroke: MUTED, strokeDasharray: "3 3" }}
                contentStyle={{
                  borderRadius: 8,
                  border: `1px solid ${LINE}`,
                  fontFamily: "IBM Plex Sans",
                  fontSize: 13,
                }}
              />
              <Line
                type="linear"
                dataKey="score"
                stroke={INK}
                strokeWidth={2}
                dot={{ r: 4, fill: INK, stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {runs.length > 0 && (
        <table className="mt-5 w-full text-sm">
          <thead className="text-left text-xs text-muted">
            <tr>
              <th className="pb-2 font-medium">When</th>
              <th className="pb-2 font-medium">Score</th>
              <th className="pb-2 font-medium">Clean rows</th>
              <th className="pb-2 font-medium">Rules</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {[...runs]
              .reverse()
              .slice(0, 5)
              .map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2">{formatTime(r.createdAt)}</td>
                  <td className="py-2 font-medium">{r.score}%</td>
                  <td className="py-2">
                    {r.cleanRows} of {r.totalRows}
                  </td>
                  <td className="py-2">{r.ruleCount}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
