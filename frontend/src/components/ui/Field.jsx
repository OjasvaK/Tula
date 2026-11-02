import { useId, cloneElement, isValidElement } from "react";
import { cn } from "../../lib/cn";

/** Label above the control; a hint or error is tied to it with aria-describedby. */
export function Field({ label, hint, error, required, className, children }) {
  const id = useId();
  const noteId = `${id}-note`;
  const control = isValidElement(children)
    ? cloneElement(children, {
        id: children.props.id || id,
        "aria-describedby": hint || error ? noteId : undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <label htmlFor={isValidElement(children) ? children.props.id || id : undefined} className="text-[14px] font-medium text-ink">
          {label}
          {required && <span className="sr-only"> (required)</span>}
        </label>
      )}
      {control}
      {error ? (
        <span id={noteId} className="text-[13px] text-negative">{error}</span>
      ) : hint ? (
        <span id={noteId} className="text-[13px] text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
