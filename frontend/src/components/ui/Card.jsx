import { cn } from "../../lib/cn";

export function Card({ as: Comp = "section", className, children, ...props }) {
  return (
    <Comp className={cn("rounded-[3px] border border-border bg-sheet", className)} {...props}>
      {children}
    </Comp>
  );
}

export function CardHeader({ className, title, subtitle, action, as: H = "h2", children }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-4", className)}>
      {children || (
        <div className="min-w-0">
          <H className="m-0 text-[16px] font-semibold leading-snug text-ink">{title}</H>
          {subtitle && <p className="m-0 mt-0.5 text-[14px] leading-snug text-muted">{subtitle}</p>}
        </div>
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn("px-5 pb-5 pt-4", className)}>{children}</div>;
}
