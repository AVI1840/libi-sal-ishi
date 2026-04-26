import { Avatar, AvatarFallback } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import {
  PERSONA_LABELS,
  RISK_FLAG_LABELS,
} from "@libi/shared-ui/data";
import { ChevronLeft, Filter, Search, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

const LEVEL_COLORS: Record<number, string> = {
  1: "bg-green-100 text-green-700",
  2: "bg-green-100 text-green-700",
  3: "bg-amber-100 text-amber-700",
  4: "bg-amber-100 text-amber-700",
  5: "bg-red-100 text-red-700",
  6: "bg-red-100 text-red-700",
};

export default function Clients() {
  const { clients } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>("all");

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.includes(searchQuery) || client.city.includes(searchQuery);
    const matchesLevel =
      filterLevel === null || client.nursingLevel === filterLevel;
    const matchesRisk =
      filterRisk === "all" ||
      (filterRisk === "at_risk" && client.levProfile?.riskFlags && client.levProfile.riskFlags.length > 0) ||
      (filterRisk === "ok" && (!client.levProfile?.riskFlags || client.levProfile.riskFlags.length === 0));
    return matchesSearch && matchesLevel && matchesRisk;
  });

  const atRiskCount = clients.filter(
    (c) => c.levProfile?.riskFlags && c.levProfile.riskFlags.length > 0
  ).length;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            מטופלים
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {clients.length} רשומים · {atRiskCount} דורשים תשומת לב
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש שם או עיר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 h-9 text-sm"
          />
        </div>
        <select
          value={filterLevel ?? ""}
          onChange={(e) => setFilterLevel(e.target.value ? Number(e.target.value) : null)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white h-9"
        >
          <option value="">כל הרמות</option>
          {[1, 2, 3].map((l) => (
            <option key={l} value={l}>רמה {l}</option>
          ))}
        </select>
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white h-9"
        >
          <option value="all">כל המצבים</option>
          <option value="at_risk">⚠️ דורשים תשומת לב</option>
          <option value="ok">✅ תקינים</option>
        </select>
        <span className="text-xs text-gray-400 mr-auto">{filteredClients.length} תוצאות</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 text-xs text-gray-500 border-b border-gray-100">
              <th className="text-right py-3 px-4 font-medium">מטופל/ת</th>
              <th className="text-center py-3 px-3 font-medium w-16">רמה</th>
              <th className="text-right py-3 px-3 font-medium w-28">ארנק</th>
              <th className="text-right py-3 px-3 font-medium w-32">פרסונה</th>
              <th className="text-right py-3 px-3 font-medium w-24">בדידות</th>
              <th className="text-right py-3 px-3 font-medium">דגלים</th>
              <th className="text-center py-3 px-3 font-medium w-20">פעילות</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((client) => {
              const lev = client.levProfile;
              const walletPct = Math.round((client.walletBalance / client.totalUnits) * 100);
              const hasRisk = lev?.riskFlags && lev.riskFlags.length > 0;

              return (
                <tr
                  key={client.id}
                  className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group"
                >
                  {/* Name + City */}
                  <td className="py-3 px-4">
                    <Link to={`/clients/${client.id}`} className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {client.name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                          {client.name}
                        </p>
                        <p className="text-xs text-gray-400">{client.age} · {client.city}</p>
                      </div>
                    </Link>
                  </td>

                  {/* Nursing Level */}
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${LEVEL_COLORS[client.nursingLevel] || "bg-gray-100 text-gray-600"}`}>
                      {client.nursingLevel}
                    </span>
                  </td>

                  {/* Wallet */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={walletPct}
                        className={`h-1.5 flex-1 ${walletPct < 15 ? "[&>div]:bg-red-500" : walletPct < 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-green-500"}`}
                      />
                      <span className="text-xs text-gray-500 w-14 text-left font-mono">
                        {client.walletBalance}/{client.totalUnits}
                      </span>
                    </div>
                  </td>

                  {/* Persona */}
                  <td className="py-3 px-3">
                    {lev?.persona ? (
                      <span className="text-xs text-gray-600 truncate block max-w-[120px]">
                        {PERSONA_LABELS[lev.persona] || lev.persona}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Loneliness */}
                  <td className="py-3 px-3">
                    {lev?.lonelinessScore != null ? (
                      <span className={`text-xs font-bold ${
                        lev.lonelinessScore <= 3 ? "text-red-600" :
                        lev.lonelinessScore <= 5 ? "text-amber-600" :
                        "text-green-600"
                      }`}>
                        {lev.lonelinessScore}/10
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>

                  {/* Risk Flags */}
                  <td className="py-3 px-3">
                    {hasRisk ? (
                      <div className="flex gap-1 flex-wrap">
                        {lev!.riskFlags.slice(0, 2).map((flag) => (
                          <span
                            key={flag}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 font-medium"
                          >
                            {RISK_FLAG_LABELS[flag] || flag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">תקין</span>
                    )}
                  </td>

                  {/* Last Activity */}
                  <td className="py-3 px-3 text-center">
                    <span className="text-xs text-gray-400">{client.lastActivity}</span>
                  </td>

                  {/* Arrow */}
                  <td className="py-3 px-2">
                    <Link to={`/clients/${client.id}`}>
                      <ChevronLeft className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">לא נמצאו מטופלים</p>
          </div>
        )}
      </div>
    </div>
  );
}
