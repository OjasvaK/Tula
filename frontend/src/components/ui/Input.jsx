import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const base =
  "rounded-[6px] border border-control bg-sheet px-3 text-[15px] text-ink " +
  "placeholder:text-faint transition-colors hover:border-faint " +
  "focus:border-blue focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue " +
  "disabled:cursor-not-allowed disabled:bg-raised";

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, "h-10 w-full", className)} {...props} />;
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(base, "h-9 pr-8", className)} {...props}>
      {children}
    </select>
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(base, "w-full py-2 leading-relaxed", className)} {...props} />;
});
