import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/Button";
import { Wordmark } from "./stamp/Wordmark";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthenticating, authError, retry } = useAuth();

  if (isAuthenticated) return children;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-frame px-6 text-center">
      <Wordmark />
      {authError ? (
        <>
          <p role="alert" className="m-0 max-w-sm text-[15px] text-ink">{authError}</p>
          <Button onClick={retry}>Try again</Button>
        </>
      ) : (
        <p role="status" className="m-0 text-[15px] text-muted">
          {isAuthenticating ? "Opening the dashboard…" : "One moment…"}
        </p>
      )}
    </div>
  );
}
