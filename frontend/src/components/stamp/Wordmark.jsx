import { cn } from "../../lib/cn";

/** The product mark: a single perforated stamp of value six, beside the name. */
export function Wordmark({ compact = false, className }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 text-ink", className)}>
      <span
        aria-hidden="true"
        className="perforated perforated-xs block bg-stamp-paper p-[3px]"
        style={{ width: compact ? 26 : 30, height: compact ? 32 : 36 }}
      >
        <span className="flex h-full w-full items-center justify-center bg-blue pt-[3px] font-display text-[19px] leading-none text-white">
          6
        </span>
      </span>
      {!compact && (
        <span className="font-display text-[24px] leading-none tracking-[-0.01em]">Tula</span>
      )}
    </span>
  );
}
