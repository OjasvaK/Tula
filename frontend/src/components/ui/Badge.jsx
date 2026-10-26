import { cn } from "../../lib/cn";

const TONES = {
  neutral: "bg-surface-3 text-muted",
  success: "bg-success-soft text-success",
  danger: "bg-danger-soft text-danger",
  warning: "bg-warning-soft text-warning",
  info: "bg-info-soft text-info",
  brand: "bg-brand-soft text-brand",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ compliant }) {
  return (
    <Badge tone={compliant ? "success" : "danger"}>
      <span
        className={cn(
          "size-1.5 rounded-full",
          compliant ? "bg-success" : "bg-danger"
        )}
      />
      {compliant ? "Compliant" : "Flagged"}
    </Badge>
  );
}
