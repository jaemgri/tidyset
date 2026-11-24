import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Logo } from "./Logo";

const PREVIEW_ROWS = [
  { id: "1", email: "aiko@example.com", age: "29", bad: [] as string[] },
  { id: "2", email: "chloe@example", age: "41", bad: ["email"] },
  { id: "3", email: "dan@example.com", age: "-5", bad: ["age"] },
  { id: "3", email: "eve@example.com", age: "220", bad: ["id", "age"] },
];

export function AuthForm() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    const { error } =
      mode === "signIn"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) setError(error.message);
    setSubmitting(false);
  }

  const inputClass = "mt-1.5 h-10 w-full rounded-md border bg-white px-3 text-ink";

  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      <main className="flex min-h-screen flex-col px-6 py-8 md:px-16">
        <Logo />

        <div className="my-auto w-full max-w-sm py-16">
          <h1 className="text-3xl font-semibold tracking-tight">
            {mode === "signIn" ? "Log in to Tidyset" : "Create your account"}
          </h1>
          <p className="mt-2 mb-8 text-muted">
            Upload a dataset, set the rules it should follow, and see every value that breaks
            them.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-4"
          >
            <label className="block text-sm font-medium">
              Work email
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </label>
            <label className="block text-sm font-medium">
              Password
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </label>

            {error && (
              <p role="alert" className="text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="h-10 w-full rounded-md bg-ink font-medium text-white hover:bg-ink-soft disabled:opacity-50"
            >
              {submitting ? "Please wait…" : mode === "signIn" ? "Log in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-muted">
            {mode === "signIn" ? "New to Tidyset? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
              className="font-medium text-ink underline underline-offset-4"
            >
              {mode === "signIn" ? "Create an account" : "Log in"}
            </button>
          </p>
        </div>
      </main>

      <aside className="hidden border-l bg-white md:flex md:items-center md:justify-center md:p-16">
        <figure className="w-full max-w-md">
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-paper text-left text-xs text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-medium">id</th>
                  <th className="px-4 py-2.5 font-medium">email</th>
                  <th className="px-4 py-2.5 font-medium">age</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {PREVIEW_ROWS.map((row, i) => (
                  <tr key={i} className="border-t">
                    {(["id", "email", "age"] as const).map((col) => (
                      <td key={col} className="px-4 py-2.5">
                        <span className={row.bad.includes(col) ? "marker" : ""}>{row[col]}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <figcaption className="mt-4 text-sm text-muted">
            Tidyset highlights every value that breaks a rule, so you know exactly what to fix.
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}
