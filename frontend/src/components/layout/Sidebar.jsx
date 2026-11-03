import { Link, NavLink } from "react-router-dom";
import { cn } from "../../lib/cn";
import { Wordmark } from "../stamp/Wordmark";
import { NAV_ITEMS, NAV_FOOT } from "./navItems";

function NavItem({ item, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "press flex h-[34px] items-center gap-2.5 rounded-[6px] px-2.5 text-[15px] no-underline",
          isActive ? "bg-active font-semibold text-ink" : "text-muted hover:bg-active/60 hover:text-ink"
        )
      }
    >
      <item.icon className="size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      {item.label}
    </NavLink>
  );
}

export function SidebarContent({ onNavigate }) {
  return (
    <div className="flex h-full flex-col px-3 pb-4 pt-4">
      <Link to="/" onClick={onNavigate} className="px-1.5 no-underline" aria-label="Tula, back to the landing page">
        <Wordmark />
      </Link>
      <p className="mb-0 mt-4 px-2.5 text-[13px] leading-snug text-faint">
        Demo workspace
        <br />
        <span className="text-muted">LMPC Rules 2011, Rule 6</span>
      </p>

      <nav aria-label="Main" className="mt-6 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>

      <nav aria-label="Support" className="mt-auto flex flex-col gap-0.5">
        {NAV_FOOT.map((item) => (
          <NavItem key={item.to} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
    </div>
  );
}
