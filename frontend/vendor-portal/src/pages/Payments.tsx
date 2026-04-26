import { Calendar, CheckCircle2, Clock, CreditCard, Download, TrendingUp } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { VendorLayout } from "../components/VendorLayout";
import { useApp } from "../contexts/AppContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(n);

const fmtDate = (d: Date) =>
  new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });

const STATUS_CFG = {
  paid:       { label: "שולם",    chip: "bg-success-soft text-success",                  icon: CheckCircle2 },
  pending:    { label: "ממתין",   chip: "bg-warning-soft text-warning-foreground",        icon: Clock },
  processing: { label: "בעיבוד",  chip: "bg-info-soft text-info",                        icon: Clock },
} as const;

type PaymentTab = "all" | "pending" | "paid";

export default function Payments() {
  const { payments, totalEarnings, pendingEarnings, bookings } = useApp();
  const [tab, setTab] = useState<PaymentTab>("all");

  const paidPayments    = payments.filter((p) => p.status === "paid");
  const pendingPayments = payments.filter((p) => p.status !== "paid");
  const totalFees       = paidPayments.reduce((s, p) => s + p.platformFee, 0);

  const displayed = tab === "all" ? payments : tab === "paid" ? paidPayments : pendingPayments;

  const TABS: { key: PaymentTab; label: string; count: number }[] = [
    { key: "all",     label: "הכל",      count: payments.length },
    { key: "pending", label: "ממתינים",  count: pendingPayments.length },
    { key: "paid",    label: "שולמו",    count: paidPayments.length },
  ];

  return (
    <VendorLayout
      title="תשלומים"
      subtitle="ניהול הכנסות ותשלומים"
      actions={
        <button className="flex items-center gap-2 px-4 h-9 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
          <Download className="w-4 h-4" /> ייצוא דוח
        </button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {[
          { icon: CreditCard,   label: 'סה"כ הכנסות',       value: fmt(totalEarnings),    sub: <span className="flex items-center gap-1 text-success text-xs"><TrendingUp className="w-3.5 h-3.5" />+15% מהחודש הקודם</span>, tone: "success" as const },
          { icon: Clock,        label: "ממתין לתשלום",       value: fmt(pendingEarnings),  sub: <span className="text-xs text-muted-foreground">{pendingPayments.length} תשלומים בהמתנה</span>, tone: "warning" as const },
          { icon: CheckCircle2, label: "תשלומים שהתקבלו",   value: `${paidPayments.length}`, sub: <span className="text-xs text-muted-foreground">עמלות: {fmt(totalFees)}</span>, tone: "info" as const },
        ].map((s) => {
          const toneMap = { success: "bg-success-soft text-success", warning: "bg-warning-soft text-warning-foreground", info: "bg-info-soft text-info" };
          return (
            <div key={s.label} className="libi-stat-card">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", toneMap[s.tone])}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{s.value}</div>
              <div className="text-sm text-foreground mt-0.5">{s.label}</div>
              <div className="mt-1">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Payments list */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "px-4 h-9 rounded-lg text-sm font-medium transition-colors",
                  tab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label} ({t.count})
              </button>
            ))}
          </div>

          <div className="libi-card overflow-hidden">
            {displayed.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">אין תשלומים</div>
            ) : (
              <div className="divide-y divide-border">
                {displayed
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((p) => {
                    const booking = bookings.find((b) => b.id === p.bookingId);
                    const cfg = STATUS_CFG[p.status as keyof typeof STATUS_CFG] ?? STATUS_CFG.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", cfg.chip)}>
                          <StatusIcon className="w-4.5 h-4.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{booking?.serviceName || "שירות"}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {p.status === "paid" && p.paidAt ? `שולם: ${fmtDate(p.paidAt)}` : fmtDate(p.createdAt)}
                          </div>
                        </div>
                        <div className="text-left">
                          <span className={cn("libi-chip", cfg.chip)}>{cfg.label}</span>
                          <div className={cn("text-lg font-bold mt-1 tabular-nums", p.status === "paid" ? "text-success" : "text-foreground")}>
                            {fmt(p.netAmount)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Fee breakdown */}
          <div className="libi-card p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">פירוט עמלות</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>סה"כ ברוטו</span>
                <span className="font-medium text-foreground">{fmt(totalEarnings + totalFees)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>עמלת פלטפורמה (7%)</span>
                <span className="font-medium text-destructive">−{fmt(totalFees)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border font-semibold text-foreground">
                <span>נטו לקבל</span>
                <span className="text-success">{fmt(totalEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Bank details */}
          <div className="libi-card p-5">
            <h3 className="text-base font-semibold text-foreground mb-4">פרטי חשבון בנק</h3>
            <div className="space-y-2 text-sm">
              {[["בנק", "לאומי"], ["סניף", "123"], ["חשבון", "****4567"]].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-medium text-foreground">{v}</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
              עדכון פרטי בנק
            </button>
          </div>
        </div>
      </div>
    </VendorLayout>
  );
}
