import { Clock, Edit, Eye, EyeOff, Package, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { VendorLayout } from "../components/VendorLayout";
import { useApp } from "../contexts/AppContext";

const CATEGORY_LABELS: Record<string, string> = {
  physiotherapy: "פיזיותרפיה", nursing: "סיעוד", social: "פעילות חברתית",
  wellness: "רווחה", medical: "שירותי רפואה", culture: "תרבות",
  fitness: "כושר", prevention: "מניעה", other: "אחר",
};

export default function Services() {
  const { services, updateService, deleteService, bookings } = useApp();
  const [query, setQuery] = useState("");

  const filtered = services.filter(
    (s) => s.title.includes(query) || s.category.includes(query)
  );

  const bookingCount = (id: string) => bookings.filter((b) => b.serviceId === id).length;

  const toggle = (id: string, active: boolean) => {
    updateService(id, { isActive: !active });
    toast.success(active ? "השירות הוסתר" : "השירות הופעל");
  };

  const remove = (id: string) => {
    if (confirm("למחוק שירות זה?")) { deleteService(id); toast.success("השירות נמחק"); }
  };

  return (
    <VendorLayout
      title="השירותים שלי"
      subtitle={`${services.length} שירותים · ${services.filter((s) => s.isActive).length} פעילים`}
      actions={
        <Link to="/services/new">
          <button className="flex items-center gap-2 px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
            <Plus className="w-4 h-4" /> שירות חדש
          </button>
        </Link>
      }
    >
      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש שירותים…"
            className="w-full h-10 pr-10 pl-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="libi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-right font-semibold px-5 py-3">שירות</th>
                <th className="text-right font-semibold px-3 py-3 w-28">קטגוריה</th>
                <th className="text-center font-semibold px-3 py-3 w-16">יחידות</th>
                <th className="text-center font-semibold px-3 py-3 w-16">משך</th>
                <th className="text-center font-semibold px-3 py-3 w-20">הזמנות</th>
                <th className="text-center font-semibold px-3 py-3 w-16">סטטוס</th>
                <th className="text-center font-semibold px-3 py-3 w-28">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    לא נמצאו שירותים
                    <div className="mt-3">
                      <Link to="/services/new">
                        <button className="flex items-center gap-1.5 mx-auto px-4 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
                          <Plus className="w-4 h-4" /> צור שירות חדש
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const count = bookingCount(s.id);
                  return (
                    <tr key={s.id} className={cn("border-t border-border hover:bg-muted/30 transition-colors", !s.isActive && "opacity-50")}>
                      <td className="px-5 py-3">
                        <div className="font-medium text-foreground">{s.title}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[280px]">{s.description}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="libi-chip bg-muted text-muted-foreground">
                          {CATEGORY_LABELS[s.category] || s.category}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center font-bold text-primary tabular-nums">{s.unitCost}</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />{s.durationMinutes || 60}׳
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn("font-medium tabular-nums", count > 0 ? "text-foreground" : "text-muted-foreground/40")}>
                          {count}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={cn("libi-chip", s.isActive ? "bg-success-soft text-success" : "bg-muted text-muted-foreground")}>
                          {s.isActive ? "פעיל" : "מוסתר"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex gap-1 justify-center">
                          <Link to={`/services/${s.id}/edit`}>
                            <button className="p-1.5 rounded-md hover:bg-muted transition-colors" title="עריכה">
                              <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </Link>
                          <button onClick={() => toggle(s.id, s.isActive)} className="p-1.5 rounded-md hover:bg-muted transition-colors" title={s.isActive ? "הסתר" : "הפעל"}>
                            {s.isActive ? <EyeOff className="w-3.5 h-3.5 text-muted-foreground" /> : <Eye className="w-3.5 h-3.5 text-muted-foreground" />}
                          </button>
                          <button onClick={() => remove(s.id)} className="p-1.5 rounded-md hover:bg-destructive-soft transition-colors" title="מחק">
                            <Trash2 className="w-3.5 h-3.5 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </VendorLayout>
  );
}
