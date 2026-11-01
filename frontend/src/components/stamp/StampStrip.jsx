import { DECLARATIONS } from "../../lib/rules";
import { cn } from "../../lib/cn";

/** A one-line key for the strip, for any table that shows strips. */
export function StripKey({ className }) {
  return (
    <p className={cn("m-0 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted", className)}>
      <span>Each strip reads in sheet order: MRP, net quantity, origin, care, address, month and year.</span>
      <span className="inline-flex items-center gap-1.5">
        <StampStrip missing={[]} /> all found;
      </span>
      <span className="inline-flex items-center gap-1.5">
        <StampStrip missing={["mrp", "country_of_origin", "month_year"]} /> three missing.
      </span>
    </p>
  );
}

/**
 * Six mini stamps in sheet order: an inked stamp for each declaration found,
 * a pale stamp struck with a carmine bar for each one missing.
 */
export function StampStrip({ missing = [], className }) {
  const missingSet = new Set(missing);
  const found = DECLARATIONS.length - missingSet.size;
  const label =
    missingSet.size === 0
      ? "All 6 declarations found"
      : `${found} of 6 found; missing ${DECLARATIONS.filter((d) => missingSet.has(d.field))
          .map((d) => d.short)
          .join(", ")}`;

  return (
    <span role="img" aria-label={label} title={label} className={cn("inline-flex items-center gap-[3px]", className)}>
      {DECLARATIONS.map((d) => {
        const isMissing = missingSet.has(d.field);
        return (
          <span
            key={d.field}
            className="perforated perforated-xs relative block h-[22px] w-[18px] p-[3px]"
            style={{ background: isMissing ? "var(--pill-negative-bg)" : "var(--stamp-paper)" }}
          >
            <span
              className="block h-full w-full"
              style={{ background: isMissing ? "transparent" : d.ink }}
            />
            {isMissing && (
              <span className="cancel absolute inset-x-[-2px] top-1/2 block h-[2.5px] -translate-y-1/2 bg-carmine" />
            )}
          </span>
        );
      })}
    </span>
  );
}
