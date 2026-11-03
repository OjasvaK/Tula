import { DECLARATIONS } from "../../lib/rules";
import { cn } from "../../lib/cn";

const TALLY_MAX = 24;

/** One mini stamp per listing: struck in carmine where the declaration is missing. */
function Tally({ count, total, ink }) {
  return (
    <span aria-hidden="true" className="flex flex-wrap gap-[3px]">
      {Array.from({ length: total }).map((_, i) => {
        const missing = i < count;
        return (
          <span
            key={i}
            className="perforated perforated-xs relative block h-[18px] w-[14px] p-[2.5px]"
            style={{ background: missing ? "var(--pill-negative-bg)" : "var(--stamp-paper)" }}
          >
            <span className="block h-full w-full" style={{ background: missing ? "transparent" : ink }} />
            {missing && <span className="cancel absolute inset-x-[-2px] top-1/2 block h-[2px] -translate-y-1/2 bg-carmine" />}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Every declaration with how many listings miss it, most-missed first. Up to
 * 24 listings the count is a tally of stamps (one per listing); past that, a
 * bar. thin: a 3px grey bar with the top row in blue, for a side card.
 */
export function MissingBarList({ trends = {}, total = 0, thin = false, className }) {
  const rows = DECLARATIONS.map((d) => ({ ...d, count: trends[d.field] || 0 })).sort(
    (a, b) => b.count - a.count || DECLARATIONS.indexOf(a) - DECLARATIONS.indexOf(b)
  );
  const max = Math.max(1, ...rows.map((r) => r.count));
  const tally = total > 0 && total <= TALLY_MAX;

  return (
    <ul className={cn("m-0 list-none p-0", className)}>
      {rows.map((r, i) => (
        <li key={r.field} className={cn(thin ? "py-2" : "py-2.5", i > 0 && "border-t border-rule")}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="truncate text-[14px] text-ink">
              {r.name} <span className="text-muted tabular">{r.clause}</span>
            </span>
            <span className="shrink-0 text-[14px] tabular">
              <span className="font-semibold text-ink">{r.count}</span>
              {total > 0 && <span className="text-muted"> of {total}</span>}
            </span>
          </div>
          <div className="mt-1.5">
            {tally ? (
              <Tally count={r.count} total={total} ink={r.ink} />
            ) : (
              <div className={cn("w-full", thin ? "h-[3px]" : "h-2 bg-raised")}>
                {r.count > 0 && (
                  <div
                    className="h-full"
                    style={{
                      width: `${(r.count / max) * 88}%`,
                      background: thin && i > 0 ? "var(--control)" : "var(--blue)",
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
