import { Badge } from "@libi/shared-ui/components/ui/badge";
import {
    ArrowLeftCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    Package,
    Star,
    TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function Dashboard() {
  const {
    vendor,
    services,
    bookings,
    payments,
    totalEarnings,
    pendingEarnings,
    completedBookingsCount
  } = useApp();

  // Calculate statistics
  const activeServices = services.filter((s) => s.isActive).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const thisMonthEarnings = payments
    .filter((p) => {
      const paymentMonth = new Date(p.createdAt).getMonth();
      return paymentMonth === new Date().getMonth() && p.status === "paid";
    })
    .reduce((sum, p) => sum + p.netAmount, 0);

  // Upcoming bookings (next 7 days)
  const upcomingBookings = bookings
    .filter((b) => {
      const bookingDate = new Date(b.scheduledDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return b.status === "confirmed" && bookingDate >= now && bookingDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
    .slice(0, 5);

  // Top services by bookings
  const serviceBookingCounts = services.map((service) => ({
    service,
    count: bookings.filter((b) => b.serviceId === service.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: "ILS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">שלום, {vendor.name} 👋</h1>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-medium">{vendor.rating}</span>
          </div>
        </div>
        <p className="text-gray-500">הנה סיכום הפעילות שלך</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
          <p className="text-sm text-gray-500">סה"כ הכנסות</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            {pendingBookings.length > 0 && (
              <Badge variant="destructive">{pendingBookings.length} חדשות</Badge>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(pendingEarnings)}</p>
          <p className="text-sm text-gray-500">הכנסות צפויות</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeServices}</p>
          <p className="text-sm text-gray-500">שירותים פעילים</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-green-600 font-medium">+12%</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedBookingsCount}</p>
          <p className="text-sm text-gray-500">שירותים שהושלמו</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Bookings */}
        <div className="vendor-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">הזמנות ממתינות לאישור</h2>
            <Link
              to="/bookings"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              צפייה בכל
              <ArrowLeftCircle className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {pendingBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין הזמנות ממתינות 🎉</p>
            ) : (
              pendingBookings.slice(0, 5).map((booking) => {
                const service = services.find((s) => s.id === booking.serviceId);
                const date = new Date(booking.scheduledDate);

                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 bg-amber-50/50 rounded-lg border border-amber-100"
                  >
                    <div className="w-14 h-14 rounded-lg bg-white border border-amber-200 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{date.getDate()}</span>
                      <span className="text-xs text-gray-500">
                        {date.toLocaleDateString("he-IL", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{booking.serviceName}</p>
                      <p className="text-sm text-gray-500">
                        {date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge className="bg-amber-100 text-amber-700">ממתין</Badge>
                      <p className="text-sm text-gray-500 mt-1">{booking.unitsCost} יחידות</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="vendor-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">הכנסות החודש</h2>

          <div className="text-center mb-6">
            <p className="text-4xl font-bold text-primary">{formatCurrency(thisMonthEarnings)}</p>
            <p className="text-sm text-gray-500 mt-1">מתוך {completedBookingsCount} שירותים</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">עמלת פלטפורמה (7%)</span>
              <span className="text-gray-900">{formatCurrency(thisMonthEarnings * 0.07)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">נטו לקבל</span>
              <span className="font-semibold text-green-600">{formatCurrency(thisMonthEarnings)}</span>
            </div>
          </div>

          <Link to="/payments">
            <button className="w-full mt-4 py-2 px-4 bg-primary/10 text-primary rounded-lg font-medium hover:bg-primary/20 transition-colors">
              פרטי תשלומים
            </button>
          </Link>
        </div>

        {/* Upcoming Bookings */}
        <div className="vendor-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">הזמנות קרובות</h2>
            <Link
              to="/bookings"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              צפייה בכל
              <ArrowLeftCircle className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">אין הזמנות קרובות</p>
            ) : (
              upcomingBookings.map((booking) => {
                const date = new Date(booking.scheduledDate);

                return (
                  <div
                    key={booking.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-14 h-14 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center">
                      <span className="text-lg font-bold text-gray-900">{date.getDate()}</span>
                      <span className="text-xs text-gray-500">
                        {date.toLocaleDateString("he-IL", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{booking.serviceName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          {date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">מאושר</Badge>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Services */}
        <div className="vendor-card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">שירותים מובילים</h2>

          <div className="space-y-3">
            {serviceBookingCounts.map(({ service, count }, index) => (
              <div key={service.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{service.title}</p>
                  <p className="text-xs text-gray-500">{count} הזמנות</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{service.unitCost} יחידות</p>
              </div>
            ))}
          </div>

          <Link to="/services">
            <button className="w-full mt-4 py-2 px-4 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              נהל שירותים
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
