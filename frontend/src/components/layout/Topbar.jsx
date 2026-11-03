import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, RefreshCw, Search } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export function Topbar({ title, onOpenSidebar }) {
  const { username, logout, retry } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(location.pathname === "/app/listings" ? params.get("q") || "" : "");
  }, [location.pathname, location.search]);

  function submit(e) {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/app/listings?q=${encodeURIComponent(term)}` : "/app/listings");
  }

  function resetSession() {
    setMenuOpen(false);
    logout();
    retry();
  }

  return (
    <header className="flex h-12 items-center gap-3 bg-frame px-3 lg:px-2">
      <button
        type="button"
        onClick={onOpenSidebar}
        className="press flex size-9 items-center justify-center rounded-[6px] text-muted hover:bg-active hover:text-ink lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-5" strokeWidth={1.6} />
      </button>
      <p className="m-0 flex-1 truncate text-[15px] font-semibold text-ink lg:hidden">{title}</p>

      <form role="search" onSubmit={submit} className="relative hidden flex-1 justify-center lg:flex">
        <label htmlFor="global-search" className="sr-only">
          Search listings by product name
        </label>
        <Search className="pointer-events-none absolute left-[calc(50%-262px)] top-1/2 size-4 -translate-y-1/2 text-faint" strokeWidth={1.6} aria-hidden="true" />
        <input
          id="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search listings by product name"
          className="h-8 w-[548px] rounded-[6px] border border-border bg-sheet pl-9 pr-3 text-[14px] text-ink placeholder:text-faint focus:border-blue focus:outline-none"
        />
      </form>

      <div className="relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="press flex h-8 items-center gap-2 rounded-[6px] px-2 text-[14px] text-ink hover:bg-active"
        >
          <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-full bg-blue-soft text-[13px] font-bold text-blue-strong">
            {(username || "?").slice(0, 1).toUpperCase()}
          </span>
          <span className="hidden sm:block">{username || "Account"}</span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <motion.div
                role="menu"
                initial={{ opacity: 0, transform: "translateY(-4px) scale(0.97)" }}
                animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
                exit={{ opacity: 0, transform: "translateY(-4px) scale(0.97)" }}
                transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
                style={{ transformOrigin: "top right" }}
                className="absolute right-0 z-20 mt-1.5 w-64 rounded-[8px] border border-border bg-sheet py-1 shadow-[0_8px_24px_rgba(21,35,60,0.12)]"
              >
                <p className="m-0 px-3.5 py-2.5 text-[13px] leading-snug text-muted">
                  Demo session, signed in automatically as{" "}
                  <span className="font-semibold text-ink">{username || "unknown"}</span>
                </p>
                <button
                  type="button"
                  role="menuitem"
                  onClick={resetSession}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[14px] text-ink hover:bg-raised"
                >
                  <RefreshCw className="size-4 text-faint" strokeWidth={1.6} aria-hidden="true" />
                  Reset session
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
