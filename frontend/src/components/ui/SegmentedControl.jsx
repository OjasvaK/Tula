import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "../../lib/cn";

export function SegmentedControl({ options, value, onChange, className }) {
  const layoutId = useId();
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex rounded-lg border border-line bg-surface-2 p-1",
        className
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? "text-content" : "text-muted hover:text-content"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-md bg-surface shadow-card"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {opt.icon && <opt.icon className="size-3.5" />}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
