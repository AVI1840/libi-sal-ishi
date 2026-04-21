import { Avatar, AvatarFallback } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import {
    CONTENT_WORLD_ICONS,
    CONTENT_WORLD_LABELS,
    type CRMAction,
    type CRMActionType,
    CRM_ACTION_LABELS,
    PERSONA_LABELS,
    RISK_FLAG_LABELS,
    clients,
    crmActions,
    services,
} from "@libi/shared-ui/data";
import {
    ArrowLeftCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Gift,
    Heart,
    MessageSquare,
    Phone,
    Sparkles,
    User,
    Wallet,
    X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const ACTION_ICONS: Record<CRMActionType, React.ComponentType<{ className?: string }>> = {
  silent_user: Phone,
  loneliness_intervention: Heart,
  birthday_gift: Gift,
  expiring_balance: Clock,
  low_balance: Wallet,
  follow_up: MessageSquare,
  first_service_nudge: Sparkles,
  service_completion_check: CheckCircle2,
};

const PRIORITY_COLORS = {
  high: "bg-red-100 text-red-700 border-red-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-blue-100 text-blue-700 border-blue-200",
};

const PRIORITY_LABELS = {
  high: "דחיפות גבוהה",
  medium: "דחיפות בינונית",
  low: "דחיפות נמוכה",
};

type FilterType = "all" | "high" | "medium" | "low";
type StatusFilter = "pending" | "in_progress" | "completed" | "all";

export default function Actions() {
  const [priorityFilter, setPriorityFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [localActions, setLocalActions] = useState<CRMAction[]>(crmActions);

  // Filter actions
  const filteredActions = localActions.filter((action) => {
    if (priorityFilter !== "all" && action.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && action.status !== statusFilter) return false;
    return true;
  });

  // Group by priority for display
  const highPriority = filteredActions.filter((a) => a.priority === "high");
  const mediumPriority = filteredActions.filter((a) => a.priority === "medium");
  const lowPriority = filteredActions.filter((a) => a.priority === "low");

  const handleStatusChange = (actionId: string, newStatus: CRMAction["status"]) => {
    setLocalActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, status: newStatus } : a))
    );
  };

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);
  const getService = (serviceId: string) => services.find((s) => s.id === serviceId);

  const renderActionCard = (action: CRMAction) => {
    const client = getClient(action.clientId);
    const Icon = ACTION_ICONS[action.actionType];
    const isExpanded = expandedAction === action.id;
    const suggestedServicesList = action.suggestedServices
      ?.map((id) => getService(id))
      .filter(Boolean);

    return (
      <div
        key={action.id}
        className={`bg-white rounded-xl border shadow-sm transition-all ${
          isExpanded ? "ring-2 ring-primary/20" : ""
        }`}
      >
        <div
          className="p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
          onClick={() => setExpandedAction(isExpanded ? null : action.id)}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                action.priority === "high"
                  ? "bg-red-100"
                  : action.priority === "medium"
                  ? "bg-amber-100"
                  : "bg-blue-100"
              }`}
            >
              <Icon
                className={`w-6 h-6 ${
                  action.priority === "high"
                    ? "text-red-600"
                    : action.priority === "medium"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-gray-500">
                  {CRM_ACTION_LABELS[action.actionType]}
                </span>
                <Badge variant="outline" className={PRIORITY_COLORS[action.priority]}>
                  {PRIORITY_LABELS[action.priority]}
                </Badge>
                {action.status === "in_progress" && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                    בטיפול
                  </Badge>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{action.title}</h3>
              <p className="text-gray-600">{action.description}</p>

              {/* Client quick info */}
              {client && (
                <div className="flex items-center gap-2 mt-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {client.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link
                      to={`/clients/${client.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {client.name}
                    </Link>
                    <p className="text-xs text-gray-500">
                      גיל {client.age} • {client.city} • {client.walletBalance} יחידות
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {action.status === "pending" && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(action.id, "in_progress");
                  }}
                >
                  התחל טיפול
                </Button>
              )}
              {action.status === "in_progress" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600 border-green-200 hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStatusChange(action.id, "completed");
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 ml-1" />
                  סיום
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && client && (
          <div className="border-t px-4 py-4 bg-gray-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Lev Profile Summary */}
              {client.levProfile && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    פרופיל לב
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">פרסונה:</span>
                      <Badge variant="outline">
                        {PERSONA_LABELS[client.levProfile.persona]}
                      </Badge>
                    </div>
                    {client.levProfile.coreDream && (
                      <p className="text-sm">
                        <span className="text-gray-500">חלום:</span>{" "}
                        <span className="text-gray-900">"{client.levProfile.coreDream}"</span>
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">ציון בדידות:</span>
                      <span
                        className={`text-sm font-medium ${
                          client.levProfile.lonelinessScore >= 7
                            ? "text-red-600"
                            : client.levProfile.lonelinessScore >= 4
                            ? "text-amber-600"
                            : "text-green-600"
                        }`}
                      >
                        {client.levProfile.lonelinessScore}/10
                      </span>
                    </div>
                    {client.levProfile.riskFlags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {client.levProfile.riskFlags.map((flag) => (
                          <Badge
                            key={flag}
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {RISK_FLAG_LABELS[flag]}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Engagement tips */}
                  {client.levProfile.engagementTips.length > 0 && (
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">טיפים לשיחה:</h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {client.levProfile.engagementTips.slice(0, 3).map((tip, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-primary">•</span> {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Suggested Services */}
              {suggestedServicesList && suggestedServicesList.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    שירותים מומלצים
                  </h4>
                  <div className="space-y-2">
                    {suggestedServicesList.map((service) => (
                      <div
                        key={service!.id}
                        className="flex items-center gap-3 p-2 bg-white rounded-lg border"
                      >
                        <span className="text-xl">
                          {service!.contentWorld
                            ? CONTENT_WORLD_ICONS[service!.contentWorld]
                            : "📦"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{service!.name}</p>
                          <p className="text-xs text-gray-500">
                            {service!.contentWorld
                              ? CONTENT_WORLD_LABELS[service!.contentWorld]
                              : service!.category}
                            {service!.isGroupActivity && " • קבוצתי"}
                          </p>
                        </div>
                        {service!.subsidyTier && service!.subsidyTier !== "none" && (
                          <Badge
                            variant="outline"
                            className={
                              service!.subsidyTier === "full"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {service!.subsidyTier === "full"
                              ? "מסובסד מלא"
                              : service!.subsidyTier === "partial"
                              ? "סבסוד 50%"
                              : "סבסוד 20%"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mt-6 pt-4 border-t">
              <Button className="gap-2">
                <Phone className="w-4 h-4" />
                התקשר
              </Button>
              <Button variant="outline" className="gap-2">
                <Calendar className="w-4 h-4" />
                קבע פגישה
              </Button>
              <Link to={`/clients/${client.id}`}>
                <Button variant="outline" className="gap-2">
                  <ArrowLeftCircle className="w-4 h-4" />
                  צפה בפרופיל
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="mr-auto text-gray-500"
                onClick={() => handleStatusChange(action.id, "dismissed")}
              >
                <X className="w-4 h-4 ml-1" />
                בטל פעולה
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const pendingCount = localActions.filter((a) => a.status === "pending").length;
  const inProgressCount = localActions.filter((a) => a.status === "in_progress").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">פעולות לב 💙</h1>
            <p className="text-gray-500 mt-1">פעולות פרואקטיביות עבור המטופלים שלך</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-left">
              <p className="text-2xl font-bold text-primary">{pendingCount}</p>
              <p className="text-sm text-gray-500">ממתינות</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-purple-600">{inProgressCount}</p>
              <p className="text-sm text-gray-500">בטיפול</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">דחיפות:</span>
          <div className="flex gap-1">
            {(["all", "high", "medium", "low"] as const).map((filter) => (
              <Button
                key={filter}
                variant={priorityFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setPriorityFilter(filter)}
              >
                {filter === "all"
                  ? "הכל"
                  : filter === "high"
                  ? "גבוהה"
                  : filter === "medium"
                  ? "בינונית"
                  : "נמוכה"}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">סטטוס:</span>
          <div className="flex gap-1">
            {(["pending", "in_progress", "completed", "all"] as const).map((filter) => (
              <Button
                key={filter}
                variant={statusFilter === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter)}
              >
                {filter === "pending"
                  ? "ממתינות"
                  : filter === "in_progress"
                  ? "בטיפול"
                  : filter === "completed"
                  ? "הושלמו"
                  : "הכל"}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Actions List */}
      {filteredActions.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">אין פעולות ממתינות</h3>
          <p className="text-gray-500">כל הפעולות טופלו בהצלחה 🎉</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* High Priority */}
          {highPriority.length > 0 && priorityFilter === "all" && (
            <div>
              <h2 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                דחיפות גבוהה ({highPriority.length})
              </h2>
              <div className="space-y-3">{highPriority.map(renderActionCard)}</div>
            </div>
          )}

          {/* Medium Priority */}
          {mediumPriority.length > 0 && priorityFilter === "all" && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                דחיפות בינונית ({mediumPriority.length})
              </h2>
              <div className="space-y-3">{mediumPriority.map(renderActionCard)}</div>
            </div>
          )}

          {/* Low Priority */}
          {lowPriority.length > 0 && priorityFilter === "all" && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold text-blue-600 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                דחיפות נמוכה ({lowPriority.length})
              </h2>
              <div className="space-y-3">{lowPriority.map(renderActionCard)}</div>
            </div>
          )}

          {/* Single priority filter */}
          {priorityFilter !== "all" && (
            <div className="space-y-3">{filteredActions.map(renderActionCard)}</div>
          )}
        </div>
      )}
    </div>
  );
}
