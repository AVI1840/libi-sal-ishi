import AppLayout from "@/components/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { ProgressBar } from "@/components/common/ProgressBar";
import { FileBarChart2, Download, TrendingUp, Calendar, Users, Wallet, Heart, Building2, UserCheck, Package, CheckSquare, Square } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── KPI Data ─── */
const KPI_CARDS = [
  { label: "ניצול הסל", value: "67%", target: "יעד: 85%", progress: 67, progressMax: 85, tone: "primary" as const, icon: Wallet },
  { label: "שירותי מניעה", value: "42%", target: "יעד: 60%", progress: 42, progressMax: 60, tone: "warning" as const, icon: Heart },
  { label: "שביעות רצון", value: "4.7/5", target: "ממוצע ארצי: 3.9", progress: 94, progressMax: 100, tone: "success" as const, icon: TrendingUp },
  { label: "עלות ממוצעת לאזרח", value: "₪1,840", target: "לחודש", progress: 72, progressMax: 100, tone: "primary" as const, icon: FileBarChart2 },
  { label: "אזרחים פעילים", value: "40/75", target: "53% השתתפות", progress: 53, progressMax: 100, tone: "success" as const, icon: Users },
];

/* ─── Site Comparison ─── */
const SITES = [
  { name: "פסגת זאב", citizens: 286, escorts: 4, providers: 12, walletUtil: "71%", prevention: "54%", status: "פעיל" },
  { name: "גילה", citizens: 150, escorts: 2, providers: 8, walletUtil: "—", prevention: "—", status: "מתוכנן" },
  { name: "קטמון", citizens: 120, escorts: 2, providers: 6, walletUtil: "—", prevention: "—", status: "מתוכנן" },
  { name: "עיר גנים", citizens: 180, escorts: 3, providers: 10, walletUtil: "—", prevention: "—", status: "מתוכנן" },
];

/* ─── Engagement Model ─── */
const ENGAGEMENT_AXES = [
  { axis: "ציר 1", title: "מפעיל מערכת", desc: "אחריות: תפעול טכנולוגי, תחזוקה, SLA", icon: Building2, tone: "primary" as const },
  { axis: "ציר 2", title: "מפעיל שטח", desc: "אחריות: מלוות חברתיות, קהילה, ליווי אזרחים", icon: UserCheck, tone: "success" as const },
  { axis: "ציר 3", title: "ספקים מקומיים", desc: "אחריות: מתן שירותים, דיווח ביצוע, איכות", icon: Package, tone: "warning" as const },
];

/* ─── Readiness Checklist ─── */
const CHECKLIST = [
  { done: true, label: "לוגיקה עסקית", detail: "מנוע המלצות, סבסוד, CRM" },
  { done: true, label: "ממשקי משתמש", detail: "אזרח, מלווה, ספק" },
  { done: true, label: "תרחיש דמו", detail: "שרה כהן E2E" },
  { done: false, label: "מסד נתונים", detail: "PostgreSQL + persistence" },
  { done: false, label: "אבטחת מידע", detail: "הצפנה, הרשאות, RBAC" },
  { done: false, label: "אונבורדינג ספקים", detail: "רישום, אישור, חוזים" },
  { done: false, label: "הכרעת מודל התקשרויות", detail: "3 צירים" },
  { done: false, label: "תקציב פיילוט", detail: "עלות הפעלה ל-6 חודשים" },
];

/* ─── Downloadable Reports ─── */
const REPORTS = [
  { icon: TrendingUp, title: "דוח ניצול הסל הרבעוני", desc: "סקירת ניצול יחידות לפי עולם תוכן ולפי רמת סיעוד.", date: "Q1 2026" },
  { icon: FileBarChart2, title: "דוח התערבויות מתאמת", desc: "כל פעולות המתאמת שהתבצעו והשפעתן על מדדי הבדידות.", date: "אפריל 2026" },
  { icon: Calendar, title: "דוח שביעות רצון מטופלים", desc: "ציוני שירות, פידבק ודירוג ספקים.", date: "מרץ 2026" },
];

export default function Reports() {
  const readyCount = CHECKLIST.filter((c) => c.done).length;

  return (
    <AppLayout title="דוחות ומדדים" subtitle="לוח בקרה ניהולי — מוכנות פיילוט והתקשרויות">
      {/* Demo Transparency Banner */}
      <div className="mb-6 p-3 rounded-lg border border-info/30 bg-info-soft/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-info text-info-foreground flex items-center justify-center shrink-0 text-sm">📋</div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-foreground">מצב הדגמה מבוקר</div>
          <div className="text-[11px] text-muted-foreground">הנתונים בדמו, הלוגיקה והזרימה מדגימות את מודל ההפעלה</div>
        </div>
      </div>

      {/* Section 1: KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {KPI_CARDS.map((kpi) => {
          const Icon = kpi.icon;
          const toneMap = {
            primary: "bg-primary-soft text-primary",
            warning: "bg-warning-soft text-warning-foreground",
            success: "bg-success-soft text-success",
          };
          return (
            <div key={kpi.label} className="libi-stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", toneMap[kpi.tone])}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-bold text-foreground tracking-tight">{kpi.value}</div>
              <div className="text-sm text-foreground mt-0.5">{kpi.label}</div>
              <div className="text-xs text-muted-foreground mt-1 mb-2">{kpi.target}</div>
              <ProgressBar value={kpi.progress} max={100} tone={kpi.progress >= kpi.progressMax ? "success" : "warning"} size="sm" />
            </div>
          );
        })}
      </div>

      {/* Section 2: Site Comparison Table */}
      <Card className="mb-8">
        <CardHeader title="השוואת אתרי פיילוט" subtitle="ירושלים — 4 אתרים מתוכננים" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-right py-3 px-3 font-semibold text-foreground">אתר</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">אזרחים</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">מלוות</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">ספקים</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">ניצול סל</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">שירותי מניעה</th>
                <th className="text-center py-3 px-3 font-semibold text-foreground">סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {SITES.map((site) => (
                <tr key={site.name} className="border-b border-border/50 hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-foreground">{site.name}</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">{site.citizens}</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">{site.escorts}</td>
                  <td className="py-3 px-3 text-center text-muted-foreground">{site.providers}</td>
                  <td className="py-3 px-3 text-center font-medium text-foreground">{site.walletUtil}</td>
                  <td className="py-3 px-3 text-center font-medium text-foreground">{site.prevention}</td>
                  <td className="py-3 px-3 text-center">
                    <Chip tone={site.status === "פעיל" ? "success" : "muted"}>{site.status}</Chip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Section 3: Engagement Model */}
      <Card className="mb-8">
        <CardHeader title="מודל התקשרויות" subtitle="שלושה צירי הפעלה לאישור האוצר" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ENGAGEMENT_AXES.map((axis) => {
            const Icon = axis.icon;
            const toneMap = {
              primary: "bg-primary-soft text-primary border-primary/20",
              success: "bg-success-soft text-success border-success/20",
              warning: "bg-warning-soft text-warning-foreground border-warning/20",
            };
            return (
              <div key={axis.axis} className={cn("rounded-xl border p-5", toneMap[axis.tone])}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-card/80 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-medium opacity-80">{axis.axis}</div>
                    <div className="text-base font-bold">{axis.title}</div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed opacity-90">{axis.desc}</p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Section 4: Pilot Readiness Checklist */}
      <Card className="mb-8">
        <CardHeader
          title="מוכנות לפיילוט"
          subtitle={`${readyCount}/${CHECKLIST.length} רכיבים מוכנים`}
          action={
            <Chip tone={readyCount >= CHECKLIST.length ? "success" : "warning"}>
              {Math.round((readyCount / CHECKLIST.length) * 100)}% מוכנות
            </Chip>
          }
        />
        <ProgressBar value={readyCount} max={CHECKLIST.length} tone={readyCount >= CHECKLIST.length ? "success" : "primary"} size="md" className="mb-5" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CHECKLIST.map((item) => (
            <div
              key={item.label}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                item.done ? "bg-success-soft/30 border-success/20" : "bg-muted/30 border-border"
              )}
            >
              {item.done ? (
                <CheckSquare className="w-5 h-5 text-success shrink-0 mt-0.5" />
              ) : (
                <Square className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <div className={cn("text-sm font-semibold", item.done ? "text-success" : "text-foreground")}>{item.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 5: Downloadable Reports */}
      <Card className="mb-8">
        <CardHeader title="דוחות להורדה" subtitle="דוחות תקופתיים מוכנים" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {REPORTS.map((r) => {
            const Icon = r.icon;
            return (
              <div key={r.title} className="p-4 rounded-xl border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-foreground text-sm">{r.title}</div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.desc}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                    <Download className="w-3.5 h-3.5" /> הורדת PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </AppLayout>
  );
}
