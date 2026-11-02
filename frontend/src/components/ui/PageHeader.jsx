export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="m-0 text-[24px] font-bold leading-tight text-ink">{title}</h1>
        {description && <p className="m-0 mt-1 max-w-[70ch] text-[15px] text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
