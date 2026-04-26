import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Clock, Edit, Eye, EyeOff, Package, Plus, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

const CATEGORY_LABELS: Record<string, string> = {
  physiotherapy: "פיזיותרפיה",
  nursing: "סיעוד",
  social: "פעילות חברתית",
  wellness: "רווחה",
  medical: "שירותי רפואה",
  culture: "תרבות",
  fitness: "כושר",
  prevention: "מניעה",
  other: "אחר",
};

export default function Services() {
  const { services, updateService, deleteService, bookings } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = services.filter(
    (s) => s.title.includes(searchQuery) || s.category.includes(searchQuery)
  );

  const getBookingCount = (serviceId: string) =>
    bookings.filter((b) => b.serviceId === serviceId).length;

  const handleToggle = (id: string, active: boolean) => {
    updateService(id, { isActive: !active });
    toast.success(active ? "השירות הוסתר" : "השירות הופעל");
  };

  const handleDelete = (id: string) => {
    if (confirm("למחוק שירות זה?")) {
      deleteService(id);
      toast.success("השירות נמחק");
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-gray-400" />
            השירותים שלי
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {services.length} שירותים · {services.filter((s) => s.isActive).length} פעילים
          </p>
        </div>
        <Link to="/services/new">
          <Button size="sm" className="gap-1.5 h-9">
            <Plus className="w-4 h-4" />
            שירות חדש
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="חיפוש שירותים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-9 h-9 text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/80 text-xs text-gray-500 border-b border-gray-100">
              <th className="text-right py-3 px-4 font-medium">שירות</th>
              <th className="text-right py-3 px-3 font-medium w-24">קטגוריה</th>
              <th className="text-center py-3 px-3 font-medium w-16">יחידות</th>
              <th className="text-center py-3 px-3 font-medium w-16">משך</th>
              <th className="text-center py-3 px-3 font-medium w-20">הזמנות</th>
              <th className="text-center py-3 px-3 font-medium w-16">סטטוס</th>
              <th className="text-center py-3 px-3 font-medium w-28">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((service) => {
              const count = getBookingCount(service.id);
              return (
                <tr
                  key={service.id}
                  className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${!service.isActive ? "opacity-50" : ""}`}
                >
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-gray-900">{service.title}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[280px]">{service.description}</p>
                  </td>
                  <td className="py-3 px-3">
                    <Badge variant="outline" className="text-[10px]">
                      {CATEGORY_LABELS[service.category] || service.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-sm font-bold text-blue-700">{service.unitCost}</span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.durationMinutes || 60}׳
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`text-sm font-medium ${count > 0 ? "text-gray-900" : "text-gray-300"}`}>
                      {count}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <Badge className={`text-[10px] ${service.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {service.isActive ? "פעיל" : "מוסתר"}
                    </Badge>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex gap-1 justify-center">
                      <Link to={`/services/${service.id}/edit`}>
                        <button className="p-1.5 rounded-md hover:bg-gray-100 transition-colors" title="עריכה">
                          <Edit className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleToggle(service.id, service.isActive)}
                        className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                        title={service.isActive ? "הסתר" : "הפעל"}
                      >
                        {service.isActive ? (
                          <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        title="מחק"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-3">לא נמצאו שירותים</p>
            <Link to="/services/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                צור שירות חדש
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
