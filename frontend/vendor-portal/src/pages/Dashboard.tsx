import { Calendar, CheckCircle2, Clock, CreditCard, MapPin, Package, Phone, Star, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { VendorLayout } from "../components/VendorLayout";
import { useApp } from "../contexts/AppContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(n);

// Scenario bookings from LIBI
const LIBI_BOOKINGS = [
  { id: "lb1", service: "מועדון צהריים חברתי", client: "שרה כהן", date: "יום שלישי", time: "12:00", status: "confirmed" as const, units: 1 },
  { id: "lb2", service: "סדנת ציור ויצירה",    client: "שרה כהן", date: "יום ראשון",  time: "10:00", status: "pending"   as const, units: 1 },
];

function StatCard({ icon: Icon, label, value, sub, tone }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string; sub: string;
  tone: "success" | "warning" | "primary" | "info";
}) {
  const toneMap = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    primary: "bg-primary-soft text-primary",
    info:    "bg-info-soft text-info",
  };
  return (
    <div className="libi-stat-card">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", toneMap[tone])}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-sm text-foreground mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const { vendor, services, bookings, totalEarnings, pendingEarnings, completedBookingsCount } = useApp();

  const activeServices = services.filter((s) => s.isActive).length;
  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed" || b.status === "pending")
    .slice(0, 5);

  return (
    <VendorLayout
      title={`שלום, ${vendor.contactName || vendor.name} 👋`}
      subtitle={`${new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })} · ${vendor.serviceAreas.join(", ")}`}
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={CreditCard}   label="הכנסות"   value={fmt(totalEarnings)}        sub='סה"כ שולם'          tone="success" />
        <StatCard icon={Clock}        label="ממתין"     value={fmt(pendingEarnings)}       sub="ממתין לתשלום"       tone="warning" />
        <StatCard icon={Package}      label="שירותים"   value={`${activeServices}`}        sub="פעילים בקטלוג"      tone="primary" />
        <StatCard icon={CheckCircle2} label="הושלמו"    value={`${completedBookingsCount}`} sub="שירותים השבוע"     tone="info"    />
      </div>

      {/* 3+2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT — LIBI bookings + upcoming */}
        <div className="lg:col-span-3 space-y-6">

          {/* New from LIBI */}
          <div className="libi-card p-5 border-info/30 bg-info-soft/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info animate-pulse-soft" />
                הזמנות חדשות מ-LIBI
              </h2>
              <span className="libi-chip bg-info-soft text-info">{LIBI_BOOKINGS.length} חדשות</span>
            </div>
            <div className="space-y-3">
              {LIBI_BOOKINGS.map((b) => (
                <div key={b.id} className={cn(
                  "p-4 rounded-xl border",
                  b.status === "pending"
                    ? "bg-warning-soft/50 border-warning/20"
                    : "bg-success-soft/50 border-success/20"
                )}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{b.service}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{b.client}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>
                      </div>
                    </div>
                    <span className={cn("libi-chip shrink-0",
                      b.status === "pending" ? "bg-warning-soft text-warning-foreground" : "bg-success-soft text-success"
                    )}>
                      {b.status === "pending" ? "ממתין לאישור" : "✓ מאושר"}
                    </span>
                  </div>
                  {b.status === "pending" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-warning/20">
                      <button className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-glow transition-colors">
                        אשר הזמנה
                      </button>
                      <button className="px-4 h-8 rounded-lg border border-border text-xs font-medium text-destructive hover:bg-destructive-soft transition-colors">
                        דחה
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming bookings */}
          <div className="libi-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">הזמנות קרובות</h2>
              <Link to="/bookings" className="text-xs font-medium text-primary hover:underline">כל ההזמנות →</Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-6">אין הזמנות קרובות</p>
            ) : (
              <div className="space-y-1">
                {upcomingBookings.map((b) => {
                  const date = new Date(b.scheduledDate);
                  return (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="w-12 h-12 rounded-xl bg-muted flex flex-col items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-foreground leading-none">{date.getDate()}</span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {date.toLocaleDateString("he-IL", { month: "short" })}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{b.serviceName}</p>
                        <p className="text-xs text-muted-foreground">
                          {date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      <span className={cn("libi-chip",
                        b.status === "pending"   ? "bg-warning-soft text-warning-foreground" :
                        b.status === "confirmed" ? "bg-info-soft text-info" :
                        "bg-success-soft text-success"
                      )}>
                        {b.status === "pending" ? "ממתין" : b.status === "confirmed" ? "מאושר" : "הושלם"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — earnings + services + contact */}
        <div className="lg:col-span-2 space-y-6">

          {/* Earnings summary */}
          <div className="libi-card p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">הכנסות החודש</h2>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-foreground tracking-tight">{fmt(totalEarnings)}</div>
              <div className="text-xs text-muted-foreground mt-1">מתוך {completedBookingsCount} שירותים</div>
            </div>
            <div className="space-y-2 text-sm pt-4 border-t border-border">
              <div className="flex justify-between text-muted-foreground">
                <span>עמלת פלטפורמה (7%)</span>
                <span>{fmt(totalEarnings * 0.07)}</span>
              </div>
              <div className="flex justify-between font-semibold text-foreground pt-1 border-t border-border">
                <span>נטו לקבל</span>
                <span className="text-success">{fmt(totalEarnings * 0.93)}</span>
              </div>
            </div>
            <Link to="/payments">
              <button className="w-full mt-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                פרטי תשלומים
              </button>
            </Link>
          </div>

          {/* Services list */}
          <div className="libi-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">השירותים שלי</h2>
              <Link to="/services" className="text-xs font-medium text-primary hover:underline">ניהול →</Link>
            </div>
            <div className="space-y-1">
              {services.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                  <span className="w-6 h-6 rounded-md bg-primary-soft text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">{s.title}</span>
                  <span className="text-xs font-bold text-foreground tabular-nums">{s.unitCost} יח׳</span>
                  <span className={cn("libi-chip text-[10px]",
                    s.isActive ? "bg-success-soft text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {s.isActive ? "פעיל" : "מוסתר"}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/services/new">
              <button className="w-full mt-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
                + שירות חדש
              </button>
            </Link>
          </div>

          {/* Contact */}
          <div className="libi-card p-4 bg-muted/30">
            <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">פרטי קשר</p>
            <div className="space-y-2 text-sm">
              {vendor.contactName && (
                <div className="flex items-center gap-2 text-foreground/80">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  {vendor.contactName}
                </div>
              )}
              {vendor.phone && (
                <div className="flex items-center gap-2 text-foreground/80">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span dir="ltr">{vendor.phone}</span>
                </div>
              )}
              {vendor.serviceAreas.length > 0 && (
                <div className="flex items-start gap-2 text-foreground/80">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <span>{vendor.serviceAreas.join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
