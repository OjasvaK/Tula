import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Spinner({ className, label = "Loading" }) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center gap-2 text-sm text-muted", className)}
    >
      <Loader2 className="size-4 animate-spin" />
    </span>
  );
}

export function CenteredSpinner({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted">
      <Loader2 className="size-6 animate-spin text-brand" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
