import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand-fg">
        <Compass className="size-7" />
      </div>
      <h1 className="text-2xl font-bold text-content">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        That route doesn't exist. Head back to the dashboard.
      </p>
      <Button as={Link} to="/app">
        Go to dashboard
      </Button>
    </div>
  );
}
