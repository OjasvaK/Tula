import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Wordmark } from "../components/stamp/Wordmark";

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-paper px-4 sm:px-8">
      <header className="mx-auto flex h-[76px] w-full max-w-[1376px] items-center">
        <Link to="/" className="no-underline" aria-label="Tula, home">
          <Wordmark />
        </Link>
      </header>
      <main className="mx-auto flex w-full max-w-[1376px] flex-1 flex-col items-start justify-center gap-6 pb-24">
        <div className="perforated relative bg-stamp-paper p-[10px]" aria-hidden="true">
          <div className="flex h-[180px] w-[150px] flex-col justify-between border-[3px] border-slate p-3">
            <span className="text-[13px] font-bold text-slate">Tula</span>
            <span className="font-display text-[56px] leading-none text-slate tabular">404</span>
          </div>
          <div className="cancel absolute inset-x-[6%] top-[38%] flex flex-col items-center gap-1">
            <span className="h-[4px] w-full bg-carmine" />
            <span className="font-display text-[24px] leading-none text-carmine">Not issued</span>
            <span className="h-[4px] w-full bg-carmine" />
          </div>
        </div>
        <h1 className="font-display m-0 text-[clamp(40px,5vw,72px)] leading-[1] tracking-[-0.02em] text-ink">
          No sheet at this address
        </h1>
        <p className="m-0 max-w-[48ch] text-[18px] leading-[1.6] text-ink">
          No listing, page or clause lives here. It may have been deleted, or the link was
          mistyped.
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button as={Link} to="/app" size="lg">Go to the dashboard</Button>
          <Link to="/" className="press text-[17px] font-semibold text-blue hover:text-blue-strong">Back to the start</Link>
        </div>
      </main>
    </div>
  );
}
