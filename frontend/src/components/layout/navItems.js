import {
  LayoutDashboard,
  ListChecks,
  ScanLine,
  BarChart3,
  LifeBuoy,
} from "lucide-react";

export const NAV_ITEMS = [
  { to: "/app", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/app/listings", label: "Listings", icon: ListChecks },
  { to: "/app/ingest", label: "Check a Listing", icon: ScanLine },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/help", label: "Help", icon: LifeBuoy },
];
