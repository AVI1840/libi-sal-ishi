import { Avatar, AvatarFallback, AvatarImage } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import {
    Calendar,
    CreditCard,
    Heart,
    LayoutDashboard,
    LogOut,
    Package,
    Settings,
    Star,
} from "lucide-react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "לוח בקרה" },
  { path: "/services", icon: Package, label: "שירותים" },
  { path: "/bookings", icon: Calendar, label: "הזמנות" },
  { path: "/payments", icon: CreditCard, label: "תשלומים" },
  { path: "/settings", icon: Settings, label: "הגדרות" },
];

export default function Layout() {
  const location = useLocation();
  const { vendor, bookings } = useApp();

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">לב</h1>
              <p className="text-xs text-gray-500">פורטל ספקים</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {item.path === "/bookings" && pendingBookings > 0 && (
                  <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                    {pendingBookings}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Vendor Profile */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={vendor.logo} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {vendor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {vendor.name}
              </p>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span className="text-xs text-gray-500">{vendor.rating}</span>
              </div>
            </div>
          </div>
          <button className="sidebar-nav-item w-full text-red-600 hover:bg-red-50 hover:text-red-700">
            <LogOut className="w-5 h-5" />
            <span>התנתקות</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
