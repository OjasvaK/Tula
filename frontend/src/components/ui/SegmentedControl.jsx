import { cn } from "../../lib/cn";

/** A segmented track as wide as its options; the active option is a white pill. */
export function SegmentedControl({ options, value, onChange, label, className }) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex h-10 items-center gap-1 rounded-[8px] bg-active p-1", className)}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "press flex h-8 items-center gap-1.5 rounded-[6px] px-3 text-[14px] font-medium",
              active ? "bg-sheet text-ink" : "text-muted hover:text-ink"
            )}
          >
            {opt.icon && <opt.icon className="size-4" strokeWidth={1.6} aria-hidden="true" />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
