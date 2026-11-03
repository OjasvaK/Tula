import { Stamp } from "./stamp/Stamp";
import { DECLARATIONS, declaredValue } from "../lib/rules";
import { cn } from "../lib/cn";

/**
 * A listing's result as its stamp sheet plus a ledger of what was read.
 * results: [{ field, present, matched_text }]; rawText: the OCR text, used to
 * read each found declaration's stated value. print: a fresh check strikes in.
 */
export function DeclarationSheet({ results = [], rawText = "", print = false, className }) {
  const byField = Object.fromEntries(results.map((r) => [r.field, r]));
  const rows = DECLARATIONS.filter((d) => byField[d.field]);

  return (
    <div className={className}>
      <div className="grid grid-cols-2 gap-3 bg-gutter p-3 sm:grid-cols-3">
        {rows.map((d, i) => {
          const r = byField[d.field];
          return (
            <Stamp
              key={d.field}
              decl={d}
              size="md"
              state={r.present ? "present" : "missing"}
              value={r.present ? declaredValue(d.field, r.matched_text, rawText) : undefined}
              showVignette={false}
              timing={print ? { strike: 200 + i * 240 } : undefined}
              className="min-h-[140px]"
            />
          );
        })}
      </div>

      <table className="mt-5 w-full border-collapse text-left text-[14px]">
        <caption className="sr-only">What was read for each declaration</caption>
        <thead>
          <tr className="text-[13px] text-muted">
            <th scope="col" className="pb-2 pr-3 font-normal">Declaration</th>
            <th scope="col" className="pb-2 pr-3 font-normal">Read as</th>
            <th scope="col" className="pb-2 text-right font-normal">Clause</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => {
            const r = byField[d.field];
            return (
              <tr key={d.field} className="border-t border-rule">
                <th scope="row" className="py-2.5 pr-3 font-medium text-ink">{d.name}</th>
                <td className={cn("py-2.5 pr-3", r.present ? "text-ink" : "text-negative")}>
                  {r.present ? `“${r.matched_text}”` : "Not declared"}
                </td>
                <td className="whitespace-nowrap py-2.5 text-right text-muted tabular">{d.clause}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Map the /ingest response `results` dict into the sheet's row shape. */
export function ingestResultsToRows(resultsDict) {
  return Object.entries(resultsDict || {}).map(([field, r]) => ({
    field,
    present: r.present,
    matched_text: r.matched_text,
    legal_reference: r.legal_reference,
  }));
}
