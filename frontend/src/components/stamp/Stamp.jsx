import { cn } from "../../lib/cn";
import { Guilloche } from "./Guilloche";
import { Postmark } from "./Postmark";

const SIZES = {
  lg: {
    perf: "",
    reserve: "sm:pr-[36%]",
    postmark: "right-[4%] top-[46px] w-[42%]",
    overprint: "top-[40px]",
    pad: "p-[10px]",
    inner: "gap-2 p-3",
    head: "text-[13px]",
    vignette: "h-[64px]",
    denom: "text-[19px] sm:text-[30px]",
    name: "text-[17px]",
    over: "text-[clamp(19px,2vw,28px)]",
    bar: "h-[5px]",
  },
  md: {
    perf: "perforated-md",
    reserve: "",
    band: "pb-[52px]",
    postmark: "right-[3%] bottom-[6%] w-[52%]",
    overprint: "top-[26%]",
    pad: "p-[8px]",
    inner: "gap-1.5 p-2.5",
    head: "text-[12px]",
    vignette: "h-[46px]",
    denom: "text-[21px]",
    name: "text-[14px]",
    over: "text-[clamp(17px,1.5vw,22px)]",
    bar: "h-[4px]",
  },
};

/**
 * One declaration printed as a perforated stamp in an engraved double frame.
 * state: "present" (postmarked with its clause), "missing" (overprinted in
 * carmine), "issued" (the series itself, unmarked) or "pending".
 * value: what the stamp states as its denomination — the declared value for a
 * found declaration, never the keyword that matched.
 * timing: optional { strike } delay in ms; the stamp is issued at once and
 * only the cancellation or overprint strikes in.
 */
export function Stamp({
  decl,
  state = "pending",
  value,
  vignette,
  vignetteAlt = "",
  showVignette = true,
  bare = false,
  size = "lg",
  timing,
  className,
}) {
  const s = SIZES[size];
  const printed = state !== "pending";
  // Without a picture to cross, the overprint takes the value's place so the name stays readable.
  const inlineOverprint = state === "missing" && !showVignette;
  const shown = state === "missing" ? "—" : value || (state === "present" ? "Found" : "");
  const label =
    state === "present"
      ? `${decl.name}: found, ${value || "declared"}, ${decl.clause}`
      : state === "missing"
        ? `${decl.name}: not declared, ${decl.clause}`
        : state === "issued"
          ? `${decl.name}, ${decl.clause}`
          : `${decl.name}: not checked yet`;

  return (
    <figure
      role="img"
      aria-label={label}
      data-ui
      className={cn("perforated relative m-0 bg-stamp-paper", s.perf, s.pad, className)}
      style={{ "--stamp-ink": decl.ink }}
    >
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden border-[6px] border-double",
          s.inner,
          !printed && "opacity-40",
          state === "present" && s.band
        )}
        style={{ borderColor: printed ? "var(--stamp-ink)" : "var(--control)" }}
      >
        <Guilloche
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.16]"
          style={{ color: printed ? "var(--stamp-ink)" : "var(--control)" }}
        />
        <div
          className={cn("relative flex items-baseline justify-between font-bold leading-none tabular", s.head)}
          style={{ color: printed ? "var(--stamp-ink)" : "var(--faint)" }}
        >
          <span>{decl.clause}</span>
          {!bare && <span>Tula</span>}
        </div>

        {showVignette && (
          <div
            className={cn("relative w-full overflow-hidden bg-white outline-2 outline-offset-0", s.vignette)}
            style={{ outlineColor: "var(--stamp-ink)", outlineStyle: "solid" }}
          >
            {vignette ? (
              <>
                <img
                  src={vignette}
                  alt={vignetteAlt}
                  loading="lazy"
                  decoding="async"
                  className="block h-full w-full object-contain [filter:grayscale(1)_contrast(1.9)_brightness(1.18)]"
                />
                <span aria-hidden="true" className="absolute inset-0 mix-blend-screen" style={{ background: "var(--stamp-ink)" }} />
              </>
            ) : (
              <Guilloche
                className="absolute inset-0 h-full w-full opacity-60"
                style={{ color: "var(--stamp-ink)" }}
              />
            )}
          </div>
        )}

        {inlineOverprint ? (
          <Overprint s={s} timing={timing} className="relative mx-[4%] my-4" />
        ) : (
          <div
            className={cn("relative font-display leading-[1.05] tabular", bare ? "text-[16px] sm:text-[21px]" : cn(s.denom, "[overflow-wrap:anywhere]"), state === "present" && s.reserve)}
            style={{ color: "var(--stamp-ink)", minHeight: "1em" }}
          >
            {shown}
          </div>
        )}
        {!bare && (
        <figcaption
          lang="en"
          className={cn("relative font-bold leading-tight text-ink [hyphens:auto] break-words", s.name, state === "present" && s.reserve)}
        >
          {decl.name}
        </figcaption>
        )}
      </div>

      {state === "present" && (
        <Postmark
          clause={decl.clause}
          className={cn("pointer-events-none absolute cancel opacity-[0.88]", s.postmark, timing && "anim-strike")}
          style={timing ? { animationDelay: `${timing.strike}ms` } : undefined}
        />
      )}

      {state === "missing" && !inlineOverprint && (
        <Overprint s={s} timing={timing} className={cn("absolute inset-x-[8%]", s.overprint)} />
      )}
    </figure>
  );
}

/** "Not declared" between two bars, struck at the shared cancel angle. */
function Overprint({ s, timing, className }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none flex flex-col items-center gap-1.5 cancel", className, timing && "anim-overprint")}
      style={timing ? { animationDelay: `${timing.strike}ms` } : undefined}
    >
      <span className={cn("w-full bg-carmine", s.bar)} />
      <span className={cn("whitespace-nowrap font-display leading-none text-carmine", s.over)}>Not declared</span>
      <span className={cn("w-full bg-carmine", s.bar)} />
    </div>
  );
}
