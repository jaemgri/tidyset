import { useState } from "react";
import { supabase } from "../lib/supabase";

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
    // On success, useSession notices the login and the app shows the workspace
  }

  const inputClass = "h-10 w-full rounded border bg-white px-3";

  return (
    <main className="mx-auto mt-24 max-w-sm p-8">
      <h1 className="text-3xl font-bold">Tidyset</h1>
      <p className="mb-8 text-gray-500">
        {mode === "signIn" ? "Log in to your workspace." : "Create your account."}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-3"
      >
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={inputClass}
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="h-10 w-full rounded bg-gray-900 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
        >
          {submitting ? "Please wait…" : mode === "signIn" ? "Log in" : "Sign up"}
        </button>
      </form>

      <button
        onClick={() => setMode(mode === "signIn" ? "signUp" : "signIn")}
        className="mt-4 text-sm text-gray-600 underline hover:text-gray-900"
      >
        {mode === "signIn" ? "No account? Sign up" : "Already have an account? Log in"}
      </button>
    </main>
  );
}
