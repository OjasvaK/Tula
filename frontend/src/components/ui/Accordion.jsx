import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";

export function Accordion({ items, defaultOpen = null, className }) {
  const [open, setOpen] = useState(defaultOpen);
  const groupId = useId();

  return (
    <div className={cn("rounded-[3px] border border-border bg-sheet", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.id ?? i} className={cn(i > 0 && "border-t border-rule")}>
            <h3 className="m-0">
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between gap-4 px-5 py-3 text-left text-[15px] font-semibold text-ink hover:bg-raised"
                aria-expanded={isOpen}
                aria-controls={`${groupId}-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="flex items-center gap-3">
                  {item.lead}
                  {item.title}
                </span>
                <ChevronDown
                  className={cn("size-4 shrink-0 text-faint transition-transform duration-200", isOpen && "rotate-180")}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${groupId}-panel-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-[15px] leading-relaxed text-ink">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
