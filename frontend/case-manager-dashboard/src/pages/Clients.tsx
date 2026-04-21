import { Avatar, AvatarFallback } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import { Activity, ChevronLeft, Filter, Search, Wallet } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function Clients() {
  const { clients } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<number | null>(null);

  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name.includes(searchQuery) ||
      client.city.includes(searchQuery);
    const matchesLevel = filterLevel === null || client.nursingLevel === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelColor = (level: number) => {
    if (level <= 2) return "bg-green-100 text-green-700";
    if (level <= 4) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getWalletStatus = (balance: number, total: number) => {
    const percentage = (balance / total) * 100;
    if (percentage >= 50) return { color: "bg-green-500", text: "תקין" };
    if (percentage >= 25) return { color: "bg-amber-500", text: "נמוך" };
    return { color: "bg-red-500", text: "קריטי" };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">מטופלים</h1>
          <p className="text-gray-500 mt-1">{clients.length} מטופלים רשומים</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם או עיר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterLevel ?? ""}
            onChange={(e) => setFilterLevel(e.target.value ? Number(e.target.value) : null)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="">כל הרמות</option>
            {[1, 2, 3, 4, 5, 6].map((level) => (
              <option key={level} value={level}>רמה {level}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const walletStatus = getWalletStatus(client.walletBalance, client.totalUnits);

          return (
            <Link
              key={client.id}
              to={`/clients/${client.id}`}
              className="dashboard-card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {client.name.split(" ").map((n) => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{client.name}</h3>
                    <Badge className={`text-xs ${getLevelColor(client.nursingLevel)}`}>
                      רמה {client.nursingLevel}
                    </Badge>
                  </div>

                  <p className="text-sm text-gray-500 mt-0.5">{client.city}</p>
                  <p className="text-sm text-gray-400">גיל {client.age}</p>
                </div>

                <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
              </div>

              {/* Wallet Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Wallet className="w-4 h-4" />
                    <span>יתרת ארנק</span>
                  </div>
                  <span className="text-sm font-medium">
                    {client.walletBalance} / {client.totalUnits} יחידות
                  </span>
                </div>
                <Progress
                  value={(client.walletBalance / client.totalUnits) * 100}
                  className={`h-2 ${walletStatus.color}`}
                />
              </div>

              {/* Functional Profile Summary */}
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    ניידות: {client.functionalProfile.mobility}/5
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-600">
                    קוגניציה: {client.functionalProfile.cognitive}/5
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">לא נמצאו מטופלים התואמים את החיפוש</p>
        </div>
      )}
    </div>
  );
}
