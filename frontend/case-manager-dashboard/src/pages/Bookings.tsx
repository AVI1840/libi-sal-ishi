import { Avatar, AvatarFallback } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@libi/shared-ui/components/ui/tabs";
import { AlertCircle, Calendar, CheckCircle2, Clock, Filter, Search, XCircle } from "lucide-react";
import { useState } from "react";
import { useApp } from "../contexts/AppContext";

export default function Bookings() {
  const { bookings, clients, updateBookingStatus } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredBookings = bookings.filter((booking) => {
    const client = clients.find((c) => c.id === booking.clientId);
    const matchesSearch =
      booking.serviceName.includes(searchQuery) ||
      client?.name.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingBookings = filteredBookings.filter((b) => b.status === "pending");
  const confirmedBookings = filteredBookings.filter((b) => b.status === "confirmed");
  const completedBookings = filteredBookings.filter((b) => b.status === "completed");
  const cancelledBookings = filteredBookings.filter((b) => b.status === "cancelled");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="w-3 h-3" />הושלם</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700 gap-1"><Clock className="w-3 h-3" />מאושר</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 gap-1"><AlertCircle className="w-3 h-3" />ממתין</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 gap-1"><XCircle className="w-3 h-3" />בוטל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const BookingCard = ({ booking }: { booking: typeof bookings[0] }) => {
    const client = clients.find((c) => c.id === booking.clientId);
    const date = new Date(booking.scheduledDate);

    return (
      <div className="dashboard-card hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center border border-primary/10">
            <span className="text-xl font-bold text-primary">{date.getDate()}</span>
            <span className="text-xs text-primary/70">
              {date.toLocaleDateString("he-IL", { month: "short" })}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900">{booking.serviceName}</h3>
              {getStatusBadge(booking.status)}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                  {client?.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-gray-600">{client?.name}</span>
            </div>

            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{booking.unitsCost} יחידות</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions for pending bookings */}
        {booking.status === "pending" && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              size="sm"
              onClick={() => updateBookingStatus(booking.id, "confirmed")}
              className="flex-1"
            >
              אשר הזמנה
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateBookingStatus(booking.id, "cancelled")}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              בטל
            </Button>
          </div>
        )}

        {/* Actions for confirmed bookings */}
        {booking.status === "confirmed" && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              size="sm"
              onClick={() => updateBookingStatus(booking.id, "completed")}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              סמן כהושלם
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateBookingStatus(booking.id, "cancelled")}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              בטל
            </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">הזמנות</h1>
          <p className="text-gray-500 mt-1">{bookings.length} הזמנות סה"כ</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="חיפוש לפי שם שירות או מטופל..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתין לאישור</option>
            <option value="confirmed">מאושר</option>
            <option value="completed">הושלם</option>
            <option value="cancelled">בוטל</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">
            הכל ({filteredBookings.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-1">
            ממתינים
            {pendingBookings.length > 0 && (
              <Badge variant="destructive" className="h-5 min-w-5 px-1.5">
                {pendingBookings.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="confirmed">
            מאושרים ({confirmedBookings.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            הושלמו ({completedBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings
              .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
              .map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
          {pendingBookings.length === 0 && (
            <p className="text-gray-500 text-center py-12">אין הזמנות ממתינות לאישור</p>
          )}
        </TabsContent>

        <TabsContent value="confirmed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {confirmedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
          {confirmedBookings.length === 0 && (
            <p className="text-gray-500 text-center py-12">אין הזמנות מאושרות</p>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
          {completedBookings.length === 0 && (
            <p className="text-gray-500 text-center py-12">אין הזמנות שהושלמו</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
