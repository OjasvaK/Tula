import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export function Accordion({ items, defaultOpen = null, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const groupId = useId();

  return (
    <div className={cn("divide-y divide-line rounded-2xl border border-line bg-surface", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.id ?? i}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              aria-expanded={isOpen}
              aria-controls={`${groupId}-panel-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="flex items-center gap-3 text-sm font-semibold text-content">
                {item.icon && <item.icon className="size-4 text-brand-fg" />}
                {item.title}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-subtle transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${groupId}-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-muted">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
