import { AlertCircle, CheckCircle2, Clock, Search, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { VendorLayout } from "../components/VendorLayout";
import { useApp } from "../contexts/AppContext";

const STATUS_CFG = {
  completed:   { label: "הושלם",         icon: CheckCircle2, chip: "bg-success-soft text-success" },
  confirmed:   { label: "מאושר",          icon: Clock,        chip: "bg-info-soft text-info" },
  in_progress: { label: "בתהליך",         icon: Clock,        chip: "bg-warning-soft text-warning-foreground" },
  pending:     { label: "ממתין לאישור",   icon: AlertCircle,  chip: "bg-warning-soft text-warning-foreground" },
  cancelled:   { label: "בוטל",           icon: XCircle,      chip: "bg-destructive-soft text-destructive" },
} as const;

const CLIENT_NAMES: Record<string, string> = {
  "sarah-cohen": "שרה כהן",
  "client-1": "יוסף לוי",
  "client-2": "רחל מזרחי",
  "client-3": "דוד ביטון",
  "client-4": "מרים גבאי",
  "client-5": "אברהם כהן",
};
const clientName = (id: string) => CLIENT_NAMES[id] || "לקוח/ה";

type Tab = "pending" | "confirmed" | "completed" | "all";

export default function Bookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<Tab>("pending");

  const filtered = bookings.filter((b) => {
    const matchQ = b.serviceName.includes(query) || clientName(b.clientId).includes(query);
    const matchT = tab === "all" || b.status === tab;
    return matchQ && matchT;
  });

  const counts = {
    pending:   bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    all:       bookings.length,
  };

  const confirm  = (id: string) => { updateBookingStatus(id, "confirmed");  toast.success("ההזמנה אושרה ✓"); };
  const complete = (id: string) => { updateBookingStatus(id, "completed");  toast.success("השירות הושלם ✓"); };
  const cancel   = (id: string) => { updateBookingStatus(id, "cancelled");  toast.success("ההזמנה בוטלה"); };

  const TABS: { key: Tab; label: string }[] = [
    { key: "pending",   label: "ממתינים" },
    { key: "confirmed", label: "מאושרים" },
    { key: "completed", label: "הושלמו" },
    { key: "all",       label: "הכל" },
  ];

  return (
    <VendorLayout title="הזמנות" subtitle={`${bookings.length} הזמנות סה״כ`}>
      {/* Search + tabs */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש שירות או לקוח…"
            className="w-full h-10 pr-10 pl-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
          />
        </div>
        <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "px-4 h-9 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5",
                tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
              {t.key !== "all" && counts[t.key] > 0 && (
                <span className={cn(
                  "min-w-5 h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center",
                  tab === t.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {counts[t.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="libi-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-right font-semibold px-5 py-3">שירות</th>
                <th className="text-right font-semibold px-3 py-3 w-28">לקוח/ה</th>
                <th className="text-right font-semibold px-3 py-3 w-28">תאריך</th>
                <th className="text-center font-semibold px-3 py-3 w-16">יחידות</th>
                <th className="text-center font-semibold px-3 py-3 w-20">הכנסה</th>
                <th className="text-center font-semibold px-3 py-3 w-28">סטטוס</th>
                <th className="text-center font-semibold px-3 py-3 w-36">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                    אין הזמנות
                  </td>
                </tr>
              ) : (
                filtered
                  .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                  .map((b) => {
                    const date = new Date(b.scheduledDate);
                    const cfg = STATUS_CFG[b.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <tr key={b.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-3 font-medium text-foreground">{b.serviceName}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5 text-foreground/80">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {clientName(b.clientId)}
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="font-medium text-foreground tabular-nums">
                            {date.toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                          </div>
                          <div className="text-xs text-muted-foreground tabular-nums">
                            {date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-foreground tabular-nums">{b.unitsCost}</td>
                        <td className="px-3 py-3 text-center font-medium text-foreground tabular-nums">
                          ₪{b.unitsCost * 120}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={cn("libi-chip", cfg.chip)}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex gap-1.5 justify-center">
                            {b.status === "pending" && (
                              <>
                                <button onClick={() => confirm(b.id)} className="px-3 h-7 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-glow transition-colors">
                                  אשר
                                </button>
                                <button onClick={() => cancel(b.id)} className="px-2 h-7 rounded-lg border border-border text-xs text-destructive hover:bg-destructive-soft transition-colors">
                                  דחה
                                </button>
                              </>
                            )}
                            {b.status === "confirmed" && (
                              <>
                                <button onClick={() => complete(b.id)} className="px-3 h-7 rounded-lg bg-success text-success-foreground text-xs font-semibold hover:opacity-90 transition-opacity">
                                  הושלם
                                </button>
                                <button onClick={() => cancel(b.id)} className="px-2 h-7 rounded-lg border border-border text-xs text-destructive hover:bg-destructive-soft transition-colors">
                                  בטל
                                </button>
                              </>
                            )}
                            {b.status === "completed" && <span className="text-xs text-success">✓</span>}
                            {b.status === "cancelled" && <span className="text-xs text-muted-foreground">—</span>}
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
