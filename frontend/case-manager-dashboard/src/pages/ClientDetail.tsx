import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppLayout from "@/components/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Avatar } from "@/components/common/Avatar";
import { Chip } from "@/components/common/Chip";
import { ProgressBar } from "@/components/common/ProgressBar";
import { getClient } from "@/data/clients";
import { bookings } from "@/data/mock";
import { getService } from "@/data/services";
import { CONTENT_WORLDS, NURSING_LEVEL_TONE, PERSONA_LABELS, RISK_LABELS, BOOKING_STATUS } from "@/data/constants";
import { Phone, MapPin, UserRound, ChevronRight, CheckCircle2, AlertCircle, Sparkles, Wallet, Activity, ClipboardList, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const TABS = [
  { id: "functional", label: "פרופיל תפקודי", icon: Activity },
  { id: "plan", label: "תוכנית אישית", icon: Target },
  { id: "wallet", label: "ארנק", icon: Wallet },
  { id: "bookings", label: "הזמנות", icon: ClipboardList },
] as const;

export default function ClientDetail() {
  const { id } = useParams();
  const client = getClient(id!);
  const [tab, setTab] = useState<typeof TABS[number]["id"]>("functional");

  if (!client) {
    return (
      <AppLayout title="מטופל/ת לא נמצא/ה">
        <Link to="/clients" className="text-primary hover:underline">חזרה לרשימת המטופלים</Link>
      </AppLayout>
    );
  }

  const [icfVerified, setIcfVerified] = useState(client.functional.verified);
  const persona = PERSONA_LABELS[client.lev.persona];
  const clientBookings = bookings.filter((b) => b.clientId === client.id).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <AppLayout
      title={`${client.firstName} ${client.lastName}`}
      subtitle={`${client.age} שנים · ${client.city} · רמת סיעוד ${client.nursingLevel}`}
      actions={
        <Link to="/clients" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ChevronRight className="w-4 h-4" /> חזרה
        </Link>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="lg:col-span-1 h-fit">
          <div className="flex flex-col items-center text-center pb-5 border-b border-border">
            <Avatar name={`${client.firstName} ${client.lastName}`} size={88} tone="primary" />
            <h2 className="text-xl font-bold text-foreground mt-3">{client.firstName} {client.lastName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn("libi-chip", NURSING_LEVEL_TONE[client.nursingLevel])}>רמה {client.nursingLevel}</span>
              {client.lev.riskFlags.slice(0, 1).map((f) => (
                <Chip key={f} tone="destructive">{RISK_LABELS[f].icon} {RISK_LABELS[f].label}</Chip>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-5 text-sm">
            <div className="flex items-center gap-3 text-foreground/80">
              <UserRound className="w-4 h-4 text-muted-foreground" />
              <span>{client.age} שנים</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>{client.city}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span dir="ltr">{client.phone}</span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground mb-1.5">איש קשר לחירום</div>
              <div className="text-sm font-medium text-foreground">{client.emergencyContact.name}</div>
              <div className="text-xs text-muted-foreground">{client.emergencyContact.relation} · <span dir="ltr">{client.emergencyContact.phone}</span></div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tab nav */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1 w-fit">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 h-9 rounded-lg text-sm font-medium transition-colors",
                    tab === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {tab === "functional" && (
            <div className="space-y-5">
              {/* ICF verification */}
              <Card className={cn("border-2", icfVerified ? "border-success/40 bg-success-soft/30" : "border-warning/40 bg-warning-soft/30")}>
                <div className="flex items-start gap-3">
                  {icfVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-foreground text-sm">
                      אימות פרופיל תפקודי (ICF) {icfVerified ? "— מאומת" : "— ממתין לאימות"}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {icfVerified
                        ? "הפרופיל אומת על ידי המתאמת בתאריך 20.04.25."
                        : "יש לאמת את הפרופיל תוך 7 ימים מהערכה הראשונית."}
                    </p>
                    <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={icfVerified}
                        onChange={(e) => {
                          setIcfVerified(e.target.checked);
                          toast(e.target.checked ? "✅ פרופיל ICF אומת" : "⚠️ אימות ICF בוטל");
                        }}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-foreground">אימתתי את הפרופיל ICF</span>
                    </label>
                  </div>
                </div>
              </Card>

              {/* Persona verification */}
              <Card>
                <CardHeader title="פרסונת לב" subtitle="מבוסס על אינטראקציות והעדפות" />
                <div className="flex items-start gap-4 p-4 rounded-lg bg-primary-soft/40 border border-primary/15">
                  <div className="w-14 h-14 rounded-xl bg-card flex items-center justify-center text-2xl shrink-0 border border-border">
                    {persona.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{persona.label}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{persona.description}</p>
                    <div className="mt-3 p-3 bg-card rounded-lg border border-border">
                      <div className="text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> טיפים למעורבות
                      </div>
                      <ul className="space-y-1">
                        {client.lev.engagementTips.map((tip, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex gap-2">
                            <span className="text-primary">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => toast(`✅ פרסונה אושרה — ${persona.label}`)}
                        className="px-3 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-glow transition-colors"
                      >
                        ✓ אישור פרסונה
                      </button>
                      <button
                        onClick={() => toast("📝 מצב עריכה — בקרוב")}
                        className="px-3 h-8 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        עריכה ידנית
                      </button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Functional metrics */}
              <Card>
                <CardHeader title="מדדים תפקודיים" subtitle="סקאלה 1-5 (5 = מצוין)" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {([
                    ["mobility", "ניידות"],
                    ["cognition", "קוגניציה"],
                    ["emotional", "רגשי"],
                    ["social", "חברתי"],
                    ["vision", "ראייה"],
                    ["hearing", "שמיעה"],
                  ] as const).map(([key, label]) => {
                    const v = client.functional[key];
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-foreground">{label}</span>
                          <span className="text-sm font-bold text-foreground tabular-nums">{v}/5</span>
                        </div>
                        <ProgressBar value={v} max={5} tone={v >= 4 ? "success" : v >= 3 ? "primary" : v >= 2 ? "warning" : "destructive"} />
                      </div>
                    );
                  })}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Card>
                  <CardHeader title="מצבים רפואיים" />
                  <div className="flex flex-wrap gap-2">
                    {client.conditions.map((c) => (
                      <Chip key={c} tone="muted">{c}</Chip>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHeader title="העדפות ותחביבים" />
                  <div className="flex flex-wrap gap-2">
                    {client.preferences.map((p) => (
                      <Chip key={p} tone="primary">{p}</Chip>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Professional assessment triggers */}
              <Card>
                <CardHeader title="טריגרים להערכה מקצועית" subtitle="דגלים המפעילים הערכה מעמיקה" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {([
                    { label: "דגל נפילה", condition: client.lev.riskFlags.includes("fall_risk"), icon: "⚠️" },
                    { label: "דגל קוגניטיבי", condition: client.functional.cognition < 3, icon: "🧠" },
                    { label: "ירידה תפקודית", condition: client.lev.riskFlags.includes("functional_decline"), icon: "📉" },
                    { label: "שימוש חריג בסל", condition: client.wallet.balance === client.wallet.total, icon: "💰" },
                  ] as const).map((trigger) => (
                    <div
                      key={trigger.label}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border",
                        trigger.condition
                          ? "border-destructive/40 bg-destructive-soft/30 text-destructive"
                          : "border-border bg-muted/30 text-muted-foreground"
                      )}
                    >
                      <span className="text-lg">{trigger.icon}</span>
                      <span className={cn("text-sm font-medium", trigger.condition && "font-bold")}>{trigger.label}</span>
                      {trigger.condition && <span className="mr-auto text-xs font-semibold bg-destructive/10 px-2 py-0.5 rounded-full">פעיל</span>}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "plan" && (
            <div className="space-y-5">
              {/* Personal goals */}
              <Card>
                <CardHeader title="רצונות ומטרות" subtitle="מבוסס על שיחת קליטה" />
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary-soft/30 border border-primary/10">
                    <div className="text-xs font-semibold text-primary mb-1">💭 החלום</div>
                    <div className="text-sm text-foreground">{client.lev.dream}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground mb-2">תחומי עניין</div>
                    <div className="flex flex-wrap gap-2">
                      {client.lev.meaningTags.map((tag) => (
                        <Chip key={tag} tone="primary">{tag}</Chip>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Layered assessment */}
              <Card>
                <CardHeader title="הערכה תפקודית שכבתית" subtitle="3 שכבות — בסיס / מורחבת / מקצועית" />
                <div className="space-y-3">
                  {[
                    { level: "בסיס", status: "הושלם", date: "20.04.26", by: "Self-report + מלווה", color: "bg-success" },
                    { level: "מורחבת", status: client.lev.riskFlags.length > 0 ? "נדרשת" : "לא נדרשת", date: client.lev.riskFlags.length > 0 ? "ממתין" : "—", by: "מלווה + שאלון מובנה", color: client.lev.riskFlags.length > 0 ? "bg-warning" : "bg-muted" },
                    { level: "מקצועית", status: "לא נדרשת", date: "—", by: "גרונטולוג", color: "bg-muted" },
                  ].map((layer) => (
                    <div key={layer.level} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      <div className={cn("w-3 h-3 rounded-full shrink-0", layer.color)} />
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{layer.level}</div>
                        <div className="text-xs text-muted-foreground">{layer.by}</div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium text-foreground">{layer.status}</div>
                        <div className="text-[11px] text-muted-foreground">{layer.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {client.lev.riskFlags.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-warning-soft/50 border border-warning/20">
                    <div className="text-xs font-semibold text-warning-foreground mb-1">⚠️ טריגרים שזוהו</div>
                    <div className="flex flex-wrap gap-1.5">
                      {client.lev.riskFlags.map((f) => (
                        <Chip key={f} tone="destructive">{RISK_LABELS[f].icon} {RISK_LABELS[f].label}</Chip>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Recommended services */}
              <Card>
                <CardHeader title="שירותים מומלצים" subtitle="מבוסס על פרופיל, רצונות וצרכים" />
                <div className="space-y-2">
                  {[
                    { name: "מועדון חברתי שכונתי", category: "שייכות ומשמעות", reason: "ציון בדידות נמוך + מעדיפ/ה פעילות חברתית", subsidy: "100%", icon: "🤝" },
                    { name: "התעמלות מותאמת לגיל", category: "תפקוד ובריאות", reason: "שמירה על ניידות + מניעת נפילות", subsidy: "100%", icon: "💪" },
                    { name: "אימון מוח ותפקודים", category: "תפקוד ובריאות", reason: "שמירה על קוגניציה", subsidy: "100%", icon: "🧠" },
                    { name: "הדרכת סמארטפון", category: "דיגיטציה תומכת", reason: "אוריינות דיגיטלית בסיסית + קשר עם משפחה", subsidy: "50%", icon: "📱" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">{s.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.category}</div>
                        <div className="text-xs text-info mt-1">💡 {s.reason}</div>
                      </div>
                      <Chip tone={s.subsidy === "100%" ? "success" : "warning"}>{s.subsidy} סבסוד</Chip>
                    </div>
                  ))}
                </div>
                <button onClick={() => toast("📋 נשלח למלווה לאישור")} className="w-full mt-3 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                  אשר תוכנית והפעל שירותים
                </button>
              </Card>

              {/* Service history timeline */}
              <Card>
                <CardHeader title="ציר זמן" subtitle="אירועים ושינויים" />
                <div className="space-y-3">
                  {[
                    { date: "20.04.26", event: "קליטה במערכת", type: "intake" },
                    { date: "20.04.26", event: "הערכת בסיס הושלמה", type: "assessment" },
                    { date: "21.04.26", event: "פרסונה זוהתה: " + persona.label, type: "persona" },
                    { date: "22.04.26", event: "דגל סיכון: בדידות", type: "risk" },
                    { date: "25.04.26", event: "תוכנית אישית נוצרה", type: "plan" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                      <div>
                        <div className="text-xs text-muted-foreground">{item.date}</div>
                        <div className="text-sm text-foreground">{item.event}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {tab === "wallet" && (
            <div className="space-y-5">
              <Card className="text-center py-8">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">יתרה זמינה</div>
                <div className="text-6xl font-bold text-primary tabular-nums">{client.wallet.balance}</div>
                <div className="text-sm text-muted-foreground mt-1">מתוך {client.wallet.total} יחידות</div>
                <div className="max-w-md mx-auto mt-5">
                  <ProgressBar value={client.wallet.balance} max={client.wallet.total} tone="primary" />
                </div>
                <div className="text-xs text-muted-foreground mt-3">תפוגה: 90 יום מיום ההקצאה · רמת סיעוד {client.nursingLevel}</div>
              </Card>
              <div className="grid grid-cols-3 gap-5">
                <Card>
                  <div className="text-xs text-muted-foreground">סה״כ הקצאה</div>
                  <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{client.wallet.total} יח׳</div>
                  <div className="text-[11px] text-muted-foreground mt-1">חודשי · רמה {client.nursingLevel}</div>
                </Card>
                <Card>
                  <div className="text-xs text-muted-foreground">נוצלו</div>
                  <div className="text-2xl font-bold text-foreground mt-1 tabular-nums">{client.wallet.total - client.wallet.balance} יח׳</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{Math.round(((client.wallet.total - client.wallet.balance) / client.wallet.total) * 100)}% ניצול</div>
                </Card>
                <Card>
                  <div className="text-xs text-muted-foreground">נותרו</div>
                  <div className={cn("text-2xl font-bold mt-1 tabular-nums", client.wallet.balance / client.wallet.total < 0.3 ? "text-warning" : "text-success")}>{client.wallet.balance} יח׳</div>
                  <div className="text-[11px] text-muted-foreground mt-1">{Math.round((client.wallet.balance / client.wallet.total) * 100)}% זמין</div>
                </Card>
              </div>
              <Card className="bg-success-soft/50 border-success/30">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-success text-success-foreground flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">יחידות 'הזדקנות מיטבית'</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {client.wallet.optimalAgingUnits} יחידות בונוס מותאמות לפרופיל שלך — מומלץ לנצלן עד סוף הרבעון.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {tab === "bookings" && (
            <Card padded={false}>
              {clientBookings.length === 0 ? (
                <div className="p-10 text-center text-muted-foreground text-sm">לא קיימות הזמנות עדיין.</div>
              ) : (
                <div className="divide-y divide-border">
                  {clientBookings.map((b) => {
                    const service = getService(b.serviceId);
                    const status = BOOKING_STATUS[b.status];
                    const world = CONTENT_WORLDS[service.world];
                    const [y, m, d] = b.date.split("-");
                    return (
                      <div key={b.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                        <div className="w-14 h-14 rounded-xl bg-muted text-foreground flex flex-col items-center justify-center shrink-0">
                          <span className="text-lg font-bold leading-none tabular-nums">{d}</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">{m}/{y.slice(2)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{service.name}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span>{b.time}</span>
                            <span>·</span>
                            <span className={cn("libi-chip", world.colorClass)}>{world.emoji} {world.label}</span>
                          </div>
                        </div>
                        <span className={cn("libi-chip", status.tone)}>{status.label}</span>
                        <div className="text-sm font-bold text-foreground tabular-nums w-16 text-left">{b.units} יח׳</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
