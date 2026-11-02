import { cn } from "../../lib/cn";

const TONES = {
  neutral: "bg-active text-muted",
  positive: "bg-pill-positive-bg text-pill-positive-ink",
  negative: "bg-pill-negative-bg text-pill-negative-ink",
  warning: "bg-pill-warning-bg text-pill-warning-ink",
  brand: "bg-blue-soft text-blue-strong",
};

export function Badge({ tone = "neutral", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex h-[22px] flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium leading-none",
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
    <Badge tone={compliant ? "positive" : "negative"}>
      {compliant ? "Compliant" : "Flagged"}
    </Badge>
  );
}
