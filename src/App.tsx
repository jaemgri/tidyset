import { useSession } from "./lib/useSession";
import { supabase } from "./lib/supabase";
import { AuthForm } from "./components/AuthForm";
import { Workspace } from "./components/Workspace";

function App() {
  const { session, loading } = useSession();

  if (loading) {
    return <p className="p-8 text-gray-500">Loading…</p>;
  }

  if (!session) {
    return <AuthForm />;
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tidyset</h1>
          <p className="text-gray-500">Know your data is clean.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded border px-3 py-1 hover:bg-gray-50"
          >
            Log out
          </button>
        </div>
      </header>

      <Workspace />
    </main>
  );
}

export default App;
