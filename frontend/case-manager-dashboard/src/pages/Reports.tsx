import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import {
    CONTENT_WORLD_ICONS,
    CONTENT_WORLD_LABELS,
    contentWorldStats,
    crmActions,
    kpiMetrics,
} from "@libi/shared-ui/data";
import {
    ArrowDown,
    ArrowUp,
    BarChart3,
    Calendar,
    Clock,
    Download,
    Heart,
    TrendingUp,
    Users,
    Wallet,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";

export default function Reports() {
  const { clients, bookings, alerts } = useApp();

  // Calculate statistics
  const totalClients = clients.length;
  const avgNursingLevel = (clients.reduce((sum, c) => sum + c.nursingLevel, 0) / totalClients).toFixed(1);
  const totalUnitsUsed = clients.reduce((sum, c) => sum + (c.totalUnits - c.walletBalance), 0);
  const totalUnitsAvailable = clients.reduce((sum, c) => sum + c.totalUnits, 0);
  const utilizationRate = ((totalUnitsUsed / totalUnitsAvailable) * 100).toFixed(1);

  const completedBookings = bookings.filter((b) => b.status === "completed").length;
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled").length;
  const completionRate = ((completedBookings / bookings.length) * 100).toFixed(1);

  const resolvedAlerts = alerts.filter((a) => a.isResolved).length;
  const alertResolutionRate = ((resolvedAlerts / alerts.length) * 100).toFixed(1);

  // CRM stats
  const completedActions = crmActions.filter((a) => a.status === "completed").length;
  const actionCompletionRate = crmActions.length > 0
    ? ((completedActions / crmActions.length) * 100).toFixed(0)
    : "0";

  // Service category breakdown
  const serviceCategories = bookings.reduce((acc, booking) => {
    const category = booking.serviceCategory || "אחר";
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Nursing level distribution
  const nursingLevelDistribution = clients.reduce((acc, client) => {
    acc[client.nursingLevel] = (acc[client.nursingLevel] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">דוחות ומדדי לב</h1>
          <p className="text-gray-500 mt-1">מדדי הזדקנות מיטבית וסטטיסטיקות</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          ייצוא דוח
        </Button>
      </div>

      {/* Lev KPI Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          מדדי הזדקנות מיטבית (לב)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kpiMetrics.map((kpi) => (
            <div key={kpi.id} className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-500">{kpi.nameHe}</span>
                {kpi.trend !== "stable" && (
                  <Badge
                    variant="outline"
                    className={kpi.trend === "up"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                    }
                  >
                    {kpi.trend === "up" ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />}
                    {kpi.trendValue}%
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-lg text-gray-400">{kpi.unit}</p>
                <p className="text-sm text-gray-400 mr-auto">יעד: {kpi.target}{kpi.unit}</p>
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
      </div>

      {/* Content Worlds Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">ניצול לפי עולמות תוכן</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="dashboard-card">
            <div className="space-y-4">
              {contentWorldStats.map((stat) => (
                <div key={stat.world} className="flex items-center gap-4">
                  <span className="text-2xl">{CONTENT_WORLD_ICONS[stat.world]}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {CONTENT_WORLD_LABELS[stat.world]}
                      </span>
                      <span className="text-sm text-gray-500">
                        {stat.totalServices} שירותים • ⭐ {stat.avgRating}
                      </span>
                    </div>
                    <Progress
                      value={stat.utilizationPercent}
                      className={`h-2 ${
                        stat.utilizationPercent >= 70 ? "[&>div]:bg-green-500" :
                        stat.utilizationPercent >= 50 ? "[&>div]:bg-amber-500" :
                        "[&>div]:bg-red-500"
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-medium w-12 text-left ${
                    stat.utilizationPercent >= 70 ? "text-green-600" :
                    stat.utilizationPercent >= 50 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {stat.utilizationPercent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">הוצאות לפי עולם תוכן</h3>
            <div className="space-y-3">
              {contentWorldStats.map((stat) => (
                <div key={stat.world} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{CONTENT_WORLD_ICONS[stat.world]}</span>
                    <span className="text-sm text-gray-600">{CONTENT_WORLD_LABELS[stat.world]}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ₪{stat.totalSpend.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Traditional KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
              <p className="text-sm text-gray-500">מטופלים</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span>+5 החודש</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{completedBookings}</p>
              <p className="text-sm text-gray-500">שירותים הושלמו</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <span>{completionRate}% שיעור השלמה</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalUnitsUsed}</p>
              <p className="text-sm text-gray-500">יחידות נוצלו</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-blue-600">
            <span>{utilizationRate}% ניצול</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgNursingLevel}</p>
              <p className="text-sm text-gray-500">רמת סיעוד ממוצעת</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Nursing Level Distribution */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">התפלגות רמות סיעוד</h3>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((level) => {
              const count = nursingLevelDistribution[level] || 0;
              const percentage = (count / totalClients) * 100;
              return (
                <div key={level} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-16">רמה {level}</span>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-3" />
                  </div>
                  <span className="text-sm text-gray-500 w-20 text-left">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Service Categories */}
        <div className="dashboard-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">שירותים לפי קטגוריה</h3>
          <div className="space-y-3">
            {Object.entries(serviceCategories).map(([category, count]) => {
              const percentage = (count / bookings.length) * 100;
              return (
                <div key={category} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 w-24 truncate">{category}</span>
                  <div className="flex-1">
                    <Progress value={percentage} className="h-3" />
                  </div>
                  <span className="text-sm text-gray-500 w-20 text-left">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Stats */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">סטטיסטיקות הזמנות</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">סה"כ הזמנות</span>
              <span className="font-semibold text-gray-900">{bookings.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">הושלמו</span>
              <span className="font-semibold text-green-600">{completedBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">בוטלו</span>
              <span className="font-semibold text-red-600">{cancelledBookings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">ממתינים</span>
              <span className="font-semibold text-amber-600">
                {bookings.filter((b) => b.status === "pending").length}
              </span>
            </div>
          </div>
        </div>

        {/* Alert Stats */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">סטטיסטיקות התראות</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">סה"כ התראות</span>
              <span className="font-semibold text-gray-900">{alerts.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">טופלו</span>
              <span className="font-semibold text-green-600">{resolvedAlerts}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">פתוחות</span>
              <span className="font-semibold text-amber-600">
                {alerts.filter((a) => !a.isResolved).length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">שיעור טיפול</span>
              <span className="font-semibold text-primary">{alertResolutionRate}%</span>
            </div>
          </div>
        </div>

        {/* Wallet Stats */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">סטטיסטיקות ארנקים</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">סה"כ יחידות</span>
              <span className="font-semibold text-gray-900">{totalUnitsAvailable}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">נוצלו</span>
              <span className="font-semibold text-blue-600">{totalUnitsUsed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">זמינות</span>
              <span className="font-semibold text-green-600">
                {totalUnitsAvailable - totalUnitsUsed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">שיעור ניצול</span>
              <span className="font-semibold text-primary">{utilizationRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
