import { cn } from "../../lib/cn";

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-surface-3",
        className
      )}
    />
  );
}

export function SkeletonRows({ rows = 6, cols = 4 }) {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 py-3.5">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton
              key={c}
              className={cn("h-4", c === 0 ? "w-2/5" : "w-1/6")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
