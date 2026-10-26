import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ScanLine,
  ListChecks,
  ShieldCheck,
  FileSearch,
  Gauge,
  ScrollText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { Button } from "../components/ui/Button";
import { FIELD_META } from "../lib/fieldMeta";
import { fieldLabel } from "../lib/format";

const RULE6_FIELDS = [
  "mrp",
  "net_quantity",
  "country_of_origin",
  "consumer_care",
  "manufacturer_address",
  "month_year",
];

const CITATIONS = {
  mrp: "Rule 6(1)(f)",
  net_quantity: "Rule 6(1)(c)",
  country_of_origin: "Rule 6(1)(h)",
  consumer_care: "Rule 6(1)(e)",
  manufacturer_address: "Rule 6(1)(a)",
  month_year: "Rule 6(1)(g)",
};

const STEPS = [
  {
    icon: FileSearch,
    title: "Ingest a label",
    body: "Upload a product-label photo or point the checker at an image URL. No marketplace scraping — you supply the image.",
  },
  {
    icon: ScanLine,
    title: "OCR extraction",
    body: "EasyOCR reads the declaration text off the label, handling imperfect lighting and angled photos.",
  },
  {
    icon: ListChecks,
    title: "Rule 6 check",
    body: "A transparent regex rule engine checks each mandatory declaration and cites the exact LMPC clause for every result.",
  },
];

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" },
  }),
};

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-bg text-content">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand text-on-brand">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-bold">Metrology Compliance Checker</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button as={Link} to={isAuthenticated ? "/app" : "/login"} size="sm">
            {isAuthenticated ? "Open dashboard" : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
          style={{ animation: "float-slow 14s ease-in-out infinite" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <motion.p
              variants={fade}
              initial="hidden"
              animate="show"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-muted"
            >
              <span className="size-1.5 rounded-full bg-brand" />
              Legal Metrology (Packaged Commodities) Rules, 2011
            </motion.p>
            <motion.h1
              variants={fade}
              custom={1}
              initial="hidden"
              animate="show"
              className="mt-4 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl"
            >
              Catch non-compliant e-commerce listings{" "}
              <span className="text-brand">before shoppers do.</span>
            </motion.h1>
            <motion.p
              variants={fade}
              custom={2}
              initial="hidden"
              animate="show"
              className="mt-5 max-w-xl text-base text-muted"
            >
              A regulator-facing tool that reads the mandatory declarations off a
              product label and flags what's missing — every result backed by the
              exact statutory citation, not a black-box score.
            </motion.p>
            <motion.div
              variants={fade}
              custom={3}
              initial="hidden"
              animate="show"
              className="mt-8 flex flex-wrap gap-3"
            >
              <Button as={Link} to={isAuthenticated ? "/app" : "/login"} size="lg">
                {isAuthenticated ? "Go to dashboard" : "Sign in to start"}
                <ArrowRight className="size-4" />
              </Button>
              <Button as="a" href="#how" variant="secondary" size="lg">
                See how it works
              </Button>
            </motion.div>
          </div>

          {/* Floating mock scan card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
            className="relative"
          >
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-float">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  Compliance result
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium text-danger">
                  Flagged · 2 missing
                </span>
              </div>
              <ul className="mt-4 space-y-2.5">
                {[
                  ["Maximum Retail Price", true],
                  ["Net Quantity", true],
                  ["Country of Origin", false],
                  ["Consumer Care Details", true],
                  ["Manufacturer Address", true],
                  ["Month & Year of Manufacture", false],
                ].map(([label, ok], i) => (
                  <motion.li
                    key={label}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-center gap-2.5 text-sm"
                  >
                    <span
                      className={`flex size-5 items-center justify-center rounded-md text-xs ${
                        ok
                          ? "bg-success-soft text-success"
                          : "bg-danger-soft text-danger"
                      }`}
                    >
                      {ok ? "✓" : "✕"}
                    </span>
                    <span className="text-content">{label}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Three steps, fully explainable
        </h2>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fade}
              custom={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-80px" }}
              className="rounded-2xl border border-line bg-surface p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand">
                <s.icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* What it checks */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-center gap-2">
          <ScrollText className="size-5 text-brand" />
          <h2 className="text-2xl font-bold sm:text-3xl">
            The six mandatory declarations
          </h2>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Every packaged commodity sold online must carry these under Rule 6. The
          checker looks for each one and tells you which clause it satisfies.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RULE6_FIELDS.map((field, i) => {
            const meta = FIELD_META[field];
            const Icon = meta.icon;
            return (
              <motion.div
                key={field}
                variants={fade}
                custom={i}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="rounded-2xl border border-line bg-surface p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-surface-2 text-brand">
                    <Icon className="size-5" />
                  </div>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-semibold text-brand">
                    {CITATIONS[field]}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{fieldLabel(field)}</h3>
                <p className="mt-1 text-xs text-muted">{meta.why}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface px-6 py-12 text-center">
          <Gauge className="size-8 text-brand" />
          <h2 className="text-2xl font-bold">Ready to run a check?</h2>
          <p className="max-w-md text-sm text-muted">
            This is an internal regulator tool — access is by issued account only.
          </p>
          <Button as={Link} to={isAuthenticated ? "/app" : "/login"} size="lg">
            {isAuthenticated ? "Open dashboard" : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </section>

      <footer className="border-t border-line py-8 text-center text-xs text-subtle">
        Built as a portfolio project · Checks against LMPC Rules 2011, Rule 6
      </footer>
    </div>
  );
}
