import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const base =
  "w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-content " +
  "placeholder:text-subtle transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand " +
  "disabled:cursor-not-allowed disabled:opacity-60";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input ref={ref} className={cn(base, "h-10", className)} {...props} />
  );
});

export const Select = forwardRef(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select ref={ref} className={cn(base, "h-10 pr-8", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea(
  { className, ...props },
  ref
) {
  return (
    <textarea ref={ref} className={cn(base, "py-2 leading-relaxed", className)} {...props} />
  );
});
