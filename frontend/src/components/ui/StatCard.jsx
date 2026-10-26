import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { Card } from "./Card";

const ACCENTS = {
  brand: "text-brand bg-brand-soft",
  success: "text-success bg-success-soft",
  danger: "text-danger bg-danger-soft",
  warning: "text-warning bg-warning-soft",
  info: "text-info bg-info-soft",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "brand",
  index = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium uppercase tracking-wide text-subtle">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-content">{value}</p>
            {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                ACCENTS[accent]
              )}
            >
              <Icon className="size-5" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
