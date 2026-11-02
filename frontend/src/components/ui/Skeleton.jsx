import { cn } from "../../lib/cn";

/** A flat grey bar at the real size of the value it stands in for. No shimmer. */
export function Skeleton({ className }) {
  return <div aria-hidden="true" className={cn("rounded-[4px] bg-active", className)} />;
}

export function SkeletonRows({ rows = 6, cols = 4 }) {
  return (
    <div role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex h-14 items-center gap-6 border-t border-rule px-1">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={cn("h-3.5", c === 0 ? "w-2/5" : "w-1/6")} />
          ))}
        </div>
      ))}
    </div>
  );
}
