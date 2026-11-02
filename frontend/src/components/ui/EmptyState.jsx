import { cn } from "../../lib/cn";

/** An empty block keeps its frame: one sentence, and the next step where the data will appear. */
export function EmptyState({ title, description, action, className }) {
  return (
    <div className={cn("rounded-[8px] border border-dashed border-control px-5 py-5", className)}>
      {title && <p className="m-0 text-[15px] font-semibold text-ink">{title}</p>}
      {description && <p className="m-0 mt-1 max-w-[60ch] text-[14px] text-muted">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
