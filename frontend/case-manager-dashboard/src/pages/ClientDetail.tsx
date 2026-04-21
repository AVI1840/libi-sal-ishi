import { Avatar, AvatarFallback } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Progress } from "@libi/shared-ui/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@libi/shared-ui/components/ui/tabs";
import {
    Activity,
    ArrowRight,
    Brain,
    Calendar,
    Clock,
    Ear,
    Eye,
    Heart,
    MapPin,
    Phone,
    Plus,
    Users,
    Wallet,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../contexts/AppContext";

export default function ClientDetail() {
  const { clientId } = useParams();
  const { clients, bookings } = useApp();

  const client = clients.find((c) => c.id === clientId);
  const clientBookings = bookings.filter((b) => b.clientId === clientId);

  if (!client) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">מטופל לא נמצא</p>
        <Link to="/clients" className="text-primary hover:underline mt-2 inline-block">
          חזרה לרשימת מטופלים
        </Link>
      </div>
    );
  }

  const profile = client.functionalProfile;

  // Helper to convert FunctionalLevel to numeric value
  const levelToNumber = (level: string): number => {
    switch (level) {
      case 'independent': return 5;
      case 'partial': return 3;
      case 'significant': return 1;
      default: return 3;
    }
  };

  const profileItems = [
    { label: "ניידות", value: levelToNumber(profile.mobility), icon: Activity, color: "blue" },
    { label: "קוגניציה", value: profile.cognitive, icon: Brain, color: "purple" },
    { label: "רגשי", value: levelToNumber(profile.emotional), icon: Heart, color: "red" },
    { label: "חברתי", value: profile.social, icon: Users, color: "green" },
    { label: "ראייה", value: profile.vision, icon: Eye, color: "amber" },
    { label: "שמיעה", value: profile.hearing, icon: Ear, color: "cyan" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">הושלם</Badge>;
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-700">מאושר</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700">ממתין</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700">בוטל</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/clients"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          <p className="text-gray-500">פרופיל מטופל</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          הזמנה חדשה
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="dashboard-card">
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {client.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{client.name}</h2>
              <Badge className="mt-1 bg-primary/10 text-primary">
                רמת סיעוד {client.nursingLevel}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>גיל {client.age}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>{client.city}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-5 h-5 text-gray-400" />
              <span dir="ltr">{client.phone}</span>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">איש קשר לחירום</h3>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                  {client.emergencyContact.name.split(" ").map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {client.emergencyContact.name}
                </p>
                <p className="text-xs text-gray-500">{client.emergencyContact.relation}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">פרופיל תפקודי</TabsTrigger>
              <TabsTrigger value="wallet">ארנק</TabsTrigger>
              <TabsTrigger value="bookings">הזמנות</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="dashboard-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">מדדים תפקודיים</h3>
              <div className="grid grid-cols-2 gap-4">
                {profileItems.map((item) => (
                  <div key={item.label} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className={`w-5 h-5 text-${item.color}-500`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={(item.value / 5) * 100} className="flex-1 h-2" />
                      <span className="text-sm font-semibold text-gray-900">{item.value}/5</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Conditions */}
              {client.conditions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">מצבים רפואיים</h4>
                  <div className="flex flex-wrap gap-2">
                    {client.conditions.map((condition) => (
                      <Badge key={condition} variant="outline" className="text-gray-600">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferences */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-2">העדפות</h4>
                <div className="flex flex-wrap gap-2">
                  {client.preferences.map((pref) => (
                    <Badge key={pref} className="bg-primary/10 text-primary">
                      {pref}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wallet" className="dashboard-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Wallet className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900">{client.walletBalance}</p>
                  <p className="text-gray-500">יחידות זמינות מתוך {client.totalUnits}</p>
                </div>
              </div>

              <Progress
                value={(client.walletBalance / client.totalUnits) * 100}
                className="h-3 mb-6"
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">סך הכל יחידות</p>
                  <p className="text-xl font-bold text-gray-900">{client.totalUnits}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">נוצלו</p>
                  <p className="text-xl font-bold text-gray-900">
                    {client.totalUnits - client.walletBalance}
                  </p>
                </div>
              </div>

              {/* Optimal Aging Units */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">יחידות הזדקנות מיטבית</span>
                </div>
                <p className="text-2xl font-bold text-green-700">2</p>
                <p className="text-sm text-green-600">יחידות חובה לפעילות רווחה</p>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="dashboard-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">היסטוריית הזמנות</h3>
                <span className="text-sm text-gray-500">{clientBookings.length} הזמנות</span>
              </div>

              <div className="space-y-3">
                {clientBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">אין הזמנות</p>
                ) : (
                  clientBookings
                    .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold text-gray-900">
                            {new Date(booking.scheduledDate).getDate()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(booking.scheduledDate).toLocaleDateString("he-IL", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{booking.serviceName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {new Date(booking.scheduledDate).toLocaleTimeString("he-IL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          {getStatusBadge(booking.status)}
                          <p className="text-sm text-gray-500 mt-1">{booking.unitsCost} יחידות</p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
