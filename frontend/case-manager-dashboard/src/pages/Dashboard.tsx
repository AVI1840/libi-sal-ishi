import AppLayout from "@/components/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { Avatar } from "@/components/common/Avatar";
import { ProgressBar } from "@/components/common/ProgressBar";
import { stats, kpis, sarahChangelog } from "@/data/dashboard";
import { schedule, actions, alerts, attentionRows } from "@/data/mock";
import { getClient } from "@/data/clients";
import { getService } from "@/data/services";
import { ACTION_TYPE_LABELS, NURSING_LEVEL_TONE, RISK_LABELS, CONTENT_WORLDS } from "@/data/constants";
import { Users, AlertTriangle, Calendar, Bell, Wallet, ArrowUpRight, ArrowDownRight, Home, Phone, Package, FileText, Sparkles, ChevronLeft, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const SCHEDULE_ICON_MAP = { visit: Home, call: Phone, vendor: Package, plan: FileText, assessment: AlertTriangle, family: Users, report: FileText };

/* ── RDI/SDI Data ── */
const CARE_LEVEL_DATA = [
  { level: "רמה 1", count: 4 },
  { level: "רמה 2", count: 7 },
  { level: "רמה 3", count: 8 },
  { level: "רמה 4", count: 6 },
  { level: "רמה 5", count: 3 },
];

const URGENT_PATIENTS = [
  { name: "לאה שמעון", age: 83, level: 4, rdi: 1.52, sdi: 5, status: "דחוף", statusColor: "bg-destructive/10 text-destructive" },
  { name: "שרה אברהם", age: 88, level: 1, rdi: 1.49, sdi: 0, status: "דחוף", statusColor: "bg-destructive/10 text-destructive" },
  { name: "אסתר נחום", age: 87, level: 3, rdi: 1.41, sdi: 11, status: "לבדיקה", statusColor: "bg-warning/10 text-warning-foreground" },
  { name: "אברהם פרץ", age: 79, level: 2, rdi: 1.34, sdi: 8, status: "לבדיקה", statusColor: "bg-warning/10 text-warning-foreground" },
  { name: "מרים דוד", age: 85, level: 4, rdi: 1.22, sdi: 33, status: "מעקב", statusColor: "bg-info-soft text-info" },
];

function rdiColor(rdi: number) {
  if (rdi > 1.5) return "text-destructive font-bold";
  if (rdi >= 1.2) return "text-warning-foreground font-bold";
  return "text-success";
}

function sdiColor(sdi: number) {
  if (sdi === 0) return "text-destructive font-bold";
  if (sdi < 17) return "text-warning-foreground font-bold";
  return "text-success";
}

function RdiSdiPanel() {
  return (
    <Card>
      <CardHeader title="מדדי הדרדרות" subtitle="מטופלים דורשים תשומת לב מועדפת" />
      <div className="mb-4 p-3 rounded-lg bg-muted/40 border border-border text-xs text-muted-foreground leading-relaxed space-y-1">
        <div><strong className="text-foreground">RDI (מדד סיכון הדרדרות)</strong> — ככל שגבוה יותר, כך הסיכון להחמרה במצב גדול יותר. מעל 1.3 = דורש התערבות.</div>
        <div><strong className="text-foreground">SDI (מדד שירותים פעילים)</strong> — כמה שירותי מניעה פעילים. 0 = לא משתמש בשום שירות. ככל שגבוה יותר = טוב יותר.</div>
      </div>
      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-destructive-soft/60 rounded-lg p-3 text-center">
          <div className="text-xl font-extrabold text-destructive">5</div>
          <div className="text-[11px] text-muted-foreground">RDI&gt;1.3</div>
        </div>
        <div className="bg-destructive-soft/60 rounded-lg p-3 text-center">
          <div className="text-xl font-extrabold text-destructive">2</div>
          <div className="text-[11px] text-muted-foreground">SDI=0</div>
        </div>
        <div className="bg-primary-soft rounded-lg p-3 text-center">
          <div className="text-xl font-extrabold text-primary">24.3</div>
          <div className="text-[11px] text-muted-foreground">SDI ממוצע</div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground">
              <th className="text-right py-2 font-semibold">שם</th>
              <th className="text-right py-2 font-semibold">גיל</th>
              <th className="text-right py-2 font-semibold">רמה</th>
              <th className="text-right py-2 font-semibold">RDI</th>
              <th className="text-right py-2 font-semibold">SDI</th>
              <th className="text-right py-2 font-semibold">סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {URGENT_PATIENTS.map((p, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                <td className="py-2 font-semibold text-foreground">{p.name}</td>
                <td className="py-2">{p.age}</td>
                <td className="py-2">{p.level}</td>
                <td className={cn("py-2", rdiColor(p.rdi))}>{p.rdi.toFixed(2)}</td>
                <td className={cn("py-2", sdiColor(p.sdi))}>{p.sdi}</td>
                <td className="py-2">
                  <span className={cn("px-2 py-0.5 rounded-full text-[11px] font-bold", p.statusColor)}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CareLevelChart() {
  return (
    <Card>
      <CardHeader title="התפלגות לפי רמת גמלה" subtitle="28 מטופלים בפיילוט" />
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={CARE_LEVEL_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(207 95% 35% / 0.1)" />
          <XAxis dataKey="level" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v: number) => [v, "מטופלים"]} />
          <Bar dataKey="count" fill="#1B3A5C" radius={[6, 6, 0, 0]} name="מטופלים" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value, sub, tone = "primary", sparkData }: { icon: any; label: string; value: string | number; sub: string; tone?: "primary" | "warning" | "success" | "info" | "destructive"; sparkData?: number[] }) {
  const toneMap = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning-foreground",
    success: "bg-success-soft text-success",
    info: "bg-info-soft text-info",
    destructive: "bg-destructive-soft text-destructive",
  };
  return (
    <div className="libi-stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", toneMap[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground tracking-tight">{value}</div>
      <div className="text-sm text-foreground mt-0.5">{label}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
      {sparkData && (
        <div className="mt-2 -mx-1">
          <ResponsiveContainer width="100%" height={28}>
            <LineChart data={sparkData.map((v, i) => ({ v, i }))}>
              <Line type="monotone" dataKey="v" stroke={tone === "destructive" ? "#ef4444" : tone === "success" ? "#22c55e" : "#1B3A5C"} strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function SarahSpotlight() {
  const sarah = getClient("c1")!;
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary-soft/40 to-card">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <Avatar name={`${sarah.firstName} ${sarah.lastName}`} size={56} tone="primary" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{sarah.firstName} {sarah.lastName}</h3>
              <Chip tone="destructive">⚠️ בדידות</Chip>
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{sarah.age} שנים · {sarah.city} · רמת סיעוד {sarah.nursingLevel}</div>
          </div>
        </div>
        <Link to={`/clients/${sarah.id}`} className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          לפרופיל המלא <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-card rounded-lg p-3 border border-border/60">
          <div className="text-xs text-muted-foreground">ארנק</div>
          <div className="text-lg font-bold text-foreground mt-0.5">{sarah.wallet.balance}/{sarah.wallet.total}</div>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border/60">
          <div className="text-xs text-muted-foreground">בדידות</div>
          <div className="text-lg font-bold text-destructive mt-0.5">{sarah.lev.lonelinessScore}/10</div>
        </div>
        <div className="bg-card rounded-lg p-3 border border-border/60">
          <div className="text-xs text-muted-foreground">שירותים</div>
          <div className="text-lg font-bold text-foreground mt-0.5">0</div>
        </div>
      </div>

      <div className="bg-card/70 rounded-lg p-3 border border-border/60">
        <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" /> שינויים אחרונים
        </div>
        <ul className="space-y-1.5">
          {sarahChangelog.map((c, i) => (
            <li key={i} className="text-xs text-muted-foreground flex gap-2">
              <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
              <span className="font-medium text-foreground/80 min-w-[90px]">{c.date}</span>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function DailySchedule() {
  return (
    <Card>
      <CardHeader title="לוח הזמנים היומי" subtitle="יום שני, 27 באפריל 2026" />
      <div className="space-y-1">
        {schedule.map((item) => {
          const Icon = SCHEDULE_ICON_MAP[item.type];
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-4 p-3 rounded-lg transition-colors hover:bg-muted/60",
                item.urgent && "bg-destructive-soft/60 hover:bg-destructive-soft"
              )}
            >
              <div className="text-sm font-semibold text-foreground tabular-nums w-12 shrink-0">{item.time}</div>
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  item.urgent ? "bg-destructive text-destructive-foreground" : "bg-accent text-primary"
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-semibold", item.urgent ? "text-destructive" : "text-foreground")}>
                  {item.title}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.note}</div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function CrmActions() {
  const sarahActions = actions.filter((a) => a.clientId === "c1");
  const priorityTone = { high: "destructive", medium: "warning", low: "info" } as const;
  return (
    <Card>
      <CardHeader
        title="פעולות מומלצות למתאמת"
        subtitle="התערבויות מותאמות לשרה כהן"
        action={<Link to="/actions" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">לכל הפעולות <ChevronLeft className="w-3.5 h-3.5" /></Link>}
      />
      <div className="space-y-3">
        {sarahActions.map((action) => {
          const tone = priorityTone[action.priority];
          const borderTone = tone === "destructive" ? "border-r-destructive" : tone === "warning" ? "border-r-warning" : "border-r-info";
          return (
            <div key={action.id} className={cn("p-4 rounded-lg border border-border bg-muted/30 border-r-4", borderTone)}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Chip tone={tone}>{ACTION_TYPE_LABELS[action.type].icon} {action.typeLabel}</Chip>
                  <Chip tone="muted">{action.status === "pending" ? "ממתין" : action.status === "in_progress" ? "בתהליך" : "הושלם"}</Chip>
                </div>
              </div>
              <div className="text-sm font-semibold text-foreground mb-1">{action.title}</div>
              <div className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{action.description}</div>
              <div className="text-xs text-info bg-info-soft rounded-md px-3 py-2 leading-relaxed">
                💡 {action.suggestion}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function KpiPanel() {
  return (
    <Card>
      <CardHeader title="מדדי ביצוע" subtitle="ממוצע 30 ימים" />
      <div className="space-y-4">
        {kpis.map((k) => {
          const positive = k.invert ? k.trend === "down" : k.trend === "up";
          const TrendIcon = k.trend === "up" ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={k.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-xs font-medium text-foreground">{k.label}</div>
                <div className="flex items-center gap-2">
                  <div className="text-sm font-bold text-foreground tabular-nums">{k.display ?? `${k.value}%`}</div>
                  <span className={cn("text-[11px] flex items-center gap-0.5 font-medium", positive ? "text-success" : "text-destructive")}>
                    <TrendIcon className="w-3 h-3" />
                    {k.delta}
                  </span>
                </div>
              </div>
              <ProgressBar value={k.value} tone={positive ? "success" : "warning"} size="sm" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AlertsPanel() {
  return (
    <Card>
      <CardHeader title="התראות" subtitle={`${stats.alertsUnread} חדשות`} action={<Link to="/alerts" className="text-xs font-medium text-primary hover:underline">הכל</Link>} />
      <div className="space-y-2">
        {alerts.slice(0, 4).map((a) => (
          <div key={a.id} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60">
            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", a.read ? "bg-border" : "bg-info animate-pulse-soft")} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground leading-tight">{a.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{a.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AttentionTable() {
  return (
    <Card>
      <CardHeader title="דורשים תשומת לב" subtitle="5 מטופלים בעדיפות" />
      <div className="space-y-1">
        {attentionRows.map((row) => (
          <Link
            key={row.clientId}
            to={`/clients/${row.clientId}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors"
          >
            <Avatar name={`${row.client.firstName} ${row.client.lastName}`} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {row.client.firstName} {row.client.lastName}
              </div>
              <div className="text-[11px] text-muted-foreground">{row.client.age} · רמה {row.client.nursingLevel}</div>
            </div>
            <span className={cn("libi-chip", row.tone)}>{row.reason}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export default function Dashboard() {
  return (
    <AppLayout title="בוקר טוב, שרית 👋" subtitle="הנה מה שמחכה לך היום — 3 פעולות דחופות, 5 מטופלים דורשים תשומת לב.">
      {/* Demo transparency banner */}
      <div className="mb-5 p-3 rounded-lg border border-info/30 bg-info-soft/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-info text-info-foreground flex items-center justify-center shrink-0 text-sm">🔬</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-foreground">סביבת הדגמה מבוקרת</div>
          <div className="text-[11px] text-muted-foreground">הנתונים בממשק זה הם לצורך הדגמה. הלוגיקה העסקית (המלצות, סבסוד, CRM) פועלת באופן מלא.</div>
        </div>
      </div>

      {/* 5 stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <StatCard icon={Users} label="מטופלים" value={stats.totalClients} sub={`${stats.activeClients} פעילים`} tone="primary" sparkData={[60, 63, 65, 68, 70, 72, 75]} />
        <StatCard icon={AlertTriangle} label="בסיכון" value={stats.atRisk} sub="דורשים התערבות" tone="destructive" sparkData={[14, 12, 13, 11, 10, 9, 8]} />
        <StatCard icon={Calendar} label="הזמנות" value={stats.bookings} sub={`${stats.bookingsCompleted} הושלמו`} tone="info" sparkData={[5, 7, 6, 8, 9, 10, 12]} />
        <StatCard icon={Bell} label="התראות" value={stats.alertsTotal} sub={`${stats.alertsUnread} חדשות`} tone="warning" sparkData={[8, 7, 9, 6, 5, 5, 4]} />
        <StatCard icon={Wallet} label="ניצול סל" value={`${stats.walletUtilization}%`} sub={`יעד: ${stats.walletTarget}%`} tone="success" sparkData={[52, 55, 58, 61, 63, 65, 67]} />
      </div>

      {/* 3 + 2 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <SarahSpotlight />
          <RdiSdiPanel />
          <DailySchedule />
          <CrmActions />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <KpiPanel />
          <CareLevelChart />
          <AlertsPanel />
          <AttentionTable />
        </div>
      </div>
    </AppLayout>
  );
}
