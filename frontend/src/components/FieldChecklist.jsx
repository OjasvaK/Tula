import { Check, X } from "lucide-react";
import { fieldLabel } from "../lib/format";
import { fieldIcon } from "../lib/fieldMeta";
import { cn } from "../lib/cn";

/**
 * results: [{ field, present, matched_text, description, legal_reference }]
 * Accepts either the /listings/{id} detail shape or the /ingest response
 * mapped into the same shape.
 */
export function FieldChecklist({ results = [] }) {
  return (
    <ul className="divide-y divide-line">
      {results.map((r) => {
        const Icon = fieldIcon(r.field);
        return (
          <li key={r.field} className="flex gap-3 py-3.5">
            <div
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                r.present
                  ? "bg-success-soft text-success"
                  : "bg-danger-soft text-danger"
              )}
            >
              {r.present ? (
                <Check className="size-4" />
              ) : (
                <X className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <Icon className="size-3.5 text-subtle" />
                <span className="text-sm font-semibold text-content">
                  {fieldLabel(r.field)}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    r.present ? "text-success" : "text-danger"
                  )}
                >
                  {r.present ? "Detected" : "Not detected"}
                </span>
              </div>
              {r.description && (
                <p className="mt-0.5 text-xs text-muted">{r.description}</p>
              )}
              {r.present && r.matched_text && (
                <p className="mt-1 rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-content">
                  “{r.matched_text}”
                </p>
              )}
              {r.legal_reference && (
                <p className="mt-1 text-[11px] text-subtle">
                  {r.legal_reference}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Map the /ingest response `results` dict into the checklist row shape. */
export function ingestResultsToRows(resultsDict, rules = []) {
  const descByField = Object.fromEntries(
    rules.map((r) => [r.field, r.description])
  );
  return Object.entries(resultsDict).map(([field, r]) => ({
    field,
    present: r.present,
    matched_text: r.matched_text,
    description: descByField[field] || "",
    legal_reference: r.legal_reference,
  }));
}
