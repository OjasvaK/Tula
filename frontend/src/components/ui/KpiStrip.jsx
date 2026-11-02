import { cn } from "../../lib/cn";

/**
 * Headline figures as a ledger line: a heavy rule above, a light rule below,
 * cells split by 1px rules. Label over value, no icons, no tiles. `lead` marks
 * the figure that answers the screen; `text` sets a worded value smaller.
 */
export function KpiStrip({ items, className }) {
  return (
    <dl
      className={cn(
        "m-0 grid grid-cols-2 border-b border-t-2 border-b-border border-t-ink",
        items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4",
        className
      )}
    >
      {items.map((item, i) => (
        <div
          key={item.label}
          className={cn(
            "min-w-0 py-4 pr-5",
            i > 0 && "sm:border-l sm:border-border sm:pl-5",
            i % 2 === 1 && "border-l border-border pl-5",
            i >= 2 && "border-t border-border sm:border-t-0",
            i === items.length - 1 && items.length % 2 === 1 && "col-span-2 sm:col-span-1"
          )}
        >
          <dt className="text-[14px] text-muted">{item.label}</dt>
          <dd
            className={cn(
              "m-0 mt-1 leading-tight text-ink tabular",
              item.lead
                ? "truncate text-[32px] font-semibold"
                : item.text
                  ? "pt-1 text-[18px] font-semibold"
                  : "truncate text-[24px] font-medium"
            )}
          >
            {item.value}
            {item.unit && <span className="ml-1 text-[15px] font-normal text-muted">{item.unit}</span>}
          </dd>
          {item.sub && <p className="m-0 mt-1 text-[13px] leading-snug text-muted">{item.sub}</p>}
        </div>
      ))}
    </dl>
  );
}
