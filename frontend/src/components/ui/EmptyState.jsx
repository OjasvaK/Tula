import { Inbox } from "lucide-react";
import { cn } from "../../lib/cn";

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-6 py-14 text-center",
        className
      )}
    >
      <div className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-surface-2 text-subtle">
        <Icon className="size-6" />
      </div>
      <h3 className="text-sm font-semibold text-content">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
