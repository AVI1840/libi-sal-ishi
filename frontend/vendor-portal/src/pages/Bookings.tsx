import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { AlertCircle, Calendar, CheckCircle2, Clock, Search, User, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

const STATUS_CONFIG = {
  completed: { label: "הושלם", icon: CheckCircle2, cls: "bg-green-100 text-green-700" },
  confirmed: { label: "מאושר", icon: Clock, cls: "bg-blue-100 text-blue-700" },
  pending:   { label: "ממתין", icon: AlertCircle, cls: "bg-amber-100 text-amber-700" },
  cancelled: { label: "בוטל", icon: XCircle, cls: "bg-red-100 text-red-700" },
} as const;

// Mock client names for demo (in production comes from API)
const CLIENT_NAMES: Record<string, string> = {
  "sarah-cohen": "שרה כהן",
  "client-1": "יוסף לוי",
  "client-2": "רחל מזרחי",
  "client-3": "דוד ביטון",
  "client-4": "מרים גבאי",
  "client-5": "אברהם כהן",
};

function getClientName(clientId: string): string {
  return CLIENT_NAMES[clientId] || `לקוח/ה`;
}

type TabKey = "pending" | "confirmed" | "completed" | "all";

export default function Bookings() {
  const { bookings, updateBookingStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("pending");

  const filtered = bookings.filter((b) => {
    const matchesSearch = b.serviceName.includes(searchQuery) || getClientName(b.clientId).includes(searchQuery);
    const matchesTab = activeTab === "all" || b.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const counts = {
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    all: bookings.length,
  };

  const handleConfirm = (id: string) => { updateBookingStatus(id, "confirmed"); toast.success("ההזמנה אושרה ✓"); };
  const handleComplete = (id: string) => { updateBookingStatus(id, "completed"); toast.success("השירות הושלם ✓"); };
  const handleCancel = (id: string) => { updateBookingStatus(id, "cancelled"); toast.success("ההזמנה בוטלה"); };

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "pending", label: "ממתינים", count: counts.pending },
    { key: "confirmed", label: "מאושרים", count: counts.confirmed },
    { key: "completed", label: "הושלמו", count: counts.completed },
    { key: "all", label: "הכל", count: counts.all },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">הזמנות</h1>
          <p className="text-gray-500 text-sm mt-0.5">{bookings.length} הזמנות סה"כ</p>
        </div>
      </div>

      {/* Search + Tabs */}
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש שירות או לקוח..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && tab.key !== "all" && (
                <span className={`mr-1 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-500"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 text-xs text-gray-500 border-b border-gray-100">
              <th className="text-right py-3 px-4 font-medium">שירות</th>
              <th className="text-right py-3 px-3 font-medium w-28">לקוח/ה</th>
              <th className="text-center py-3 px-3 font-medium w-24">תאריך</th>
              <th className="text-center py-3 px-3 font-medium w-16">יחידות</th>
              <th className="text-center py-3 px-3 font-medium w-20">הכנסה</th>
              <th className="text-center py-3 px-3 font-medium w-24">סטטוס</th>
              <th className="text-center py-3 px-3 font-medium w-36">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                  אין הזמנות {activeTab !== "all" ? `ב-${tabs.find(t => t.key === activeTab)?.label}` : ""}
                </td>
              </tr>
            ) : (
              filtered
                .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                .map((booking) => {
                  const date = new Date(booking.scheduledDate);
                  const cfg = STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = cfg.icon;
                  const clientName = getClientName(booking.clientId);
                  const earnings = booking.unitsCost * 120;

                  return (
                    <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900">{booking.serviceName}</p>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-700">{clientName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div>
                          <p className="text-xs font-medium text-gray-900">
                            {date.toLocaleDateString("he-IL", { day: "numeric", month: "short" })}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-mono text-gray-700">{booking.unitsCost}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-medium text-gray-900">₪{earnings}</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge className={`${cfg.cls} gap-1 text-[10px]`}>
                          <StatusIcon className="w-2.5 h-2.5" />
                          {cfg.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex gap-1.5 justify-center">
                          {booking.status === "pending" && (
                            <>
                              <Button size="sm" className="h-7 text-xs px-3" onClick={() => handleConfirm(booking.id)}>
                                אשר
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-red-500 hover:text-red-700" onClick={() => handleCancel(booking.id)}>
                                דחה
                              </Button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <>
                              <Button size="sm" className="h-7 text-xs px-3 bg-green-600 hover:bg-green-700" onClick={() => handleComplete(booking.id)}>
                                הושלם
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 text-xs px-2 text-red-500 hover:text-red-700" onClick={() => handleCancel(booking.id)}>
                                בטל
                              </Button>
                            </>
                          )}
                          {booking.status === "completed" && (
                            <span className="text-[10px] text-green-600">✓</span>
                          )}
                          {booking.status === "cancelled" && (
                            <span className="text-[10px] text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
