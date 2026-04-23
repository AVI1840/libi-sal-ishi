import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import {
  ArrowLeftCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Package,
  Phone,
  Star,
  TrendingUp,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function Dashboard() {
  const {
    vendor,
    services,
    bookings,
    totalEarnings,
    pendingEarnings,
    completedBookingsCount,
  } = useApp();

  const activeServices = services.filter((s) => s.isActive).length;
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", minimumFractionDigits: 0 }).format(amount);

  // Sarah's bookings (scenario-driven)
  const sarahBookings = [
    { id: 'sb-1', service: 'מועדון צהריים חברתי', client: 'שרה כהן', date: 'יום שלישי', time: '12:00', status: 'confirmed' as const, units: 1 },
    { id: 'sb-2', service: 'סדנת ציור ויצירה', client: 'שרה כהן', date: 'יום ראשון', time: '10:00', status: 'pending' as const, units: 1 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1200px] mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-xl font-bold text-gray-900">{vendor.name}</h1>
            <div className="flex items-center gap-1 text-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-medium">{vendor.rating}</span>
            </div>
            {vendor.isVerified && (
              <Badge className="bg-green-100 text-green-700 text-xs">✓ מאומת</Badge>
            )}
          </div>
          <p className="text-gray-500 text-sm flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {vendor.serviceAreas.join(', ')}
          </p>
        </div>
        <div className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg">
          {new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'הכנסות', value: formatCurrency(totalEarnings), icon: CreditCard, color: 'text-green-600 bg-green-50', sub: 'סה"כ' },
          { label: 'צפוי', value: formatCurrency(pendingEarnings), icon: Clock, color: 'text-amber-600 bg-amber-50', sub: 'ממתין לתשלום' },
          { label: 'שירותים', value: `${activeServices}`, icon: Package, color: 'text-blue-600 bg-blue-50', sub: 'פעילים' },
          { label: 'הושלמו', value: `${completedBookingsCount}`, icon: CheckCircle2, color: 'text-purple-600 bg-purple-50', sub: 'שירותים' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <span className="text-xs text-gray-500">{stat.label}</span>
            </div>
            <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT: Bookings (3 cols) */}
        <div className="lg:col-span-3 space-y-6">

          {/* New bookings from LIBI */}
          <div className="bg-white rounded-xl border border-blue-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                הזמנות חדשות מ-LIBI
              </h2>
              <Badge className="bg-blue-50 text-blue-700 text-xs">{sarahBookings.length} חדשות</Badge>
            </div>
            <div className="space-y-3">
              {sarahBookings.map((booking) => (
                <div key={booking.id} className={`p-4 rounded-lg border ${
                  booking.status === 'pending' ? 'bg-amber-50/50 border-amber-100' : 'bg-green-50/50 border-green-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{booking.service}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{booking.client}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{booking.date}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{booking.time}</span>
                      </div>
                    </div>
                    <div className="text-left">
                      <Badge className={booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}>
                        {booking.status === 'pending' ? 'ממתין לאישור' : '✓ מאושר'}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-1">{booking.units} יחידות</p>
                    </div>
                  </div>
                  {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-amber-100">
                      <Button size="sm" className="flex-1 h-8 text-xs">אשר הזמנה</Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs text-red-600 border-red-200">דחה</Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Existing bookings */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">הזמנות קרובות</h2>
              <Link to="/bookings" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                כל ההזמנות <ArrowLeftCircle className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {confirmedBookings.length === 0 && pendingBookings.length === 0 ? (
                <p className="text-gray-400 text-center py-6 text-sm">אין הזמנות קרובות</p>
              ) : (
                [...pendingBookings, ...confirmedBookings].slice(0, 5).map((booking) => {
                  const date = new Date(booking.scheduledDate);
                  return (
                    <div key={booking.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-900">{date.getDate()}</span>
                        <span className="text-[10px] text-gray-400">{date.toLocaleDateString("he-IL", { month: "short" })}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{booking.serviceName}</p>
                        <p className="text-xs text-gray-400">{date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <Badge className={`text-xs ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {booking.status === 'pending' ? 'ממתין' : booking.status === 'confirmed' ? 'מאושר' : 'הושלם'}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Services + Earnings (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Earnings */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">הכנסות</h2>
            <div className="text-center mb-4">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(totalEarnings)}</p>
              <p className="text-xs text-gray-400 mt-1">מתוך {completedBookingsCount} שירותים</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">עמלת פלטפורמה (7%)</span>
                <span className="text-gray-700">{formatCurrency(totalEarnings * 0.07)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-medium text-gray-900">נטו</span>
                <span className="font-bold text-green-600">{formatCurrency(totalEarnings * 0.93)}</span>
              </div>
            </div>
            <Link to="/payments">
              <button className="w-full mt-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-100">
                פרטי תשלומים
              </button>
            </Link>
          </div>

          {/* My Services */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">השירותים שלי</h2>
              <Link to="/services" className="text-xs text-blue-600 hover:underline">ניהול →</Link>
            </div>
            <div className="space-y-2">
              {services.slice(0, 5).map((service, i) => (
                <div key={service.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{service.title}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">{service.unitCost} יח׳</p>
                  </div>
                  <Badge className={service.isActive ? 'bg-green-50 text-green-700 text-[10px]' : 'bg-gray-100 text-gray-500 text-[10px]'}>
                    {service.isActive ? 'פעיל' : 'מוסתר'}
                  </Badge>
                </div>
              ))}
            </div>
            <Link to="/services/new">
              <button className="w-full mt-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                + שירות חדש
              </button>
            </Link>
          </div>

          {/* Contact info */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
            <p className="text-xs text-gray-500 mb-2">פרטי קשר</p>
            <div className="space-y-1.5 text-sm">
              {vendor.contactName && <p className="text-gray-700 flex items-center gap-2"><User className="w-3.5 h-3.5 text-gray-400" />{vendor.contactName}</p>}
              {vendor.phone && <p className="text-gray-700 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gray-400" />{vendor.phone}</p>}
              {vendor.email && <p className="text-gray-700 flex items-center gap-2 text-xs">{vendor.email}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
