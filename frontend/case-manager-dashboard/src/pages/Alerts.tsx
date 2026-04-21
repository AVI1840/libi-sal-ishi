import { Avatar, AvatarFallback } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@libi/shared-ui/components/ui/tabs";
import {
    Activity,
    AlertTriangle,
    Bell,
    Brain,
    CheckCircle2,
    ChevronLeft,
    Clock,
    Filter,
    Heart,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function Alerts() {
  const { alerts, clients, markAlertAsRead, resolveAlert } = useApp();
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredAlerts = alerts.filter((alert) => {
    if (typeFilter === "all") return true;
    return alert.type === typeFilter;
  });

  const unreadAlerts = filteredAlerts.filter((a) => !a.isRead && !a.isResolved);
  const resolvedAlerts = filteredAlerts.filter((a) => a.isResolved);
  const activeAlerts = filteredAlerts.filter((a) => !a.isResolved);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "health": return Activity;
      case "loneliness": return Heart;
      case "cognitive": return Brain;
      case "emergency": return AlertTriangle;
      default: return Bell;
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case "critical": return "critical";
      case "warning": return "warning";
      default: return "info";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "health": return "בריאות";
      case "loneliness": return "בדידות";
      case "cognitive": return "קוגניטיבי";
      case "emergency": return "חירום";
      default: return type;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `לפני ${minutes} דקות`;
    if (hours < 24) return `לפני ${hours} שעות`;
    return `לפני ${days} ימים`;
  };

  const AlertCard = ({ alert }: { alert: typeof alerts[0] }) => {
    const AlertIcon = getAlertIcon(alert.type);
    const client = clients.find((c) => c.id === alert.clientId);

    return (
      <div
        className={`dashboard-card ${
          !alert.isRead && !alert.isResolved ? "border-red-200 bg-red-50/30" : ""
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`alert-badge ${getSeverityClass(alert.severity)} p-2`}>
            <AlertIcon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{alert.title}</h3>
              {!alert.isRead && !alert.isResolved && (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              )}
              {alert.isResolved && (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  טופל
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1">{alert.description}</p>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatTime(alert.createdAt)}</span>
              </div>
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(alert.type)}
              </Badge>
            </div>

            {/* Client Info */}
            {client && (
              <Link
                to={`/clients/${client.id}`}
                className="flex items-center gap-3 mt-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {client.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{client.name}</p>
                  <p className="text-xs text-gray-500">רמה {client.nursingLevel} • {client.city}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-primary" />
              </Link>
            )}
          </div>
        </div>

        {/* Actions */}
        {!alert.isResolved && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              size="sm"
              onClick={() => resolveAlert(alert.id)}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              סמן כטופל
            </Button>
            {!alert.isRead && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => markAlertAsRead(alert.id)}
              >
                סמן כנקרא
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">התראות</h1>
          <p className="text-gray-500 mt-1">
            {unreadAlerts.length > 0
              ? `${unreadAlerts.length} התראות חדשות`
              : "אין התראות חדשות"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">כל הסוגים</option>
            <option value="health">בריאות</option>
            <option value="loneliness">בדידות</option>
            <option value="cognitive">קוגניטיבי</option>
            <option value="emergency">חירום</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active" className="gap-2">
            פעילות
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                {unreadAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="resolved">
            טופלו ({resolvedAlerts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {activeAlerts
              .sort((a, b) => {
                // Sort by severity first, then by date
                const severityOrder = { critical: 0, warning: 1, info: 2 };
                const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
                if (severityDiff !== 0) return severityDiff;
                return b.createdAt.getTime() - a.createdAt.getTime();
              })
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </div>
          {activeAlerts.length === 0 && (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">אין התראות פעילות 🎉</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="resolved">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resolvedAlerts
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
          </div>
          {resolvedAlerts.length === 0 && (
            <p className="text-gray-500 text-center py-12">אין התראות שטופלו</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
