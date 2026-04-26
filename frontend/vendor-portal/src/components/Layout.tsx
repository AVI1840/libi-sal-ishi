import { Calendar, CreditCard, Heart, LayoutDashboard, LogOut, Package, Settings, Star } from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { useApp } from "../contexts/AppContext";

const NAV = [
  { to: "/",         label: "לוח בקרה",  icon: LayoutDashboard, end: true },
  { to: "/services", label: "שירותים",   icon: Package },
  { to: "/bookings", label: "הזמנות",    icon: Calendar, showBadge: true },
  { to: "/payments", label: "תשלומים",   icon: CreditCard },
  { to: "/settings", label: "הגדרות",    icon: Settings },
];

export default function Layout() {
  const { pathname } = useLocation();
  const { vendor, bookings } = useApp();
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const initials = vendor.name.split(" ").map((n) => n[0]).join("").slice(0, 2);

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Sidebar — fixed right */}
      <aside className="fixed top-0 right-0 h-screen w-64 border-l border-border bg-sidebar flex flex-col z-30">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <div>
              <div className="font-bold text-lg leading-none text-primary">לב</div>
              <div className="text-[11px] text-muted-foreground mt-1">פורטל ספקים</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.end ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.showBadge && pendingCount > 0 && (
                  <span className={cn(
                    "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                    active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"
                  )}>
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Vendor profile */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground flex items-center justify-center text-sm font-semibold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-sidebar-foreground truncate">{vendor.name}</div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-warning fill-warning" />
                <span className="text-[11px] text-muted-foreground">{vendor.rating}</span>
                {vendor.isVerified && <span className="text-[10px] text-success font-medium">· מאומת</span>}
              </div>
            </div>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-background hover:text-destructive transition-colors"
              aria-label="יציאה"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="mr-64 flex-1 min-h-screen animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
