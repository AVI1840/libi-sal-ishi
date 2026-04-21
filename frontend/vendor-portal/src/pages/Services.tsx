import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Edit, Eye, EyeOff, MoreVertical, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

export default function Services() {
  const { services, updateService, deleteService, bookings } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filteredServices = services.filter((service) =>
    service.title.includes(searchQuery) || service.category.includes(searchQuery)
  );

  const getBookingCount = (serviceId: string) => {
    return bookings.filter((b) => b.serviceId === serviceId).length;
  };

  const handleToggleActive = (serviceId: string, currentStatus: boolean) => {
    updateService(serviceId, { isActive: !currentStatus });
    toast.success(currentStatus ? "השירות הוסתר" : "השירות הופעל");
    setOpenMenu(null);
  };

  const handleDelete = (serviceId: string) => {
    if (confirm("האם אתה בטוח שברצונך למחוק שירות זה?")) {
      deleteService(serviceId);
      toast.success("השירות נמחק");
    }
    setOpenMenu(null);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      physiotherapy: "פיזיותרפיה",
      nursing: "סיעוד",
      social: "פעילות חברתית",
      wellness: "רווחה",
      medical: "שירותי רפואה",
      other: "אחר",
    };
    return labels[category] || category;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">השירותים שלי</h1>
          <p className="text-gray-500 mt-1">{services.length} שירותים</p>
        </div>
        <Link to="/services/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            שירות חדש
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="חיפוש שירותים..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => {
          const bookingCount = getBookingCount(service.id);

          return (
            <div
              key={service.id}
              className={`vendor-card relative ${!service.isActive ? "opacity-60" : ""}`}
            >
              {/* Menu Button */}
              <div className="absolute top-4 left-4">
                <button
                  onClick={() => setOpenMenu(openMenu === service.id ? null : service.id)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>

                {openMenu === service.id && (
                  <div className="absolute left-0 top-8 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px] z-10">
                    <Link
                      to={`/services/${service.id}/edit`}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Edit className="w-4 h-4" />
                      עריכה
                    </Link>
                    <button
                      onClick={() => handleToggleActive(service.id, service.isActive)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                      {service.isActive ? (
                        <>
                          <EyeOff className="w-4 h-4" />
                          הסתר
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          הפעל
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <Trash2 className="w-4 h-4" />
                      מחק
                    </button>
                  </div>
                )}
              </div>

              {/* Service Content */}
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">
                  {getCategoryLabel(service.category)}
                </Badge>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
              </div>

              {/* Service Details */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  <p className="text-2xl font-bold text-primary">{service.unitCost}</p>
                  <p className="text-xs text-gray-500">יחידות</p>
                </div>
                <div className="text-left">
                  <p className="text-lg font-semibold text-gray-900">{bookingCount}</p>
                  <p className="text-xs text-gray-500">הזמנות</p>
                </div>
              </div>

              {/* Duration */}
              {service.durationMinutes && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <span>משך: {service.durationMinutes} דקות</span>
                </div>
              )}

              {/* Status Badge */}
              {!service.isActive && (
                <Badge className="absolute top-4 right-4 bg-gray-100 text-gray-600">
                  מוסתר
                </Badge>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">לא נמצאו שירותים</p>
          <Link to="/services/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              צור שירות חדש
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
