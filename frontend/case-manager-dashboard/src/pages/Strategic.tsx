/**
 * דשבורד ניהולי — Management Dashboard
 *
 * משלב את הרכיבים מ-harmony:
 * - ציר זמן רפורמה
 * - מפת פיילוטים
 * - KPI trends (SDI/RDI)
 * - סטטיסטיקות מערכתיות
 * - הכרעות נדרשות
 */

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { ProgressBar } from "@/components/common/ProgressBar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Users, Wallet, Heart, TrendingUp, Building2, UserCheck, Package,
  ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Target,
  Clock, CreditCard, BarChart3, CheckCircle2, Circle, UserCog, TrendingDown,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell,
} from "recharts";

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */

const SYSTEM_KPI = [
  { label: "רשויות פעילות",     value: "1/5",       sub: "פיילוט ירושלים",   icon: Building2,   tone: "primary" as const, trend: null },
  { label: "אזרחים במערכת",     value: "736",       sub: "4 אתרים",          icon: Users,       tone: "primary" as const, trend: { dir: "up", delta: "+12%" } },
  { label: "מתאמות שירות",      value: "5",         sub: "ממוצע 71 לקוחות",  icon: UserCog,     tone: "primary" as const, trend: null },
  { label: "SDI ממוצע ארצי",    value: "24.3",      sub: "יעד: 30+",         icon: BarChart3,   tone: "success" as const, trend: { dir: "up", delta: "+2.1" } },
  { label: "RDI ממוצע ארצי",    value: "1.14",      sub: "יעד: <1.0",        icon: TrendingDown, tone: "success" as const, trend: { dir: "down", delta: "-0.11" } },
  { label: "שביעות רצון",       value: "4.7",       sub: "מתוך 5",           icon: TrendingUp,  tone: "success" as const, trend: { dir: "up", delta: "+0.3" } },
];

const TIMELINE = [
  { label: "נייר מדיניות",    date: "1.2025",   status: "done" as const },
  { label: "מחקר EY",         date: "12.2024",  status: "done" as const },
  { label: "סדנת עיצוב",      date: "11.2024",  status: "done" as const },
  { label: "אפיון MVP",       date: "3.2026",   status: "done" as const },
  { label: "פיילוט ירושלים",  date: "בתהליך",   status: "active" as const },
  { label: "לוח ח-2",         date: "טיוטה",    status: "pending" as const },
  { label: "קול קורא",        date: "גרסה 2",   status: "pending" as const },
  { label: "הרחבה ל-5 רשויות", date: "",         status: "pending" as const },
  { label: "הטמעה ארצית",     date: "",          status: "pending" as const },
];

const PILOTS = [
  { city: "ירושלים",  status: "פעיל",   patients: 28, coordinators: 5, color: "bg-success" },
  { city: "תל אביב",  status: "בתכנון", patients: 0,  coordinators: 0, color: "bg-warning" },
  { city: "חיפה",     status: "בתכנון", patients: 0,  coordinators: 0, color: "bg-warning" },
  { city: "באר שבע",  status: "ממתין",  patients: 0,  coordinators: 0, color: "bg-muted" },
  { city: "נצרת",     status: "ממתין",  patients: 0,  coordinators: 0, color: "bg-muted" },
];

const SDI_TREND = [
  { month: "אוק", sdi: 15 }, { month: "נוב", sdi: 18 }, { month: "דצמ", sdi: 20 },
  { month: "ינו", sdi: 22 }, { month: "פבר", sdi: 23.5 }, { month: "מרץ", sdi: 24.3 },
];

const RDI_TREND = [
  { month: "אוק", rdi: 1.25 }, { month: "נוב", rdi: 1.20 }, { month: "דצמ", rdi: 1.18 },
  { month: "ינו", rdi: 1.16 }, { month: "פבר", rdi: 1.15 }, { month: "מרץ", rdi: 1.14 },
];

const ENROLLMENT_TREND = [
  { month: "אוק", count: 5 }, { month: "נוב", count: 10 }, { month: "דצמ", count: 15 },
  { month: "ינו", count: 20 }, { month: "פבר", count: 25 }, { month: "מרץ", count: 28 },
];

const SITES = [
  { name: "פסגת זאב", citizens: 286, escorts: 4, providers: 12, walletUtil: 71, prevention: 54, satisfaction: 4.7, budget: "₪526K", status: "active" as const },
  { name: "גילה",     citizens: 150, escorts: 2, providers: 8,  walletUtil: 0,  prevention: 0,  satisfaction: 0,   budget: "₪276K", status: "planned" as const },
  { name: "קטמון",    citizens: 120, escorts: 2, providers: 6,  walletUtil: 0,  prevention: 0,  satisfaction: 0,   budget: "₪221K", status: "planned" as const },
  { name: "עיר גנים", citizens: 180, escorts: 3, providers: 10, walletUtil: 0,  prevention: 0,  satisfaction: 0,   budget: "₪331K", status: "planned" as const },
];

const PREVENTION_BREAKDOWN = [
  { world: "תפקודי",     pct: 28, color: "bg-[#0368b0]" },
  { world: "חברתי",      pct: 22, color: "bg-[#e8a020]" },
  { world: "בריאותי",    pct: 20, color: "bg-[#1a7a4e]" },
  { world: "קוגניטיבי",  pct: 14, color: "bg-[#8b5cf6]" },
  { world: "טכנולוגי",   pct: 10, color: "bg-[#266794]" },
  { world: "סביבתי",     pct: 6,  color: "bg-[#cc7a00]" },
];

const ESCORT_LOAD = [
  { name: "שרית מזרחי",  site: "פסגת זאב", clients: 75, atRisk: 12, actions: 8,  load: "גבוה" },
  { name: "דנה לוי",     site: "פסגת זאב", clients: 72, atRisk: 9,  actions: 6,  load: "גבוה" },
  { name: "מיכל כהן",    site: "פסגת זאב", clients: 70, atRisk: 7,  actions: 5,  load: "בינוני" },
  { name: "רונית אברהם", site: "פסגת זאב", clients: 69, atRisk: 8,  actions: 4,  load: "בינוני" },
];

const RISK_SUMMARY = [
  { flag: "בדידות",        count: 18, pct: 6.3, tone: "destructive" as const },
  { flag: "חוסר פעילות",   count: 12, pct: 4.2, tone: "warning" as const },
  { flag: "יתרה נמוכה",    count: 9,  pct: 3.1, tone: "warning" as const },
  { flag: "ירידה תפקודית", count: 7,  pct: 2.4, tone: "destructive" as const },
  { flag: "סיכון נפילה",   count: 5,  pct: 1.7, tone: "destructive" as const },
];

const SCATTER_DATA = [
  { name: "לאה שמעון", sdi: 5, rdi: 1.52, level: 4 },
  { name: "שרה אברהם", sdi: 0, rdi: 1.49, level: 5 },
  { name: "אסתר נחום", sdi: 11, rdi: 1.41, level: 3 },
  { name: "אברהם פרץ", sdi: 8, rdi: 1.34, level: 2 },
  { name: "מרים דוד", sdi: 33, rdi: 1.22, level: 4 },
  { name: "רחל כהן", sdi: 72, rdi: 1.12, level: 3 },
  { name: "יעקב לוי", sdi: 58, rdi: 0.82, level: 1 },
  { name: "משה דוד", sdi: 45, rdi: 0.95, level: 2 },
  { name: "חנה ישראלי", sdi: 32, rdi: 1.28, level: 3 },
  { name: "דוד מזרחי", sdi: 48, rdi: 0.98, level: 2 },
  { name: "רבקה אלון", sdi: 28, rdi: 1.18, level: 3 },
  { name: "שושנה פרץ", sdi: 5, rdi: 1.61, level: 5 },
];

function dotColor(rdi: number, sdi: number) {
  if (rdi > 1.5 && sdi < 17) return "#dc2626";
  if (rdi > 1.2 || sdi < 17) return "#d97706";
  return "#16a34a";
}

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
  const [selectedPilot, setSelectedPilot] = useState<string | null>(null);
  const totalCitizens = SITES.reduce((s, site) => s + site.citizens, 0);
  const totalEscorts  = SITES.reduce((s, site) => s + site.escorts, 0);
  const totalProviders = SITES.reduce((s, site) => s + site.providers, 0);
  const activeSites   = SITES.filter((s) => s.status === "active").length;

  return (
    <AppLayout
      title="דשבורד ניהולי — רפורמת סל אישי"
      subtitle={`${activeSites} אתרים פעילים · ${totalCitizens} אזרחים · ${totalEscorts} מתאמות · ${totalProviders} ספקים`}
    >

      {/* ── Hero Banner with Progress ── */}
      <div className="mb-6 rounded-xl bg-gradient-to-l from-[#1B3A5C] to-[#0f2744] p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white">רפורמת סל אישי — מבט על</h2>
            <p className="text-sm text-white/70 mt-1">שלב 1: פיילוט ירושלים</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-[200px] bg-white/20 rounded-full h-3">
              <div className="bg-[#e8a020] h-3 rounded-full transition-all" style={{ width: "65%" }} />
            </div>
            <span className="text-sm font-bold text-[#e8a020]">65%</span>
          </div>
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
                    kpi.trend.dir === "up" ? "text-success" : kpi.trend.dir === "down" ? "text-success" : "text-destructive"
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

      {/* ── 2. Reform Timeline ── */}
      <Card className="mb-8">
        <CardHeader title="ציר זמן הרפורמה" subtitle="מנייר מדיניות ועד הטמעה ארצית" />
        <div className="flex gap-0 overflow-x-auto pb-2 pt-2">
          {TIMELINE.map((item, i) => (
            <div key={i} className="flex flex-col items-center min-w-[100px] relative">
              {/* Connector line */}
              {i > 0 && (
                <div
                  className={cn(
                    "absolute top-4 h-0.5 w-full -z-0",
                    TIMELINE[i - 1].status === "done" ? "bg-success" : "bg-border"
                  )}
                  style={{ right: "50%" }}
                />
              )}
              {/* Node */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0",
                item.status === "done" ? "bg-success text-white" :
                item.status === "active" ? "bg-primary text-white" :
                "bg-background border-2 border-border text-muted-foreground"
              )}>
                {item.status === "done" ? <CheckCircle2 className="w-4 h-4" /> :
                 item.status === "active" ? <Clock className="w-4 h-4" /> :
                 <Circle className="w-4 h-4" />}
              </div>
              <div className="text-[11px] font-semibold mt-2 text-center text-foreground">{item.label}</div>
              <div className="text-[10px] text-muted-foreground">{item.date}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── 3. Pilot Map + KPI Trends ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Pilot Map */}
        <Card>
          <CardHeader title="מפת פיילוטים" subtitle="5 רשויות מתוכננות" />
          <div className="space-y-3">
            {PILOTS.map((p, i) => (
              <div key={i} className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors", p.patients > 0 && "cursor-pointer")} onClick={() => p.patients > 0 && setSelectedPilot(p.city)}>
                <div className={cn("w-3 h-3 rounded-full shrink-0", p.color)} />
                <div className="flex-1">
                  <div className="font-semibold text-sm text-foreground">📍 {p.city}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {p.patients > 0 ? `${p.patients} מטופלים, ${p.coordinators} מתאמות` : p.status}
                  </div>
                </div>
                <span className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full",
                  p.status === "פעיל" ? "bg-success/10 text-success" :
                  p.status === "בתכנון" ? "bg-warning/10 text-warning-foreground" :
                  "bg-muted text-muted-foreground"
                )}>{p.status}</span>
              </div>
            ))}
          </div>
          {selectedPilot && (
            <div className="mt-4 p-4 rounded-lg border border-primary/20 bg-primary-soft/20 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-foreground">📍 {selectedPilot} — פירוט</h4>
                <button onClick={() => setSelectedPilot(null)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-muted-foreground">מטופלים פעילים</div>
                  <div className="text-lg font-bold text-foreground">28</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-muted-foreground">מתאמות</div>
                  <div className="text-lg font-bold text-foreground">5</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-muted-foreground">SDI ממוצע</div>
                  <div className="text-lg font-bold text-success">24.3</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-muted-foreground">RDI ממוצע</div>
                  <div className="text-lg font-bold text-success">1.14</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-muted-foreground">ניצול סל</div>
                  <div className="text-lg font-bold text-foreground">71%</div>
                </div>
                <div className="p-2 rounded bg-card border border-border">
                  <div className="text-muted-foreground">שביעות רצון</div>
                  <div className="text-lg font-bold text-foreground">4.7/5</div>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* KPI Trend Charts */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">SDI מגמה</div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={SDI_TREND}>
                <Line type="monotone" dataKey="sdi" stroke="#0368b0" strokeWidth={2} dot={false} />
                <Tooltip formatter={(v: number) => [v, "SDI"]} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="text-lg font-bold text-foreground">24.3</span>
              <span className="text-xs text-success mr-1">↑ +2.1</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">RDI מגמה</div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={RDI_TREND}>
                <Line type="monotone" dataKey="rdi" stroke="#c0392b" strokeWidth={2} dot={false} />
                <Tooltip formatter={(v: number) => [v, "RDI"]} />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="text-lg font-bold text-foreground">1.14</span>
              <span className="text-xs text-success mr-1">↓ -0.11</span>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-xs font-semibold text-muted-foreground mb-2">מטופלים רשומים</div>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart data={ENROLLMENT_TREND}>
                <Bar dataKey="count" fill="#0368b0" radius={[4, 4, 0, 0]} />
                <Tooltip formatter={(v: number) => [v, "מטופלים"]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center mt-1">
              <span className="text-lg font-bold text-foreground">28</span>
              <span className="text-xs text-muted-foreground mr-1">פעילים</span>
            </div>
          </Card>
          <Card className="p-4 flex flex-col items-center justify-center">
            <div className="text-xs font-semibold text-muted-foreground mb-2">שביעות רצון ספקים</div>
            <div className="text-3xl font-extrabold text-primary">4.2</div>
            <div className="text-xs text-muted-foreground">/5</div>
          </Card>
        </div>
      </div>

      {/* ── 4. Site Comparison Table + 6 Dimensions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader title="אתרי פיילוט" subtitle="ירושלים — פעילים ומתוכננים" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="text-right py-2.5 px-3 font-semibold">אתר</th>
                    <th className="text-center py-2.5 px-2 font-semibold">אזרחים</th>
                    <th className="text-center py-2.5 px-2 font-semibold">מתאמות</th>
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
                        {s.walletUtil > 0 ? <span className="font-semibold tabular-nums">{s.walletUtil}%</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {s.prevention > 0 ? <span className="font-semibold tabular-nums">{s.prevention}%</span> : <span className="text-muted-foreground">—</span>}
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
                    <td className="py-2.5 px-3 font-bold">סה״כ</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">{totalCitizens}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">{totalEscorts}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">{totalProviders}</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">67%</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">54%</td>
                    <td className="py-2.5 px-2 text-center font-bold tabular-nums">₪1.35M</td>
                    <td className="py-2.5 px-2 text-center"><Chip tone="primary">{activeSites}/{SITES.length}</Chip></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </div>

        {/* 6 Dimensions Breakdown */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="6 ממדי שירות" subtitle="חלוקת שירותים לפי ממד" />
            <div className="space-y-3">
              {PREVENTION_BREAKDOWN.map((w) => (
                <div key={w.world}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{w.world}</span>
                    <span className="text-xs font-bold text-foreground tabular-nums">{w.pct}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", w.color)} style={{ width: `${w.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <div className="text-[11px] text-muted-foreground mb-2">ממדים: תפקודי · חברתי · בריאותי · קוגניטיבי · טכנולוגי · סביבתי</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">שירותי מניעה (100% סבסוד)</span>
                <span className="text-sm font-bold text-success tabular-nums">62%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── 5. Escort Load + Risk Distribution ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader title="עומס מתאמות" subtitle="פסגת זאב — 4 מתאמות" />
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
              <span className="text-muted-foreground">ממוצע לקוחות למתאמת</span>
              <span className="font-bold text-foreground tabular-nums">71.5</span>
            </div>
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">יעד מקסימלי</span>
              <span className="font-bold text-foreground tabular-nums">75</span>
            </div>
          </div>
        </Card>

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

      {/* ── RDI×SDI Scatter Matrix ── */}
      <Card className="mb-8">
        <CardHeader title="מטריקס סיכון × שירותים" subtitle="ציר X: שירותים פעילים (SDI) · ציר Y: סיכון הדרדרות (RDI) · אדום = דורש התערבות" />
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(207 95% 35% / 0.1)" />
            <XAxis
              type="number"
              dataKey="sdi"
              name="SDI"
              domain={[0, 80]}
              tick={{ fontSize: 11 }}
              label={{ value: "SDI (מדד שירותים)", position: "insideBottom", offset: -10, style: { fontSize: 11, fill: "#64748b" } }}
            />
            <YAxis
              type="number"
              dataKey="rdi"
              name="RDI"
              domain={[0.5, 2]}
              tick={{ fontSize: 11 }}
              label={{ value: "RDI (סיכון הדרדרות)", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#64748b" } }}
            />
            <ZAxis range={[120, 120]} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-card rounded-lg shadow-lg p-3 border border-border text-sm" dir="rtl">
                      <div className="font-bold text-foreground">{d.name}</div>
                      <div className="text-muted-foreground">RDI: <span className="font-semibold text-foreground">{d.rdi.toFixed(2)}</span></div>
                      <div className="text-muted-foreground">SDI: <span className="font-semibold text-foreground">{d.sdi}</span></div>
                      <div className="text-muted-foreground">רמה: {d.level}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter data={SCATTER_DATA} name="מטופלים">
              {SCATTER_DATA.map((entry, i) => (
                <Cell key={i} fill={dotColor(entry.rdi, entry.sdi)} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        {/* Legend */}
        <div className="flex gap-4 justify-center mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#dc2626]" /> סיכון גבוה</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#d97706]" /> לבדיקה</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#16a34a]" /> תקין</span>
        </div>
      </Card>

      {/* ── 6. Key Decisions ── */}
      <Card className="mb-8">
        <CardHeader title="הכרעות נדרשות להרחבה" subtitle="נושאים הממתינים לאישור" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Building2,   title: "מודל התקשרויות",  desc: "3 צירים: מפעיל מערכת, מפעיל שטח, ספקים מקומיים. נדרש אישור מבנה חוזי.", tone: "primary" as const },
            { icon: CreditCard,  title: "מסגרת תקציבית",   desc: "תקרות מחיר ליחידה, תקציב חודשי לאתר, מודל תשלום לספקים.", tone: "warning" as const },
            { icon: ShieldCheck, title: "אבטחה ופרטיות",   desc: "הצפנת PII, הרשאות RBAC, תקנות פרטיות, אישור CISO.", tone: "destructive" as const },
            { icon: AlertTriangle, title: "חומה רגולטורית", desc: "חברות סיעוד לא יוכלו לספק במקביל שירותי סיעוד והפעלת מודל הסל — מניעת ניגוד עניינים.", tone: "info" as const },
          ].map((d) => {
            const Icon = d.icon;
            const tones = {
              primary: "bg-primary-soft text-primary border-primary/20",
              warning: "bg-warning-soft text-warning-foreground border-warning/20",
              destructive: "bg-destructive-soft text-destructive border-destructive/20",
              info: "bg-info-soft text-info border-info/20",
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

      {/* ── 8. Control & Stop Mechanisms ── */}
      <Card className="mb-8">
        <CardHeader title="מנגנון בקרה ועצירה" subtitle="ביטוח לאומי שומר יכולת שליטה מלאה" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "עצירת אתר", desc: "הקפאת פעילות באתר ספציפי", color: "bg-destructive/10 text-destructive border-destructive/20" },
            { label: "החלפת מפעיל", desc: "החלפת מפעיל שטח שלא עומד ביעדים", color: "bg-destructive/10 text-destructive border-destructive/20" },
            { label: "הקפאת תקציב", desc: "עצירת תשלומים לאתר/ספק", color: "bg-warning/10 text-warning-foreground border-warning/20" },
            { label: "גריעת ספק", desc: "הסרת ספק ממאגר המאושרים", color: "bg-warning/10 text-warning-foreground border-warning/20" },
            { label: "עצירת שירות", desc: "הסרת שירות ספציפי מהסל", color: "bg-info/10 text-info border-info/20" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => toast(`⚠️ ${item.label} — נדרש אישור מנהל`)}
              className={cn("p-3 rounded-xl border text-center transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer", item.color)}
            >
              <div className="text-sm font-bold mb-1">{item.label}</div>
              <div className="text-[10px] opacity-80">{item.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">טריגרים להפעלה:</strong> חריגות KPI משמעותיות · פגיעה באיכות · שחיקת כוח אדם חריגה · תלונות מהותיות · חריגות תקציב · כשלי בקרה
          </p>
        </div>
      </Card>
    </AppLayout>
  );
}
