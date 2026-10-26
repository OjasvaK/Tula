import { Link } from "react-router-dom";
import { ScrollText, HelpCircle } from "lucide-react";
import { useRules } from "../hooks/useRules";
import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardHeader, CardBody } from "../components/ui/Card";
import { Accordion } from "../components/ui/Accordion";
import { FIELD_META } from "../lib/fieldMeta";
import { fieldLabel } from "../lib/format";

const PIPELINE = [
  ["1", "Ingest", "You upload a label photo or give an image URL. Nothing is scraped from a marketplace."],
  ["2", "Preprocess", "The image is de-skewed and thresholded to help the OCR."],
  ["3", "OCR", "EasyOCR extracts the declaration text (Tesseract is the fast fallback baseline)."],
  ["4", "Rule engine", "Six regex rules — one per Rule 6 declaration — run over the lower-cased text."],
  ["5", "Result", "Each field is marked detected / not detected, with the matched snippet and the LMPC clause."],
];

const FAQ = [
  {
    q: "Does this scrape Amazon or Flipkart?",
    a: "No. It only checks an image you provide. Crawling marketplace pages is out of scope by design.",
  },
  {
    q: "Why is a compliant-looking label flagged?",
    a: "The check is text-pattern based. If the OCR misreads a character, or the wording differs from the expected pattern (e.g. “Product of India” instead of “Country of Origin: India”), the field can read as missing. Open the listing detail and expand “Raw OCR text” to see exactly what was extracted.",
  },
  {
    q: "Why regex instead of machine learning?",
    a: "Transparency. A regulator needs to point at the clause a listing fails, not a probability. New requirements are added as a YAML entry with its citation. ML is a later enhancement, not the core.",
  },
  {
    q: "Can I undo a delete?",
    a: "Deletes are soft — the row is hidden but its history is kept in the database. There's no undo in the UI; ask an admin to clear the deleted_at flag if needed.",
  },
  {
    q: "The first check is slow — is something wrong?",
    a: "No. The OCR model downloads once on first use and is then cached. Subsequent checks are a few seconds.",
  },
];

const GLOSSARY = [
  ["LMPC Rules 2011", "Legal Metrology (Packaged Commodities) Rules, 2011 — the regulation this tool checks against."],
  ["Rule 6", "The clause listing the mandatory declarations every packaged commodity must carry."],
  ["MRP", "Maximum Retail Price — the all-taxes-included ceiling price printed on the pack."],
  ["Net quantity", "The contents by weight, volume, or count in standard metric units."],
  ["PIN code", "The 6-digit Indian postal code; used here as a proxy for a complete manufacturer address."],
  ["Country of origin", "Where the product was made — mandatory for imported goods and marketplace listings."],
];

const SHORTCUTS = [
  ["Sidebar", "Click the logo area links, or the hamburger on mobile"],
  ["Close a dialog", "Esc"],
  ["Open a listing", "Click its product name or the eye icon"],
];

export function HelpPage() {
  const { data: rules = [] } = useRules();

  const declarationItems = rules.map((r) => {
    const meta = FIELD_META[r.field] || {};
    return {
      id: r.field,
      icon: meta.icon,
      title: fieldLabel(r.field),
      content: (
        <div className="space-y-3">
          <p>
            <span className="font-medium text-content">What it is: </span>
            {r.description}.
          </p>
          {meta.why && (
            <p>
              <span className="font-medium text-content">Why it's required: </span>
              {meta.why}
            </p>
          )}
          <p>
            <span className="font-medium text-content">Citation: </span>
            {r.legal_reference}
          </p>
          {meta.example && (
            <p>
              <span className="font-medium text-content">
                Example of compliant text:{" "}
              </span>
              <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs">
                {meta.example}
              </code>
            </p>
          )}
          {meta.commonFailures && (
            <div>
              <p className="font-medium text-content">Common reasons it fails:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                {meta.commonFailures.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ),
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Help"
        description="How the checker works, what each declaration means, and how to read a result."
      />

      <Card>
        <CardHeader title="What this tool does" />
        <CardBody className="space-y-3 text-sm leading-relaxed text-muted">
          <p>
            It reads the mandatory Legal Metrology declarations off a packaged-
            commodity label and reports which ones are present. It's built for a
            regulator persona: every result is tied to the exact clause of{" "}
            <span className="text-content">LMPC Rules 2011, Rule 6</span>, and the
            rule engine is a readable set of patterns, not a model.
          </p>
          <p>
            Start on{" "}
            <Link to="/app/ingest" className="font-medium text-brand">
              Check a Listing
            </Link>
            , then browse results under{" "}
            <Link to="/app/listings" className="font-medium text-brand">
              Listings
            </Link>{" "}
            and see aggregate trends under{" "}
            <Link to="/app/analytics" className="font-medium text-brand">
              Analytics
            </Link>
            .
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="How a check works" />
        <CardBody>
          <ol className="space-y-4">
            {PIPELINE.map(([n, title, body]) => (
              <li key={n} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand">
                  {n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-content">{title}</p>
                  <p className="text-sm text-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </CardBody>
      </Card>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <ScrollText className="size-4 text-brand" />
          <h2 className="text-sm font-semibold text-content">
            The six declarations
          </h2>
        </div>
        <Accordion items={declarationItems} defaultOpen={0} />
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <HelpCircle className="size-4 text-brand" />
          <h2 className="text-sm font-semibold text-content">FAQ</h2>
        </div>
        <Accordion
          items={FAQ.map((f, i) => ({
            id: i,
            title: f.q,
            content: <p>{f.a}</p>,
          }))}
        />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader title="Glossary" />
          <CardBody className="p-0">
            <dl className="divide-y divide-line">
              {GLOSSARY.map(([term, def]) => (
                <div key={term} className="px-5 py-3">
                  <dt className="text-sm font-semibold text-content">{term}</dt>
                  <dd className="text-sm text-muted">{def}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Getting around" />
          <CardBody className="p-0">
            <dl className="divide-y divide-line">
              {SHORTCUTS.map(([action, how]) => (
                <div
                  key={action}
                  className="flex items-center justify-between gap-4 px-5 py-3"
                >
                  <dt className="text-sm text-muted">{action}</dt>
                  <dd className="text-sm font-medium text-content">{how}</dd>
                </div>
              ))}
            </dl>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
