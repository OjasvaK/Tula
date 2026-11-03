import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui/PageHeader";
import { Accordion } from "../components/ui/Accordion";
import { StampStrip } from "../components/stamp/StampStrip";
import { DECLARATIONS } from "../lib/rules";
import { FIELD_META } from "../lib/fieldMeta";

const PIPELINE = [
  ["You supply the image", "Upload a label photo or give an image address. Nothing is scraped from a marketplace."],
  ["The image is prepared", "It is de-skewed and thresholded so the text stands out from the pack’s printing."],
  ["EasyOCR reads it", "The raw text is kept with the listing; Tesseract is the comparison baseline."],
  ["Six patterns decide", "One pattern per declaration runs over the lower-cased text."],
  ["The sheet is issued", "Each declaration is postmarked with its clause, or overprinted when it is missing."],
];

const FAQ = [
  {
    q: "Does this scrape Amazon or Flipkart?",
    a: "No. It only checks an image you provide. Crawling marketplace pages is out of scope by design.",
  },
  {
    q: "Why is a label that looks complete flagged?",
    a: "The check matches text patterns. If the OCR misreads a character, or the label words a declaration differently (“Product of India” rather than “Country of origin: India”), that declaration reads as missing. Open the listing and read the OCR text to see exactly what was extracted.",
  },
  {
    q: "Why patterns instead of machine learning?",
    a: "Because an inspector needs to point at the clause a listing fails, not at a probability. A new requirement is one YAML entry with its citation.",
  },
  {
    q: "What does the strip of six small stamps mean?",
    a: (
      <>
        Each stamp is one declaration, in sheet order: MRP, net quantity, origin, care, address, month and year. A filled stamp was found; a pale stamp struck through in red is missing. This one is missing MRP and month and year:{" "}
        <StampStrip missing={["mrp", "month_year"]} className="ml-1 align-middle" />
      </>
    ),
  },
  {
    q: "Can a delete be undone?",
    a: "Deletes are soft: the record stays in the database with a deleted date, but there is no undo here.",
  },
  {
    q: "Why is the first check slow?",
    a: "The OCR model downloads once on first use and is cached afterwards. Later checks take a few seconds.",
  },
];

const GLOSSARY = [
  ["LMPC Rules 2011", "The Legal Metrology (Packaged Commodities) Rules, 2011, the regulation this tool checks against."],
  ["Rule 6", "The rule listing the declarations every pre-packaged commodity must carry."],
  ["Rule 6(10)", "Carries those declarations onto e-commerce listings, in force since 1 January 2018."],
  ["MRP", "Maximum retail price, inclusive of all taxes."],
  ["PIN code", "India’s six-digit postal code, used here as evidence of a complete manufacturer address."],
];

export function HelpPage() {
  return (
    <div className="max-w-[880px]">
      <PageHeader
        title="Help"
        description="How a check works, what each declaration means, and how to read a sheet."
      />

      <section aria-labelledby="h-how">
        <h2 id="h-how" className="m-0 text-[18px] font-semibold text-ink">How a check works</h2>
        <ol className="m-0 mt-3 list-decimal space-y-2 pl-5 text-[15px] leading-relaxed marker:text-muted">
          {PIPELINE.map(([title, body]) => (
            <li key={title} className="pl-1">
              <span className="font-semibold text-ink">{title}.</span> <span className="text-ink">{body}</span>
            </li>
          ))}
        </ol>
        <p className="m-0 mt-4 text-[15px] text-ink">
          Start on{" "}
          <Link to="/app/ingest" className="font-medium text-blue">Check a label</Link>, then work the results in{" "}
          <Link to="/app/listings" className="font-medium text-blue">Listings</Link>.
        </p>
      </section>

      <section aria-labelledby="h-six" className="mt-10">
        <h2 id="h-six" className="m-0 text-[18px] font-semibold text-ink">The six declarations</h2>
        <p className="m-0 mt-1 text-[15px] text-muted">
          Rule 6 lists eight. The generic name and the unit sale price are not checked yet.
        </p>
        <Accordion
          className="mt-3"
          defaultOpen={0}
          items={DECLARATIONS.map((d) => {
            const meta = FIELD_META[d.field] || {};
            return {
              id: d.field,
              title: (
                <>
                  {d.name} <span className="font-normal text-muted tabular">{d.clause}</span>
                </>
              ),
              content: (
                <div className="space-y-2.5">
                  <p className="m-0">{d.requires}</p>
                  {meta.why && <p className="m-0 text-muted">{meta.why}</p>}
                  <p className="m-0">
                    <span className="font-semibold">Looks for:</span> {d.looksFor}
                  </p>
                  {meta.example && (
                    <p className="m-0">
                      <span className="font-semibold">Compliant wording:</span>{" "}
                      <code className="rounded-[3px] bg-raised px-1.5 py-0.5 font-mono text-[14px]">{meta.example}</code>
                    </p>
                  )}
                  {meta.commonFailures && (
                    <div>
                      <p className="m-0 font-semibold">Common reasons it reads as missing</p>
                      <ul className="m-0 mt-1 list-disc space-y-0.5 pl-5">
                        {meta.commonFailures.map((f) => <li key={f}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ),
            };
          })}
        />
      </section>

      <section aria-labelledby="h-faq" className="mt-10">
        <h2 id="h-faq" className="m-0 text-[18px] font-semibold text-ink">Questions</h2>
        <Accordion className="mt-3" items={FAQ.map((f, i) => ({ id: i, title: f.q, content: <p className="m-0">{f.a}</p> }))} />
      </section>

      <section aria-labelledby="h-gloss" className="mt-10">
        <h2 id="h-gloss" className="m-0 text-[18px] font-semibold text-ink">Glossary</h2>
        <dl className="m-0 mt-3 rounded-[8px] border border-border">
          {GLOSSARY.map(([term, def], i) => (
            <div key={term} className={`grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr] sm:gap-6 ${i > 0 ? "border-t border-rule" : ""}`}>
              <dt className="text-[15px] font-semibold text-ink">{term}</dt>
              <dd className="m-0 text-[15px] text-ink">{def}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
