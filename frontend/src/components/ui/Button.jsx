import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary: "bg-blue text-white hover:bg-blue-strong disabled:hover:bg-blue",
  secondary: "bg-sheet text-ink border border-control hover:border-faint hover:bg-raised",
  ghost: "bg-transparent text-muted hover:bg-active hover:text-ink",
  danger: "bg-sheet text-negative border border-control hover:border-negative hover:bg-pill-negative-bg",
  "danger-solid": "bg-negative text-white hover:brightness-95",
  inverse: "bg-white text-blue-strong hover:bg-blue-soft",
};

const SIZES = {
  sm: "h-8 px-3 text-[14px] gap-1.5",
  md: "h-9 px-4 text-[15px] gap-2",
  lg: "h-12 px-6 text-[17px] gap-2",
};

export const Button = forwardRef(function Button(
  {
    as: Comp = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <Comp
      ref={ref}
      disabled={Comp === "button" ? disabled || loading : undefined}
      aria-busy={loading || undefined}
      className={cn(
        "press inline-flex shrink-0 items-center justify-center rounded-[3px] font-semibold whitespace-nowrap no-underline",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </Comp>
  );
});
