import { useSession } from "./lib/useSession";
import { AuthForm } from "./components/AuthForm";
import { Workspace } from "./components/Workspace";

function App() {
  const { session, loading } = useSession();

  if (loading) {
    return <p className="p-8 text-muted">Loading…</p>;
  }

  if (!session) {
    return <AuthForm />;
  }

  return <Workspace userEmail={session.user.email ?? ""} />;
}

export default App;
