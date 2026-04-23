import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import { KPIClosingScreen } from "@libi/shared-ui/components/KPIClosingScreen";
import {
  getScenarioState,
  getScenarioKPIs,
  getScenarioCRMActions,
  SCENARIO_DAYS,
} from "@libi/shared-ui/data/scenario";
import {
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Calendar,
  CheckCircle2,
  Clock,
  Heart,
  Home,
  Phone,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  FileText,
  Package,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

// Daily schedule for the case manager
const DAILY_SCHEDULE = [
  { time: '08:30', title: 'ביקור בית — שרה כהן', type: 'visit' as const, urgent: true, note: 'ציון בדידות 3/10, ביקור ראשון' },
  { time: '10:00', title: 'שיחת מעקב — יוסף לוי', type: 'call' as const, urgent: false, note: 'מעקב אחרי פיזיותרפיה' },
  { time: '11:00', title: 'תיאום ספק — מועדון חברתי לב', type: 'vendor' as const, urgent: false, note: 'הזמנה חדשה לשרה כהן' },
  { time: '12:00', title: 'בניית סל — רחל מזרחי', type: 'plan' as const, urgent: false, note: 'לקוחה חדשה, רמת סיעוד 2' },
  { time: '13:30', title: 'הערכה מחודשת — דוד פרץ', type: 'assessment' as const, urgent: false, note: 'ירידה תפקודית אפשרית' },
  { time: '14:30', title: 'שיחה עם משפחת כהן', type: 'family' as const, urgent: false, note: 'עדכון הבת דנה על שרה' },
  { time: '15:30', title: 'דוח שבועי', type: 'report' as const, urgent: false, note: '' },
];

const SCHEDULE_ICONS: Record<string, typeof Heart> = {
  visit: Home, call: Phone, vendor: Package, plan: FileText,
  assessment: AlertTriangle, family: Users, report: FileText,
};

export default function Dashboard() {
  const { clients, bookings, alerts, unreadAlertsCount, currentDay, changelog } = useApp();
  const [showKPI, setShowKPI] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [prevDay, setPrevDay] = useState(currentDay);

  const scenario = getScenarioState(currentDay);
  const kpis = getScenarioKPIs(currentDay);
  const scenarioCRM = getScenarioCRMActions(currentDay);
  const dayInfo = SCENARIO_DAYS.find(d => d.day === currentDay);
  const sarah = scenario.sarah;

  useEffect(() => {
    if (currentDay !== prevDay) {
      setAiLoading(true);
      const timer = setTimeout(() => {
        setAiLoading(false);
        setPrevDay(currentDay);
        if (currentDay === 14) setTimeout(() => setShowKPI(true), 500);
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [currentDay, prevDay]);

  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const activeClients = 40;
  const atRiskClients = clients.filter(c => c.levProfile?.riskFlags && c.levProfile.riskFlags.length > 0).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto" dir="rtl">
      {/* AI Loading */}
      {aiLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #1B3A5C, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, animation: 'pulse 1s ease infinite',
          }}>
            <Sparkles style={{ width: 26, height: 26, color: '#fff' }} />
          </div>
          <p style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>מעדכנת נתונים...</p>
          <style>{`@keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }`}</style>
        </div>
      )}

      {showKPI && <KPIClosingScreen onClose={() => setShowKPI(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">שלום, שרית</h1>
            <span className="text-sm text-gray-400">מתאמת שירות | פיילוט רמת גן</span>
          </div>
          <p className="text-gray-500 text-sm mt-0.5">{dayInfo?.label} — {dayInfo?.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {currentDay === 14 && (
            <button
              onClick={() => setShowKPI(true)}
              className="px-4 py-2 rounded-lg text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            >
              📊 תוצאות
            </button>
          )}
          <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
            {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Stats Row — clean, minimal */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'מטופלים', value: `${clients.length}`, sub: `${activeClients} פעילים`, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'בסיכון', value: `${Math.min(atRiskClients, 25)}`, sub: 'דורשים התערבות', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
          { label: 'הזמנות', value: `${bookings.length}`, sub: `${completedBookings} הושלמו`, icon: Calendar, color: 'text-green-600 bg-green-50' },
          { label: 'התראות', value: `${unreadAlertsCount}`, sub: 'חדשות', icon: Heart, color: 'text-amber-600 bg-amber-50' },
          { label: 'ניצול סל', value: `${kpis[0]?.value || 67}%`, sub: `יעד: ${kpis[0]?.target || 85}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* LEFT: Schedule + CRM (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* Sarah spotlight — compact */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">שכ</div>
                <div>
                  <p className="font-semibold text-gray-900">{sarah.name}</p>
                  <p className="text-xs text-gray-500">{sarah.age} · {sarah.city} · רמת סיעוד {sarah.nursingLevel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">ארנק</p>
                  <p className="text-sm font-bold text-gray-900">{sarah.walletBalance}/{sarah.walletTotal}</p>
                </div>
                <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">בדידות</p>
                  <p className="text-sm font-bold text-gray-900">{sarah.levProfile?.lonelinessScore}/10</p>
                </div>
                <div className="text-center px-3 py-1 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">שירותים</p>
                  <p className="text-sm font-bold text-gray-900">{completedBookings}</p>
                </div>
                {sarah.levProfile?.riskFlags && sarah.levProfile.riskFlags.length > 0 ? (
                  <Badge variant="destructive" className="text-xs">⚠️ {sarah.levProfile.riskFlags[0] === 'loneliness' ? 'בדידות' : sarah.levProfile.riskFlags[0]}</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700 text-xs">✅ תקין</Badge>
                )}
              </div>
            </div>
            {changelog.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3">
                {changelog.slice(0, 2).map((item, i) => (
                  <p key={i} className="text-xs text-gray-600 mb-0.5">• {item}</p>
                ))}
              </div>
            )}
          </div>

          {/* Daily Schedule */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              משימות היום
            </h2>
            <div className="space-y-1">
              {DAILY_SCHEDULE.map((task, i) => {
                const Icon = SCHEDULE_ICONS[task.type] || Calendar;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      task.urgent ? 'bg-red-50 border border-red-100' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-mono text-gray-400 w-12 flex-shrink-0">{task.time}</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      task.urgent ? 'bg-red-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${task.urgent ? 'text-red-600' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.urgent ? 'text-red-900' : 'text-gray-900'}`}>
                        {task.title}
                        {task.urgent && <span className="text-red-500 text-xs mr-1">(דחוף)</span>}
                      </p>
                      {task.note && <p className="text-xs text-gray-400">{task.note}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CRM Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" />
                פעולות מומלצות — שרה כהן
              </h2>
              <Link to="/actions" className="text-xs text-blue-600 hover:underline">כל הפעולות →</Link>
            </div>
            <div className="space-y-2">
              {scenarioCRM.length === 0 ? (
                <p className="text-gray-400 text-center py-4 text-sm">אין פעולות ממתינות</p>
              ) : (
                scenarioCRM.map((action) => (
                  <div
                    key={action.id}
                    className={`p-3 rounded-lg border ${
                      action.status === 'completed' ? 'bg-green-50/50 border-green-100 opacity-70' :
                      action.priority === "high" ? "bg-red-50/50 border-red-100" :
                      action.priority === "medium" ? "bg-amber-50/50 border-amber-100" :
                      "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {action.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      {action.status === 'in_progress' && <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">בטיפול</span>}
                    </div>
                    <p className="text-xs text-gray-500">{action.description}</p>
                    {action.suggestedAction && action.status !== 'completed' && (
                      <p className="text-xs text-blue-600 mt-1">💡 {action.suggestedAction}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: KPIs + Alerts + Attention (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* KPIs */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">מדדי ביצוע</h2>
            <div className="space-y-4">
              {kpis.slice(0, 5).map((kpi) => (
                <div key={kpi.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{kpi.nameHe}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-gray-900">{kpi.value}{kpi.unit}</span>
                      {kpi.trend !== "stable" && kpi.trendValue > 0 && (
                        <span className={`flex items-center text-[10px] font-bold ${
                          kpi.id === 'inactive_users'
                            ? (kpi.trend === "down" ? "text-green-600" : "text-red-600")
                            : (kpi.trend === "up" ? "text-green-600" : "text-red-600")
                        }`}>
                          {kpi.trend === "up" ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
                          {kpi.trendValue}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={Math.min((kpi.value / kpi.target) * 100, 100)}
                    className={`h-1.5 ${
                      kpi.status === "good" ? "[&>div]:bg-green-500" :
                      kpi.status === "warning" ? "[&>div]:bg-amber-500" :
                      "[&>div]:bg-red-500"
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">התראות</h2>
              <Link to="/alerts" className="text-xs text-blue-600 hover:underline">הכל →</Link>
            </div>
            <div className="space-y-2">
              {alerts.filter(a => !a.isResolved).slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${
                    !alert.isRead ? "bg-blue-50/50 border-blue-100" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    {!alert.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                </div>
              ))}
              {alerts.filter(a => !a.isResolved).length === 0 && (
                <p className="text-gray-400 text-center py-3 text-sm">אין התראות פתוחות</p>
              )}
            </div>
          </div>

          {/* Attention table — inspired by SAL-ISHI */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-3">דורשים תשומת לב</h2>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500">
                    <th className="text-right py-2 px-3 font-medium">שם</th>
                    <th className="text-center py-2 px-3 font-medium">גיל</th>
                    <th className="text-center py-2 px-3 font-medium">רמה</th>
                    <th className="text-right py-2 px-3 font-medium">סיבה</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'שרה כהן', age: 78, level: 2, reason: 'בדידות', color: 'text-red-600 bg-red-50' },
                    { name: 'יוסף לוי', age: 85, level: 3, reason: 'לא פעיל 18 יום', color: 'text-amber-600 bg-amber-50' },
                    { name: 'רחל מזרחי', age: 72, level: 1, reason: 'יתרה נמוכה', color: 'text-amber-600 bg-amber-50' },
                    { name: 'דוד פרץ', age: 89, level: 3, reason: 'ירידה תפקודית', color: 'text-red-600 bg-red-50' },
                    { name: 'מרים גבאי', age: 81, level: 2, reason: 'יתרה פגה בקרוב', color: 'text-amber-600 bg-amber-50' },
                  ].map((row, i) => (
                    <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-2 px-3 font-medium text-gray-900">{row.name}</td>
                      <td className="py-2 px-3 text-center text-gray-500">{row.age}</td>
                      <td className="py-2 px-3 text-center text-gray-500">{row.level}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${row.color}`}>{row.reason}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Link to="/clients" className="block text-xs text-blue-600 hover:underline text-center mt-3">
              כל המטופלים →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
