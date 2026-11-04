import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Reveal } from "../components/motion/Reveal";
import { Stamp } from "../components/stamp/Stamp";
import { StampStrip } from "../components/stamp/StampStrip";
import { Wordmark } from "../components/stamp/Wordmark";
import { DECLARATIONS, checkText, declaredValue } from "../lib/rules";
import { SPECIMENS, WRITTEN_EXAMPLE } from "../lib/specimens";
import { FIELD_META } from "../lib/fieldMeta";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { cn } from "../lib/cn";

const SPECIMEN = SPECIMENS[0];
const HERO_RESULTS = checkText(SPECIMEN.ocr);
const HERO_FOUND = HERO_RESULTS.filter((r) => r.present).length;
const OCR_LINES = SPECIMEN.ocr.split("\n");
const EVIDENCE = new Set(
  HERO_RESULTS.filter((r) => r.present).map((r) => r.matched_text)
);

const NAV = [
  ["#try", "Try the rules"],
  ["#how", "How it works"],
  ["#six", "The six"],
  ["#stack", "Under the hood"],
];

const LINE_MS = 38;
const STAMP_START = 600;
const STAMP_STEP = 430;

function lineHasEvidence(line) {
  const l = line.toLowerCase();
  for (const e of EVIDENCE) if (l.includes(e)) return true;
  return false;
}

/* ── Hero ──────────────────────────────────────────────────────────────── */

const VISIBLE_LINES = 11;
// The stream stops at the end of the declarations block (the email line).
const STREAM_LINES = OCR_LINES.slice(
  0,
  Math.max(VISIBLE_LINES, OCR_LINES.findIndex((l) => l.toLowerCase().includes("email")) + 1)
);

function OcrStream() {
  const reduced = usePrefersReducedMotion();
  const [count, setCount] = useState(reduced ? STREAM_LINES.length : 0);
  const start = Math.max(0, count - VISIBLE_LINES);

  useEffect(() => {
    if (reduced) {
      setCount(STREAM_LINES.length);
      return undefined;
    }
    const id = setInterval(() => {
      setCount((c) => {
        if (c >= STREAM_LINES.length) {
          clearInterval(id);
          return c;
        }
        return c + 1;
      });
    }, LINE_MS);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <pre
      aria-label="Text EasyOCR extracted from the specimen label"
      className="m-0 flex h-[226px] flex-col justify-end overflow-hidden bg-sheet px-3.5 py-3 text-[13px] leading-[1.5] text-muted"
    >
      <code className="font-mono">
        {STREAM_LINES.slice(start, count).map((line, i) => (
          <span
            key={start + i}
            className={cn(
              "anim-line-in block",
              lineHasEvidence(line) && "bg-blue-soft font-semibold text-blue-strong"
            )}
          >
            {line || " "}
          </span>
        ))}
      </code>
    </pre>
  );
}

function Hero() {
  return (
    <section className="px-3 pb-16 pt-3 sm:px-6 md:pb-20 lg:pt-4">
      {/* The sheet: its own toned paper, distinct from the page ground. */}
      <div className="mx-auto max-w-[1392px] bg-gutter px-4 pb-5 pt-1 sm:px-6">
        {/* Top selvedge: name, plain links. */}
        <header className="flex h-[60px] items-center justify-between gap-6">
          <Link to="/" className="no-underline" aria-label="Tula, home">
            <Wordmark />
          </Link>
          <nav aria-label="Page sections" className="hidden items-center gap-7 md:flex">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="text-[16px] font-medium text-ink no-underline hover:text-blue">
                {label}
              </a>
            ))}
          </nav>
          <Link to="/app" className="press text-[16px] font-semibold text-blue no-underline hover:text-blue-strong">
            Open the dashboard
          </Link>
        </header>

        {/* Inscription + sheet value. */}
        <div className="grid items-end gap-x-10 gap-y-5 pb-5 pt-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <h1 className="font-display m-0 text-[clamp(42px,4.6vw,68px)] leading-[1] tracking-[-0.02em] text-ink">
              Tula checks every label.
            </h1>
            <p className="m-0 mt-3 max-w-[66ch] text-[18px] leading-[1.55] text-ink">
              Upload a photo of a packaged-goods label. Tula reads it with OCR and checks
              the six declarations India&rsquo;s Legal Metrology rules require, citing the
              clause for every one it cannot find.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <a href="#try" className="press inline-flex items-center gap-1.5 text-[16px] font-semibold text-blue no-underline hover:text-blue-strong">
              Try the rules here
              <ArrowDown className="size-4" aria-hidden="true" />
            </a>
            <Link
              to="/app/ingest"
              className="press group inline-flex flex-col border-[6px] border-double border-blue bg-white px-5 py-2.5 no-underline hover:bg-blue-soft"
            >
              <span className="inline-flex items-center gap-2 text-[20px] font-bold text-blue">
                Check a label
                <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
              <span className="text-[14px] text-muted">Upload a photo, get its sheet</span>
            </Link>
          </div>
        </div>

        {/* The sheet of six, with the specimen and its OCR in the right selvedge. */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_268px]">
          <p className="m-0 mb-2 text-[14px] text-muted sm:hidden">Swipe across the sheet to see all six stamps.</p>
          <div
            role="region"
            aria-label="Specimen sheet of six stamps"
            tabIndex={0}
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-3"
          >
            {DECLARATIONS.map((d, i) => {
              const r = HERO_RESULTS[i];
              return (
                <Stamp
                  key={d.field}
                  decl={d}
                  state={r.present ? "present" : "missing"}
                  value={r.present ? declaredValue(d.field, r.matched_text, SPECIMEN.ocr) : undefined}
                  vignette={SPECIMEN.crops[d.field]}
                  vignetteAlt={`The ${d.name.toLowerCase()} lines of the specimen label`}
                  timing={{ strike: STAMP_START + i * STAMP_STEP }}
                  className="min-h-[196px] w-[84vw] max-w-[340px] shrink-0 snap-center sm:w-auto sm:max-w-none"
                />
              );
            })}
          </div>

          <aside aria-labelledby="specimen-title" className="grid gap-4 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-3">
            <figure className="m-0 flex gap-3">
              <img
                src={SPECIMEN.photo}
                alt={SPECIMEN.alt}
                width="720"
                height="1280"
                className="block h-[132px] w-[92px] shrink-0 object-cover object-[30%_40%]"
              />
              <figcaption className="text-[14px] leading-snug text-muted">
                <span id="specimen-title" className="font-semibold text-ink">{SPECIMEN.name}</span>
                <br />
                A real pouch. Its MRP and packed-on fields are printed but left blank.
                <span className="mt-2 block font-display text-[28px] leading-none text-ink tabular">{HERO_FOUND} of 6</span>
                <span className="text-ink">declarations found</span>
              </figcaption>
            </figure>
            <div>
              <p className="mb-1.5 mt-0 text-[14px] font-semibold text-ink">What the OCR read</p>
              <OcrStream />
            </div>
            <div aria-hidden="true" className="flex items-center gap-1.5">
              {["var(--blue)", "var(--green)", "var(--sepia)", "var(--slate)"].map((c) => (
                <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ── Try the rules ─────────────────────────────────────────────────────── */

const PRESETS = [
  { id: "mahakal", label: "Siddh Mahakal OCR", text: SPECIMENS[0].ocr },
  { id: "dhaga", label: "Dhaga Mishri OCR", text: SPECIMENS[1].ocr },
  { id: "written", label: "Written example", text: WRITTEN_EXAMPLE },
  { id: "blank", label: "Blank", text: "" },
];

function TryTheRules() {
  const [preset, setPreset] = useState("written");
  const [text, setText] = useState(WRITTEN_EXAMPLE);
  const results = useMemo(() => checkText(text), [text]);
  const found = results.filter((r) => r.present).length;

  function choose(p) {
    setPreset(p.id);
    setText(p.text);
  }

  return (
    <section id="try" aria-labelledby="try-title" className="scroll-mt-6 bg-sheet px-4 py-16 sm:px-8 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[1376px]">
        <Reveal as="h2" id="try-title" className="font-display m-0 max-w-[18ch] text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.015em]">
          Try the rules on any label text
        </Reveal>
        <Reveal as="p" index={1} className="mt-5 max-w-[62ch] text-[18px] leading-[1.6]">
          Paste text from a label, or start from one below. These are the same six
          patterns the server runs, so what the stamps show here is what a check would
          decide.
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Reveal index={2} className="flex min-w-0 flex-col gap-4">
            <div role="group" aria-label="Start from" className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={preset === p.id}
                  onClick={() => choose(p)}
                  className={cn(
                    "press h-10 rounded-[3px] border px-3.5 text-[15px] font-semibold",
                    preset === p.id
                      ? "border-blue bg-blue text-white"
                      : "border-control bg-sheet text-ink hover:border-faint"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <label htmlFor="label-text" className="text-[15px] font-semibold">
              Label text
            </label>
            <textarea
              id="label-text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setPreset(null);
              }}
              rows={13}
              spellCheck={false}
              className="w-full resize-y rounded-[3px] border border-control bg-paper px-4 py-3 text-[16px] leading-[1.55] text-ink outline-none focus:border-blue"
            />
            <p className="m-0 text-[17px]" aria-live="polite">
              <span className="font-display text-[30px] leading-none tabular">{found} of 6</span>{" "}
              declarations found
            </p>
          </Reveal>

          <Reveal index={3} className="min-w-0">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {DECLARATIONS.map((d, i) => {
                const r = results[i];
                return (
                  <Stamp
                    key={`${d.field}-${r.present ? "p" : "m"}`}
                    decl={d}
                    size="md"
                    state={r.present ? "present" : "missing"}
                    value={r.present ? declaredValue(d.field, r.matched_text, text) : undefined}
                    showVignette={false}
                    timing={{ strike: 120 }}
                    className="min-h-[150px]"
                  />
                );
              })}
            </div>
            <table className="mt-8 w-full border-collapse text-left text-[16px]">
              <caption className="sr-only">What each pattern matched in the text above</caption>
              <thead>
                <tr className="text-[14px] text-muted">
                  <th scope="col" className="pb-2 pr-4 font-normal">Declaration</th>
                  <th scope="col" className="pb-2 pr-4 font-normal">Matched text</th>
                  <th scope="col" className="pb-2 text-right font-normal">Clause</th>
                </tr>
              </thead>
              <tbody>
                {DECLARATIONS.map((d, i) => {
                  const r = results[i];
                  return (
                    // taste-skill-ignore: row rules in a real data table
                    <tr key={d.field} className="border-t border-rule">
                      <th scope="row" className="py-2.5 pr-4 font-semibold">{d.name}</th>
                      <td className={cn("py-2.5 pr-4", r.present ? "text-ink" : "font-semibold text-negative")}>
                        {r.present ? `“${r.matched_text}”` : "No match"}
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-right tabular text-muted">{d.clause}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Why ───────────────────────────────────────────────────────────────── */

function Why() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = useTransform(scrollYProgress, [0, 1], ["translateY(-4%) scale(1.08)", "translateY(4%) scale(1.08)"]);

  return (
    <section ref={ref} aria-labelledby="why-title" className="px-4 py-16 sm:px-8 md:py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1376px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal as="h2" id="why-title" className="font-display m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.015em]">
            Online, the label is the listing
          </Reveal>
          <Reveal as="p" index={1} className="mt-6 text-[18px] leading-[1.6]">
            The Legal Metrology (Packaged Commodities) Rules, 2011 list what every
            pre-packed product must declare. Rule 6(10), in force since 1 January 2018,
            carries those declarations onto e-commerce listings: a shopper must be able to
            read them before buying, not after the parcel arrives.
          </Reveal>
          <Reveal as="p" index={2} className="mt-5 text-[18px] leading-[1.6]">
            Inspectors work listing by listing. Between October 2020 and July 2022 they
            issued 448 notices for declaration violations, by the government&rsquo;s own
            count in a Lok Sabha reply of 21 July 2022. The listings far outnumber the
            people checking them.
          </Reveal>
          <Reveal index={3} className="mt-8 bg-sheet p-5">
            <p className="m-0 text-[17px] font-semibold">Rule 6 lists eight declarations. Tula checks six.</p>
            <p className="mb-0 mt-2 text-[16px] leading-[1.55] text-muted">
              The commodity&rsquo;s generic name and its unit sale price are not checked
              yet; they are hard to tell apart from ordinary label copy by pattern alone.
            </p>
          </Reveal>
        </div>

        <Reveal index={1} className="lg:col-span-7">
          <figure className="m-0">
            <div className="overflow-hidden">
              <motion.img
                src="/assets/grocery-shop-in-a-small-town-in.jpg"
                alt="Shelves of a small-town grocery shop in South India, stacked with packaged goods"
                width="1600"
                height="1200"
                loading="lazy"
                style={{ transform: drift }}
                className="block aspect-[4/3] w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[14px] text-muted">
              A grocery shop in a small South Indian town. Every pack on these shelves owes
              its buyer the same six declarations.
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ── How it works ──────────────────────────────────────────────────────── */

function excerpt(startLine, count) {
  const i = Math.max(0, OCR_LINES.indexOf(startLine));
  return OCR_LINES.slice(i, i + count).join("\n");
}
const OCR_EXCERPT = `${excerpt("Net", 6)}\n…\n${excerpt("Batch No", 14)}`;

function HowItWorks() {

  return (
    <section id="how" aria-labelledby="how-title" className="scroll-mt-6 bg-sheet px-4 py-16 sm:px-8 md:py-24 lg:py-32">
      <div className="mx-auto max-w-[1376px]">
        <Reveal as="h2" id="how-title" className="font-display m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.015em]">
          From label photo to verdict
        </Reveal>
        <Reveal as="p" index={1} className="mt-5 max-w-[60ch] text-[18px] leading-[1.6]">
          One pass, three plain stages, each one inspectable. This is the specimen above,
          exactly as the pipeline saw it.
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,5fr)]">
          <Reveal index={0}>
            <h3 className="m-0 text-[22px] font-bold leading-tight">You supply the image</h3>
            <p className="mt-2 text-[16px] leading-[1.55] text-muted">
              Upload a photo or give an image URL. Nothing is scraped from a marketplace.
            </p>
            <img
              src={SPECIMEN.photo}
              alt="The full specimen photo as uploaded"
              width="720"
              height="1280"
              loading="lazy"
              className="mt-5 block aspect-[3/4] w-full object-cover object-top"
            />
          </Reveal>

          <Reveal index={1}>
            <h3 className="m-0 text-[22px] font-bold leading-tight">EasyOCR reads the text</h3>
            <p className="mt-2 text-[16px] leading-[1.55] text-muted">
              Raw and imperfect, kept with every result so a reviewer can see why a field
              was or was not found.
            </p>
            <pre className="mt-5 overflow-x-auto bg-paper px-4 py-4 text-[14px] leading-[1.6] text-ink">
              <code className="font-mono">{OCR_EXCERPT}</code>
            </pre>
          </Reveal>

          <Reveal index={2}>
            <h3 className="m-0 text-[22px] font-bold leading-tight">Six patterns decide</h3>
            <p className="mt-2 text-[16px] leading-[1.55] text-muted">
              Each declaration is one pattern and one citation. No model makes the
              compliance call.
            </p>
            <StampStrip
              missing={HERO_RESULTS.filter((r) => !r.present).map((r) => r.field)}
              className="mt-5"
            />
            <table className="mt-4 w-full border-collapse text-left text-[15px]">
              <caption className="sr-only">Verdict for the specimen label</caption>
              <thead>
                <tr className="text-[13px] text-faint">
                  <th scope="col" className="pb-2 pr-3 font-medium">Declaration</th>
                  <th scope="col" className="pb-2 pr-3 font-medium">Read as</th>
                  <th scope="col" className="pb-2 text-right font-medium">Clause</th>
                </tr>
              </thead>
              <tbody>
                {DECLARATIONS.map((d, i) => {
                  const r = HERO_RESULTS[i];
                  return (
                    // taste-skill-ignore: row rules in a real data table
                    <tr key={d.field} className="border-t border-rule">
                      <th scope="row" className="py-2.5 pr-3 font-semibold">{d.name}</th>
                      <td className={cn("py-2.5 pr-3", r.present ? "text-ink" : "font-semibold text-negative")}>
                        {r.present ? `“${r.matched_text}”` : "Not declared"}
                      </td>
                      <td className="whitespace-nowrap py-2.5 text-right tabular text-muted">{d.clause}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── The six ───────────────────────────────────────────────────────────── */

function TheSix() {
  return (
    <section id="six" aria-labelledby="six-title" className="scroll-mt-6 px-4 py-16 sm:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-[1376px]">
        <Reveal as="h2" id="six-title" className="font-display m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.015em]">
          The six declarations it checks
        </Reveal>
        <Reveal as="p" index={1} className="mt-5 max-w-[60ch] text-[18px] leading-[1.6]">
          The definitive series, catalogued: each stamp with the clause that requires it,
          the plain pattern that looks for it, and the way it most often goes missing.
        </Reveal>

        <Reveal index={2} className="mt-12">
          <table className="w-full border-collapse text-left text-[16px] leading-[1.55]">
            <caption className="sr-only">The six Rule 6 declarations Tula checks</caption>
            <thead>
              <tr className="text-[14px] text-muted">
                <th scope="col" className="w-[136px] pb-3 pr-4 font-normal sm:w-[164px]"><span className="sr-only">Stamp</span></th>
                <th scope="col" className="pb-3 pr-6 font-normal">Declaration and what it requires</th>
                <th scope="col" className="hidden pb-3 pr-6 font-normal md:table-cell">What the pattern looks for</th>
                <th scope="col" className="hidden pb-3 font-normal lg:table-cell">Often fails when</th>
              </tr>
            </thead>
            <tbody>
              {DECLARATIONS.map((d) => {
                const fails = FIELD_META[d.field]?.commonFailures?.[0];
                return (
                  // taste-skill-ignore: row rules in a real data table
                  <tr key={d.field} className="border-t-2 border-ink/80 align-top">
                    <td className="py-5 pr-5">
                      <Stamp decl={d} size="md" state="issued" value={d.short} showVignette={false} bare className="w-[120px] sm:w-[148px]" />
                    </td>
                    <td className="py-5 pr-6">
                      <h3 className="m-0 text-[21px] font-bold leading-tight">
                        {d.name} <span className="whitespace-nowrap text-[16px] font-semibold text-muted tabular">{d.clause}</span>
                      </h3>
                      <p className="m-0 mt-1.5">{d.requires}</p>
                      <p className="m-0 mt-1.5 text-muted md:hidden">Looks for: {d.looksFor}</p>
                    </td>
                    <td className="hidden py-5 pr-6 text-muted md:table-cell">{d.looksFor}</td>
                    <td className="hidden py-5 text-muted lg:table-cell">{fails}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Under the hood ────────────────────────────────────────────────────── */

const STACK = [
  ["Reading the label", "EasyOCR, chosen over Tesseract after both ran on real, unevenly lit label photos. Tesseract stays as the comparison baseline."],
  ["Deciding what is missing", "Six regular-expression patterns in one YAML file, each paired with its LMPC citation. Adding a rule means adding an entry, not retraining anything."],
  ["Keeping the record", "A FastAPI service on PostgreSQL with Alembic migrations. Every listing keeps its image, its raw OCR text and its per-declaration result."],
  ["Working the results", "A React 19 and Vite dashboard on TanStack Query: a listings ledger, per-listing citations, analytics and CSV export."],
  ["Running anywhere", "Docker Compose brings up the database, the API and the dashboard from a clean checkout with one command."],
  ["Staying correct", "36 backend tests run on GitHub Actions against a real Postgres database, real OCR and real rule checks on every push."],
];

function UnderTheHood() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="scroll-mt-6 bg-blue px-4 py-16 text-white sm:px-8 md:py-24 lg:py-36">
      <div className="mx-auto grid max-w-[1376px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Reveal as="h2" id="stack-title" className="font-display m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.015em] text-white">
            Plain, inspectable parts
          </Reveal>
          <Reveal as="p" index={1} className="mt-6 text-[18px] leading-[1.6] text-white">
            Where it is heuristic, it says so. The address check looks for a six-digit PIN
            code, and an OCR misread can hide a declaration that is really there. That is
            why every result keeps the text the machine read.
          </Reveal>
        </div>
        <Reveal index={1} className="lg:col-span-7">
          <table className="w-full border-collapse text-left text-[17px] leading-[1.55]">
            <caption className="sr-only">The parts of the pipeline</caption>
            <tbody>
              {STACK.map(([term, desc]) => (
                // taste-skill-ignore: ledger rows in a real table
                <tr key={term} className="border-t border-white/35 align-top first:border-t-2 first:border-white">
                  <th scope="row" className="w-[34%] py-4 pr-6 text-[19px] font-bold leading-snug text-white">{term}</th>
                  <td className="py-4 text-white">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Tradition ─────────────────────────────────────────────────────────── */

function Tradition() {
  return (
    <section aria-labelledby="trad-title" className="px-4 py-16 sm:px-8 md:py-24 lg:py-36">
      <div className="mx-auto max-w-[1376px]">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5 lg:pt-6">
            <Reveal as="h2" id="trad-title" className="font-display m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.02] tracking-[-0.015em]">
              Every measure carries a stamp
            </Reveal>
            <Reveal as="p" index={1} className="mt-6 text-[18px] leading-[1.6]">
              Weights were struck with a mark to show an inspector had verified them.
              Revenue stamps were overprinted when the rules changed. Tula borrows that
              grammar: a declaration it finds is postmarked with its clause, and one it
              cannot find is overprinted in red.
            </Reveal>
            <Reveal index={2} className="mt-10">
              <figure className="m-0">
                <img
                  src="/assets/a-man-weighing-tomatoes-using-his-tharasu.jpg"
                  alt="A vendor in Madurai weighing tomatoes on a hand-held pan balance"
                  width="1375"
                  height="1600"
                  loading="lazy"
                  className="block aspect-[4/3] w-full object-cover object-top"
                />
                <figcaption className="mt-3 text-[14px] text-muted">
                  Weighing tomatoes on a tharasu, a hand-held balance, in Madurai.
                </figcaption>
              </figure>
            </Reveal>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
            <Reveal index={1}>
              <figure className="m-0">
                <img
                  src="/assets/scales-and-weights.jpg"
                  alt="An oak box of brass coin weights, each struck with verification marks, beside a folding balance"
                  width="1365"
                  height="1600"
                  loading="lazy"
                  className="block aspect-[3/4] w-full object-cover"
                />
                <figcaption className="mt-3 text-[14px] text-muted">
                  Scales and stamped brass weights, probably 18th century. The Met.
                </figcaption>
              </figure>
            </Reveal>
            <Reveal index={2} className="sm:mt-24">
              <figure className="m-0">
                <img
                  src="/assets/travancore-revenue-stamp.jpg"
                  alt="A sheet of red Travancore revenue stamps overprinted in black with a new value and the word Kerala"
                  width="1132"
                  height="1600"
                  loading="lazy"
                  className="block aspect-[3/4] w-full object-cover object-top"
                />
                <figcaption className="mt-3 text-[14px] text-muted">
                  Travancore revenue stamps, overprinted for Kerala in new paise.
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Close ─────────────────────────────────────────────────────────────── */

function Close() {
  return (
    <section aria-labelledby="close-title" className="bg-sheet px-4 py-16 sm:px-8 md:py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1376px] items-end gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal as="h2" id="close-title" className="font-display m-0 text-[clamp(40px,5.2vw,80px)] leading-[1] tracking-[-0.02em]">
            Check your first label
          </Reveal>
          <Reveal as="p" index={1} className="mt-5 max-w-[52ch] text-[18px] leading-[1.6]">
            The demo opens straight into the dashboard with a shared account, no sign-up.
            Upload a label and its sheet is issued in a few seconds.
          </Reveal>
        </div>
        <Reveal index={2} className="flex flex-wrap items-center gap-x-6 gap-y-3 lg:col-span-5 lg:justify-end">
          <Button as={Link} to="/app/ingest" size="lg">
            Check a label
            <ArrowRight className="size-5" aria-hidden="true" />
          </Button>
          <Link to="/app" className="press text-[17px] font-semibold text-blue hover:text-blue-strong">
            Open the dashboard
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="px-4 pb-10 pt-16 sm:px-8">
      <div className="mx-auto max-w-[1376px]">
        <p className="font-display m-0 text-[clamp(64px,15vw,224px)] leading-[0.85] tracking-[-0.03em] text-ink">
          Tula
        </p>
        <div className="mt-8 grid gap-6 text-[15px] leading-[1.6] text-muted lg:grid-cols-12">
          <p className="m-0 lg:col-span-4">
            Tula (तुला) is the traditional Indian balance. A portfolio project checking
            labels against the Legal Metrology (Packaged Commodities) Rules, 2011. Not affiliated with the Department of Consumer
            Affairs. Specimen photos are the project&rsquo;s own.
          </p>
          <p className="credits m-0 lg:col-span-8">
            Pictures:{" "}
            <a className="text-ink" href="https://www.metmuseum.org/art/collection/search/204745">&ldquo;Scales and weights&rdquo;</a>, probably 18th century,{" "}
            <a className="text-ink" href="https://creativecommons.org/publicdomain/zero/1.0/">public domain (CC0)</a>, via The Metropolitan Museum of Art;{" "}
            <a className="text-ink" href="https://commons.wikimedia.org/wiki/File:Travancore_Revenue_Stamp.JPG">&ldquo;Travancore Revenue Stamp&rdquo;</a> by കാക്കര,{" "}
            <a className="text-ink" href="https://creativecommons.org/licenses/by-sa/4.0">CC BY-SA 4.0</a>, via Wikimedia Commons;{" "}
            <a className="text-ink" href="https://commons.wikimedia.org/wiki/File:Grocery_Shop_in_a_small_Town_in_South_India_(1).JPG">&ldquo;Grocery Shop in a small Town in South India (1)&rdquo;</a> by Ask27,{" "}
            <a className="text-ink" href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>, via Wikimedia Commons;{" "}
            <a className="text-ink" href="https://commons.wikimedia.org/wiki/File:A_man_weighing_tomatoes_using_his_Tharasu_in_Madurai.jpg">&ldquo;A man weighing tomatoes using his Tharasu in Madurai&rdquo;</a> by எஸ்ஸார்,{" "}
            <a className="text-ink" href="https://creativecommons.org/licenses/by-sa/3.0">CC BY-SA 3.0</a>, via Wikimedia Commons.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="min-h-svh bg-paper text-ink">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-sheet focus:px-3 focus:py-2">
        Skip to content
      </a>
      <main id="main">
        <Hero />
        <TryTheRules />
        <Why />
        <HowItWorks />
        <TheSix />
        <UnderTheHood />
        <Tradition />
        <Close />
      </main>
      <Footer />
    </div>
  );
}
