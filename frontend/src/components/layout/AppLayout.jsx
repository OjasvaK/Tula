import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";
import { NAV_ITEMS, NAV_FOOT } from "./navItems";

function titleForPath(pathname) {
  if (pathname.startsWith("/app/listings/")) return "Listing";
  const match = [...NAV_ITEMS, ...NAV_FOOT]
    .sort((a, b) => b.to.length - a.to.length)
    .find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)));
  return match?.label || "Tula";
}

/*
 * Framed sheet: the sidebar (228px) and the 48px top bar share the frame tint
 * as one L with no rule between them; the page is a white sheet inset 8px from
 * the window's right and bottom edges, its edge perforated like a stamp sheet. On a phone the
 * frame falls away and the sheet becomes the screen.
 */
export function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-frame lg:grid lg:grid-cols-[228px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[rgba(21,35,60,0.4)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              aria-label="Navigation"
              className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-frame"
              initial={{ transform: "translateX(-100%)" }}
              animate={{ transform: "translateX(0%)" }}
              exit={{ transform: "translateX(-100%)" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="press absolute right-2 top-3 flex size-9 items-center justify-center rounded-[6px] text-muted hover:bg-active"
                aria-label="Close navigation"
              >
                <X className="size-5" strokeWidth={1.6} />
              </button>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen min-w-0 flex-col">
        <Topbar title={titleForPath(location.pathname)} onOpenSidebar={() => setMobileOpen(true)} />
        <main className="perforated-lg flex-1 bg-sheet lg:mb-2 lg:mr-2">
          <div className="px-4 py-5 sm:px-6 lg:py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
