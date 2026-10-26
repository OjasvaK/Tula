import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const VARIANTS = {
  primary:
    "bg-brand text-on-brand hover:bg-brand-strong shadow-card disabled:hover:bg-brand",
  secondary:
    "bg-surface text-content border border-line-strong hover:bg-surface-2",
  ghost: "bg-transparent text-muted hover:bg-surface-2 hover:text-content",
  danger: "bg-danger text-white hover:brightness-95",
  subtle: "bg-brand-soft text-brand hover:brightness-95 dark:hover:brightness-110",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-sm gap-2",
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
        "inline-flex items-center justify-center rounded-lg font-semibold transition-all",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </Comp>
  );
});
