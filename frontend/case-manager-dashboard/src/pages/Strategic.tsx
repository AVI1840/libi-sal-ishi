/**
 * דשבורד אסטרטגי — ביטוח לאומי ומשרד האוצר
 *
 * מציג תמונת מצב ברמת מערכת: אתרים, תקציב, ניצול, מניעה,
 * עומס מלוות, ספקים, ומוכנות להרחבה.
 */

import AppLayout from "@/components/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { ProgressBar } from "@/components/common/ProgressBar";
import { cn } from "@/lib/utils";
import {
  Users, Wallet, Heart, TrendingUp, Building2, UserCheck, Package,
  ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Target,
  Clock, CreditCard, BarChart3,
} from "lucide-react";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const SYSTEM_KPI = [
  { label: "אזרחים במערכת",     value: "736",       sub: "4 אתרים",          icon: Users,       tone: "primary" as const, trend: null },
  { label: "ניצול סל ממוצע",    value: "67%",       sub: "יעד: 85%",         icon: Wallet,      tone: "warning" as const, trend: { dir: "up", delta: "+4%" } },
  { label: "שירותי מניעה",      value: "54%",       sub: "יעד: 60%",         icon: Heart,       tone: "success" as const, trend: { dir: "up", delta: "+8%" } },
  { label: "תקציב חודשי",       value: "₪1.2M",     sub: "ממוצע לאתר",       icon: CreditCard,  tone: "primary" as const, trend: null },
  { label: "עלות לאזרח",        value: "₪1,840",    sub: "לחודש",            icon: BarChart3,   tone: "primary" as const, trend: { dir: "down", delta: "-6%" } },
  { label: "שביעות רצון",       value: "4.7",       sub: "מתוך 5",           icon: TrendingUp,  tone: "success" as const, trend: { dir: "up", delta: "+0.3" } },
];

const SITES = [
  { name: "פסגת זאב",  citizens: 286, escorts: 4, providers: 12, walletUtil: 71, prevention: 54, satisfaction: 4.7, budget: "₪526K", status: "active" as const },
  { name: "גילה",      citizens: 150, escorts: 2, providers: 8,  walletUtil: 0,  prevention: 0,  satisfaction: 0,   budget: "₪276K", status: "planned" as const },
  { name: "קטמון",     citizens: 120, escorts: 2, providers: 6,  walletUtil: 0,  prevention: 0,  satisfaction: 0,   budget: "₪221K", status: "planned" as const },
  { name: "עיר גנים",  citizens: 180, escorts: 3, providers: 10, walletUtil: 0,  prevention: 0,  satisfaction: 0,   budget: "₪331K", status: "planned" as const },
];

const PREVENTION_BREAKDOWN = [
  { world: "שייכות ומשמעות",         pct: 34, subsidy: 100, color: "bg-info" },
  { world: "בריאות ותפקוד",          pct: 28, subsidy: 100, color: "bg-success" },
  { world: "חוסן ועצמאות",           pct: 18, subsidy: 50,  color: "bg-primary" },
  { world: "טכנולוגיה מסייעת",       pct: 12, subsidy: 50,  color: "bg-warning" },
  { world: "שירותי בית",             pct: 8,  subsidy: 20,  color: "bg-muted-foreground" },
];

const ESCORT_LOAD = [
  { name: "שרית מזרחי",  site: "פסגת זאב", clients: 75, atRisk: 12, actions: 8,  load: "גבוה" },
  { name: "דנה לוי",     site: "פסגת זאב", clients: 72, atRisk: 9,  actions: 6,  load: "גבוה" },
  { name: "מיכל כהן",    site: "פסגת זאב", clients: 70, atRisk: 7,  actions: 5,  load: "בינוני" },
  { name: "רונית אברהם", site: "פסגת זאב", clients: 69, atRisk: 8,  actions: 4,  load: "בינוני" },
];

const PROVIDER_SUMMARY = [
  { name: "מתנ\"ס פסגת זאב",       services: 6, bookings: 89,  rating: 4.8, status: "מאושר" },
  { name: "פיזיו פלוס",            services: 3, bookings: 45,  rating: 4.9, status: "מאושר" },
  { name: "מגע מרפא",              services: 2, bookings: 23,  rating: 4.6, status: "מאושר" },
  { name: "שירותי סיעוד אהבה",     services: 4, bookings: 67,  rating: 4.5, status: "מאושר" },
  { name: "בית נקי",               services: 2, bookings: 34,  rating: 4.2, status: "בבדיקה" },
];

const RISK_SUMMARY = [
  { flag: "בדידות",           count: 18, pct: 6.3,  tone: "destructive" as const },
  { flag: "חוסר פעילות",      count: 12, pct: 4.2,  tone: "warning" as const },
  { flag: "יתרה נמוכה",       count: 9,  pct: 3.1,  tone: "warning" as const },
  { flag: "ירידה תפקודית",    count: 7,  pct: 2.4,  tone: "destructive" as const },
  { flag: "סיכון נפילה",      count: 5,  pct: 1.7,  tone: "destructive" as const },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

const toneMap = {
  primary: "bg-primary-soft text-primary",
  warning: "bg-warning-soft text-warning-foreground",
  success: "bg-success-soft text-success",
  info:    "bg-info-soft text-info",
};

export default function Strategic() {
  const totalCitizens = SITES.reduce((s, site) => s + site.citizens, 0);
  const totalEscorts  = SITES.reduce((s, site) => s + site.escorts, 0);
  const totalProviders = SITES.reduce((s, site) => s + site.providers, 0);
  const activeSites   = SITES.filter((s) => s.status === "active").length;

  return (
    <AppLayout
      title="דשבורד אסטרטגי — סל אישי"
      subtitle={`${activeSites} אתרים פעילים · ${totalCitizens} אזרחים · ${totalEscorts} מלוות · ${totalProviders} ספקים`}
    >
      {/* Banner */}
      <div className="mb-6 p-3 rounded-lg border border-primary/20 bg-primary-soft/30 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 text-xs font-bold">ס״א</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-foreground">סל אישי — תמונת מצב מערכתית</div>
          <div className="text-[11px] text-muted-foreground">נתוני דמו · הלוגיקה והמבנה מדגימים את מודל ההפעלה לפיילוטים מבוקרים</div>
        </div>
      </div>

      {/* ── 1. System KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {SYSTEM_KPI.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="libi-stat-card">
              <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2", toneMap[kpi.tone])}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="text-xl font-bold text-foreground tracking-tight">{kpi.value}</div>
              <div className="text-xs text-foreground mt-0.5">{kpi.label}</div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-[11px] text-muted-foreground">{kpi.sub}</span>
                {kpi.trend && (
                  <span className={cn("text-[11px] font-semibold flex items-center gap-0.5",
                    kpi.trend.dir === "up" ? "text-success" : "text-destructive"
                  )}>
                    {kpi.trend.dir === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {kpi.trend.delta}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">

        {/* ── 2. Site Comparison (3 cols) ── */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="אתרי פיילוט" subtitle="ירושלים — פעילים ומתוכננים" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-right py-2.5 px-3 font-semibold">אתר</th>
                    <th className="text-center py-2.5 px-2 font-semibold">אזרחים</th>
                    <th className="text-center py-2.5 px-2 font-semibold">מלוות</th>
                    <th className="text-center py-2.5 px-2 font-semibold">ספקים</th>
                    <th className="text-center py-2.5 px-2 font-semibold">ניצול</th>
                    <th className="text-center py-2.5 px-2 font-semibold">מניעה</th>
                    <th className="text-center py-2.5 px-2 font-semibold">תקציב</th>
                    <th className="text-center py-2.5 px-2 font-semibold">סטטוס</th>
                  </tr>
                </thead>
                <tbody>
                  {SITES.map((s) => (
                    <tr key={s.name} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-foreground">{s.name}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums">{s.citizens}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums">{s.escorts}</td>
                      <td className="py-2.5 px-2 text-center tabular-nums">{s.providers}</td>
                      <td className="py-2.5 px-2 text-center">
                        {s.walletUtil > 0 ? (
                          <span className="font-semibold text-foreground tabular-nums">{s.walletUtil}%</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {s.prevention > 0 ? (
                          <span className="font-semibold text-foreground tabular-nums">{s.prevention}%</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-2 text-center text-muted-foreground tabular-nums">{s.budget}</td>
                      <td className="py-2.5 px-2 text-center">
                        <Chip tone={s.status === "active" ? "success" : "muted"}>
                          {s.status === "active" ? "פעיל" : "מתוכנן"}
                        </Chip>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="py-2.5 px-3 font-bold text-foreground">סה״כ</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">{totalCitizens}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">{totalEscorts}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">{totalProviders}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">67%</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">54%</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">₪1.35M</td>
                    <td className="py-2.5 px-2 text-center">
                      <Chip tone="primary">{activeSites}/{SITES.length}</Chip>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* ── 3. Prevention Breakdown (2 cols) ── */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="פילוח לפי עולם תוכן" subtitle="חלוקת שירותים ואחוזי סבסוד" />
            <div className="space-y-3">
              {PREVENTION_BREAKDOWN.map((w) => (
                <div key={w.world}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{w.world}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-foreground tabular-nums">{w.pct}%</span>
                      <Chip tone={w.subsidy === 100 ? "success" : w.subsidy === 50 ? "warning" : "muted"}>
                        {w.subsidy}% סבסוד
                      </Chip>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", w.color)} style={{ width: `${w.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">שירותי מניעה (100% סבסוד)</span>
              <span className="text-sm font-bold text-success tabular-nums">62%</span>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* ── 4. Escort Load ── */}
        <Card>
          <CardHeader title="עומס מלוות" subtitle="פסגת זאב — 4 מלוות" />
          <div className="space-y-2">
            {ESCORT_LOAD.map((e) => (
              <div key={e.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary-soft text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {e.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">{e.clients} אזרחים · {e.atRisk} בסיכון · {e.actions} פעולות</div>
                </div>
                <Chip tone={e.load === "גבוה" ? "destructive" : "warning"}>{e.load}</Chip>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">ממוצע לקוחות למלווה</span>
              <span className="font-bold text-foreground tabular-nums">71.5</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">יעד מקסימלי</span>
              <span className="font-bold text-foreground tabular-nums">75</span>
            </div>
          </div>
        </Card>

        {/* ── 5. Provider Summary ── */}
        <Card>
          <CardHeader title="ספקים" subtitle={`${PROVIDER_SUMMARY.length} ספקים רשומים`} />
          <div className="space-y-2">
            {PROVIDER_SUMMARY.map((p) => (
              <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                  <div className="text-[11px] text-muted-foreground">{p.services} שירותים · {p.bookings} הזמנות</div>
                </div>
                <div className="text-xs font-bold text-foreground tabular-nums">{p.rating}</div>
                <Chip tone={p.status === "מאושר" ? "success" : "warning"}>{p.status}</Chip>
              </div>
            ))}
          </div>
        </Card>

        {/* ── 6. Risk Distribution ── */}
        <Card>
          <CardHeader title="דגלי סיכון" subtitle="התפלגות במערכת" />
          <div className="space-y-3">
            {RISK_SUMMARY.map((r) => (
              <div key={r.flag}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{r.flag}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground tabular-nums">{r.count}</span>
                    <span className="text-[11px] text-muted-foreground">({r.pct}%)</span>
                  </div>
                </div>
                <ProgressBar value={r.pct} max={10} tone={r.tone === "destructive" ? "destructive" : "warning"} size="sm" />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">סה״כ אזרחים בסיכון</span>
            <span className="text-sm font-bold text-destructive tabular-nums">51 (6.9%)</span>
          </div>
        </Card>
      </div>

      {/* ── 7. Key Decisions ── */}
      <Card className="mb-8">
        <CardHeader title="הכרעות נדרשות להרחבה" subtitle="נושאים הממתינים לאישור" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: Building2,   title: "מודל התקשרויות",     desc: "3 צירים: מפעיל מערכת, מפעיל שטח, ספקים מקומיים. נדרש אישור מבנה חוזי.", tone: "primary" as const },
            { icon: CreditCard,  title: "מסגרת תקציבית",      desc: "תקרות מחיר ליחידה, תקציב חודשי לאתר, מודל תשלום לספקים.", tone: "warning" as const },
            { icon: ShieldCheck, title: "אבטחה ופרטיות",      desc: "הצפנת PII, הרשאות RBAC, תקנות פרטיות, אישור CISO.", tone: "destructive" as const },
          ].map((d) => {
            const Icon = d.icon;
            const tones = {
              primary: "bg-primary-soft text-primary border-primary/20",
              warning: "bg-warning-soft text-warning-foreground border-warning/20",
              destructive: "bg-destructive-soft text-destructive border-destructive/20",
            };
            return (
              <div key={d.title} className={cn("rounded-xl border p-5", tones[d.tone])}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-card/80 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-base font-bold">{d.title}</div>
                </div>
                <p className="text-sm leading-relaxed opacity-90">{d.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </AppLayout>
  );
}
