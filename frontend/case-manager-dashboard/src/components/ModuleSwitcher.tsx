/**
 * Module Switcher — מאפשר מעבר בין מודולים בהדר
 * מבוסס על AppShell מ-harmony
 */

import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: "coordinator", label: "👩‍⚕️ מתאמת", path: "/", icon: LayoutDashboard, description: "לוח בקרה יומי" },
  { id: "strategic", label: "📊 ניהולי", path: "/strategic", icon: Building2, description: "דשבורד ניהולי" },
];

export default function ModuleSwitcher() {
  const { pathname } = useLocation();

  const activeModule = pathname === "/strategic" ? "strategic" : "coordinator";

  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
      {MODULES.map((m) => {
        const isActive = m.id === activeModule;
        return (
          <NavLink
            key={m.id}
            to={m.path}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {m.label}
          </NavLink>
        );
      })}
    </div>
  );
}
