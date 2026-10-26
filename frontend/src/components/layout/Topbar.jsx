import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { ThemeToggle } from "../ui/ThemeToggle";

export function Topbar({ title, onOpenSidebar }) {
  const { username, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onOpenSidebar}
        className="flex size-9 items-center justify-center rounded-lg border border-line text-muted lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="size-4" />
      </button>

      <h1 className="flex-1 truncate text-sm font-semibold text-content">
        {title}
      </h1>

      <ThemeToggle />

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-content"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-brand-soft text-brand">
            <User className="size-3.5" />
          </span>
          <span className="hidden max-w-[10rem] truncate sm:block">
            {username || "Account"}
          </span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-line bg-surface shadow-pop"
              >
                <div className="border-b border-line px-4 py-3">
                  <p className="text-xs text-subtle">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-content">
                    {username || "unknown"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-surface-2"
                >
                  <LogOut className="size-4" />
                  Log out
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
