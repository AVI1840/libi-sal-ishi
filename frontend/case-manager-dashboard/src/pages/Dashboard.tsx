import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import { KPIClosingScreen } from "@libi/shared-ui/components/KPIClosingScreen";
import {
  getScenarioState,
  getScenarioKPIs,
  getScenarioCRMActions,
  SCENARIO_DAYS,
  RECOMMENDATION_TYPE_LABELS,
} from "@libi/shared-ui/data/scenario";
import {
  CRM_ACTION_LABELS,
} from "@libi/shared-ui/data";
import {
  Activity,
  AlertTriangle,
  ArrowLeftCircle,
  ArrowUp,
  ArrowDown,
  Bell,
  CheckCircle2,
  Heart,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

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

  // AI loading on day change
  useEffect(() => {
    if (currentDay !== prevDay) {
      setAiLoading(true);
      const timer = setTimeout(() => {
        setAiLoading(false);
        setPrevDay(currentDay);
        if (currentDay === 14) setTimeout(() => setShowKPI(true), 600);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentDay, prevDay]);

  const totalClients = clients.length;
  const completedBookings = bookings.filter(b => b.status === "completed").length;
  const pendingCRM = scenarioCRM.filter(a => a.status === "pending" || a.status === "in_progress");

  const recentAlerts = alerts
    .filter(a => !a.isResolved)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 4);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "loneliness": return Heart;
      case "booking_confirmed": case "service_completed": return CheckCircle2;
      case "kpi_update": return TrendingUp;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="p-6 lg:p-8" dir="rtl">
      {/* AI Loading */}
      {aiLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14, animation: 'pulse 1s ease infinite',
          }}>
            <Sparkles style={{ width: 28, height: 28, color: '#fff' }} />
          </div>
          <p style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>LIBI מעדכנת נתונים...</p>
          <style>{`@keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }`}</style>
        </div>
      )}

      {showKPI && <KPIClosingScreen onClose={() => setShowKPI(false)} />}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">שלום, שרית 👋</h1>
            <p className="text-gray-500 mt-0.5 text-sm">{dayInfo?.label} · {dayInfo?.description}</p>
          </div>
          {currentDay === 14 && (
            <button
              onClick={() => setShowKPI(true)}
              className="px-4 py-2 rounded-xl text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
            >
              📊 תוצאות פיילוט
            </button>
          )}
        </div>
      </div>

      {/* Sarah spotlight card */}
      <div className="rounded-2xl p-5 mb-6 text-white" style={{
        background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8c 100%)',
      }}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/50 text-xs">מקרה מוביל</p>
            <p className="text-lg font-bold">{sarah.name}</p>
            <p className="text-white/60 text-sm">{sarah.age} · {sarah.city} · רמת סיעוד {sarah.nursingLevel}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
              <p className="text-[10px] text-white/50">ארנק</p>
              <p className="font-bold text-sm flex items-center gap-1"><Wallet className="w-3 h-3" />{sarah.walletBalance}/{sarah.walletTotal}</p>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
              <p className="text-[10px] text-white/50">בדידות</p>
              <p className="font-bold text-sm">{sarah.levProfile?.lonelinessScore}/10</p>
            </div>
            <div className="bg-white/10 rounded-lg px-3 py-1.5 text-center">
              <p className="text-[10px] text-white/50">שירותים</p>
              <p className="font-bold text-sm">{completedBookings}</p>
            </div>
          </div>
        </div>
        {/* Changelog */}
        {changelog.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            {changelog.slice(0, 3).map((item, i) => (
              <p key={i} className="text-xs text-white/70 mb-0.5">
                <span className="text-white/40 mr-1">•</span> {item}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/actions" className="stat-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            {pendingCRM.length > 0 && <Badge variant="destructive" className="text-xs">{pendingCRM.length}</Badge>}
          </div>
          <p className="text-xl font-bold text-gray-900">{pendingCRM.length}</p>
          <p className="text-xs text-gray-500">פעולות ממתינות</p>
        </Link>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">{totalClients}</p>
          <p className="text-xs text-gray-500">מטופלים פעילים</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            {unreadAlertsCount > 0 && <Badge variant="destructive" className="text-xs">{unreadAlertsCount}</Badge>}
          </div>
          <p className="text-xl font-bold text-gray-900">{recentAlerts.length}</p>
          <p className="text-xs text-gray-500">התראות פתוחות</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">{completedBookings}</p>
          <p className="text-xs text-gray-500">שירותים הושלמו</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CRM Actions — scenario-driven */}
        <div className="dashboard-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              פעולות לב — שרה כהן
            </h2>
            <Link to="/actions" className="text-xs text-primary hover:underline flex items-center gap-1">
              כל הפעולות <ArrowLeftCircle className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {scenarioCRM.length === 0 ? (
              <p className="text-gray-500 text-center py-6 text-sm">אין פעולות ממתינות 🎉</p>
            ) : (
              scenarioCRM.map((action) => (
                <div
                  key={action.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    action.status === 'completed' ? 'bg-green-50/50 border-green-200 opacity-70' :
                    action.priority === "high" ? "bg-red-50/50 border-red-200" :
                    action.priority === "medium" ? "bg-amber-50/50 border-amber-200" :
                    "bg-blue-50/50 border-blue-200"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    action.status === 'completed' ? 'bg-green-100' :
                    action.priority === "high" ? "bg-red-100" :
                    action.priority === "medium" ? "bg-amber-100" : "bg-blue-100"
                  }`}>
                    {action.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : action.actionType === "loneliness_intervention" ? (
                      <Heart className="w-4 h-4 text-red-500" />
                    ) : (
                      <Activity className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900">{action.title}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {CRM_ACTION_LABELS[action.actionType as keyof typeof CRM_ACTION_LABELS] || action.actionType}
                      </Badge>
                      {action.status === 'completed' && (
                        <span className="text-[10px] text-green-600 font-bold">✓ הושלם</span>
                      )}
                      {action.status === 'in_progress' && (
                        <span className="text-[10px] text-blue-600 font-bold">⏳ בטיפול</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
                    {action.suggestedAction && action.status !== 'completed' && (
                      <p className="text-xs text-primary mt-1 font-medium">💡 {action.suggestedAction}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KPIs — scenario-driven */}
        <div className="dashboard-card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">מדדי ביצוע</h2>
          <div className="space-y-4">
            {kpis.map((kpi) => (
              <div key={kpi.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-600">{kpi.nameHe}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {kpi.value}{kpi.unit}
                    </span>
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
                  className={`h-2 ${
                    kpi.status === "good" ? "[&>div]:bg-green-500" :
                    kpi.status === "warning" ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-red-500"
                  }`}
                />
                <p className="text-[10px] text-gray-400 mt-0.5">יעד: {kpi.target}{kpi.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts — scenario-driven */}
        <div className="dashboard-card lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">התראות אחרונות</h2>
            <Link to="/alerts" className="text-xs text-primary hover:underline flex items-center gap-1">
              כל ההתראות <ArrowLeftCircle className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentAlerts.map((alert) => {
              const AlertIcon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border ${
                    !alert.isRead ? "bg-blue-50/50 border-blue-200" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.severity === 'critical' ? 'bg-red-100' :
                    alert.severity === 'warning' ? 'bg-amber-100' :
                    alert.severity === 'success' || alert.type === 'service_completed' || alert.type === 'booking_confirmed' ? 'bg-green-100' :
                    'bg-blue-100'
                  }`}>
                    <AlertIcon className={`w-4 h-4 ${
                      alert.severity === 'critical' ? 'text-red-600' :
                      alert.severity === 'warning' ? 'text-amber-600' :
                      alert.severity === 'success' || alert.type === 'service_completed' ? 'text-green-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      {alert.title}
                      {!alert.isRead && <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{alert.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
