import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import {
    CONTENT_WORLD_ICONS,
    CONTENT_WORLD_LABELS,
    contentWorldStats,
    CRM_ACTION_LABELS,
    crmActions,
    kpiMetrics,
} from "@libi/shared-ui/data";
import {
    Activity,
    AlertTriangle,
    ArrowDown,
    ArrowLeftCircle,
    ArrowUp,
    Bell,
    CheckCircle2,
    Heart,
    Sparkles,
    TrendingUp,
    Users
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function Dashboard() {
  const { clients, bookings, alerts, unreadAlertsCount } = useApp();

  // Calculate statistics
  const totalClients = clients.length;
  const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length;
  const completedThisMonth = bookings.filter(
    (b) => b.status === "completed" &&
    new Date(b.scheduledDate).getMonth() === new Date().getMonth()
  ).length;

  // CRM Actions stats
  const pendingActions = crmActions.filter((a) => a.status === "pending");
  const highPriorityActions = pendingActions.filter((a) => a.priority === "high");

  // Recent alerts (unresolved, sorted by date)
  const recentAlerts = alerts
    .filter((a) => !a.isResolved)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3);

  // Recent CRM actions
  const recentActions = pendingActions.slice(0, 4);

  // Upcoming bookings
  const upcomingBookings = bookings
    .filter((b) => b.status === "confirmed" && new Date(b.scheduledDate) > new Date())
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  // Clients needing attention (low wallet balance or high nursing level)
  const clientsNeedingAttention = clients
    .filter((c) => c.walletBalance < 10 || c.nursingLevel >= 5)
    .slice(0, 5);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "health": return Activity;
      case "loneliness": return Heart;
      case "cognitive": return Activity;
      default: return AlertTriangle;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical": return "critical";
      case "warning": return "warning";
      default: return "info";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    return `לפני ${Math.floor(hours / 24)} ימים`;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">שלום, שרית 👋</h1>
        <p className="text-gray-500 mt-1">הנה סיכום הפעילות של היום</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Link to="/actions" className="stat-card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            {highPriorityActions.length > 0 && (
              <Badge variant="destructive">{highPriorityActions.length} דחופות</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingActions.length}</p>
          <p className="text-sm text-gray-500">פעולות לב ממתינות</p>
        </Link>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
          <p className="text-sm text-gray-500">מטופלים פעילים</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-amber-600" />
            </div>
            {unreadAlertsCount > 0 && (
              <Badge variant="destructive">{unreadAlertsCount} חדשות</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{alerts.filter(a => !a.isResolved).length}</p>
          <p className="text-sm text-gray-500">התראות פתוחות</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedThisMonth}</p>
          <p className="text-sm text-gray-500">הושלמו החודש</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CRM Actions Section */}
        <div className="dashboard-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              פעולות לב ממתינות
            </h2>
            <Link
              to="/actions"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              צפייה בכל
              <ArrowLeftCircle className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentActions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין פעולות ממתינות 🎉</p>
            ) : (
              recentActions.map((action) => {
                const client = clients.find((c) => c.id === action.clientId);

                return (
                  <Link
                    key={action.id}
                    to="/actions"
                    className={`flex items-start gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow ${
                      action.priority === "high" ? "bg-red-50/50 border-red-100" :
                      action.priority === "medium" ? "bg-amber-50/50 border-amber-100" :
                      "bg-blue-50/50 border-blue-100"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      action.priority === "high" ? "bg-red-100" :
                      action.priority === "medium" ? "bg-amber-100" : "bg-blue-100"
                    }`}>
                      {action.actionType === "loneliness_intervention" ? (
                        <Heart className={`w-5 h-5 ${
                          action.priority === "high" ? "text-red-600" :
                          action.priority === "medium" ? "text-amber-600" : "text-blue-600"
                        }`} />
                      ) : (
                        <Activity className={`w-5 h-5 ${
                          action.priority === "high" ? "text-red-600" :
                          action.priority === "medium" ? "text-amber-600" : "text-blue-600"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <Badge variant="outline" className={`text-xs ${
                          action.priority === "high" ? "bg-red-100 text-red-700 border-red-200" :
                          action.priority === "medium" ? "bg-amber-100 text-amber-700 border-amber-200" :
                          "bg-blue-100 text-blue-700 border-blue-200"
                        }`}>
                          {CRM_ACTION_LABELS[action.actionType]}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{action.description}</p>
                      {client && (
                        <span className="text-xs text-primary">• {client.name}</span>
                      )}
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* KPIs Section */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">מדדי ביצוע</h2>

          <div className="space-y-4">
            {kpiMetrics.slice(0, 4).map((kpi) => (
              <div key={kpi.id}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">{kpi.nameHe}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">
                      {kpi.value}{kpi.unit}
                    </span>
                    {kpi.trend !== "stable" && (
                      <span className={`flex items-center text-xs ${
                        kpi.trend === "up" ? "text-green-600" : "text-red-600"
                      }`}>
                        {kpi.trend === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        {kpi.trendValue}%
                      </span>
                    )}
                  </div>
                </div>
                <Progress
                  value={(kpi.value / kpi.target) * 100}
                  className={`h-2 ${
                    kpi.status === "good" ? "[&>div]:bg-green-500" :
                    kpi.status === "warning" ? "[&>div]:bg-amber-500" :
                    "[&>div]:bg-red-500"
                  }`}
                />
              </div>
            ))}
          </div>

          <Link
            to="/reports"
            className="block mt-4 text-sm text-primary hover:underline text-center"
          >
            צפייה בכל המדדים →
          </Link>
        </div>

        {/* Alerts Section */}
        <div className="dashboard-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">התראות אחרונות</h2>
            <Link
              to="/alerts"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              צפייה בכל
              <ArrowLeftCircle className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAlerts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין התראות פתוחות 🎉</p>
            ) : (
              recentAlerts.map((alert) => {
                const AlertIcon = getAlertIcon(alert.type);
                const client = clients.find((c) => c.id === alert.clientId);

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      !alert.isRead ? "bg-red-50/50 border-red-100" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div className={`alert-badge ${getSeverityClass(alert.severity)}`}>
                      <AlertIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        {!alert.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">{formatTime(alert.createdAt)}</span>
                        {client && (
                          <span className="text-xs text-primary">• {client.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Content Worlds Overview */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">עולמות תוכן</h2>

          <div className="space-y-3">
            {contentWorldStats.slice(0, 4).map((stat) => (
              <div key={stat.world} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span className="text-2xl">{CONTENT_WORLD_ICONS[stat.world]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {CONTENT_WORLD_LABELS[stat.world]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stat.totalServices} שירותים • ⭐ {stat.avgRating}
                  </p>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-medium ${
                    stat.utilizationPercent >= 70 ? "text-green-600" :
                    stat.utilizationPercent >= 50 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {stat.utilizationPercent}%
                  </p>
                  <p className="text-xs text-gray-500">ניצול</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
