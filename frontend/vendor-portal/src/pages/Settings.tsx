import { Avatar, AvatarFallback, AvatarImage } from "@libi/shared-ui/components/ui/avatar";
import { Badge } from "@libi/shared-ui/components/ui/badge";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@libi/shared-ui/components/ui/tabs";
import { Bell, Building2, Mail, MapPin, Phone, Save, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useApp } from "../contexts/AppContext";

export default function Settings() {
  const { vendor } = useApp();

  const [business, setBusiness] = useState({
    name: vendor.name,
    contactName: vendor.contactName || "ישראל ישראלי",
    email: vendor.email || "info@vendor.co.il",
    phone: vendor.phone || "03-1234567",
    licenseNumber: vendor.licenseNumber || "12345",
    description: "ספק שירותי סיעוד ורווחה איכותיים",
  });

  const [notifications, setNotifications] = useState({
    newBookings: true,
    bookingReminders: true,
    paymentNotifications: true,
    weeklyReport: false,
  });

  const handleSaveBusiness = () => {
    toast.success("פרטי העסק נשמרו בהצלחה");
  };

  const handleSaveNotifications = () => {
    toast.success("הגדרות ההתראות נשמרו");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>
        <p className="text-gray-500 mt-1">נהל את פרטי העסק וההעדפות</p>
      </div>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="w-4 h-4" />
            פרטי עסק
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            התראות
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            אבטחה
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            פרופיל אישי
          </TabsTrigger>
        </TabsList>

        {/* Business Tab */}
        <TabsContent value="business">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 vendor-card">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">פרטי העסק</h3>

              <div className="flex items-center gap-6 mb-8">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={vendor.logo} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {vendor.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm">העלאת לוגו</Button>
                  <p className="text-xs text-gray-500 mt-2">JPG, PNG עד 5MB</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    שם העסק *
                  </label>
                  <Input
                    value={business.name}
                    onChange={(e) => setBusiness({ ...business, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    מספר רישיון
                  </label>
                  <Input
                    value={business.licenseNumber}
                    onChange={(e) => setBusiness({ ...business, licenseNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    איש קשר
                  </label>
                  <Input
                    value={business.contactName}
                    onChange={(e) => setBusiness({ ...business, contactName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    טלפון
                  </label>
                  <Input
                    value={business.phone}
                    onChange={(e) => setBusiness({ ...business, phone: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    אימייל
                  </label>
                  <Input
                    type="email"
                    value={business.email}
                    onChange={(e) => setBusiness({ ...business, email: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    תיאור העסק
                  </label>
                  <textarea
                    value={business.description}
                    onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveBusiness} className="gap-2">
                  <Save className="w-4 h-4" />
                  שמור שינויים
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Service Areas */}
              <div className="vendor-card">
                <h4 className="font-medium text-gray-900 mb-3">אזורי שירות</h4>
                <div className="flex flex-wrap gap-2">
                  {vendor.serviceAreas.map((area) => (
                    <Badge key={area} variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {area}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  עדכון אזורים
                </Button>
              </div>

              {/* Contact Info */}
              <div className="vendor-card">
                <h4 className="font-medium text-gray-900 mb-3">פרטי יצירת קשר</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span dir="ltr">{business.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{business.email}</span>
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="vendor-card">
                <h4 className="font-medium text-gray-900 mb-3">סטטוס אימות</h4>
                <div className="flex items-center gap-2">
                  {vendor.isVerified ? (
                    <Badge className="bg-green-100 text-green-700 gap-1">
                      <Shield className="w-3 h-3" />
                      מאומת
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 gap-1">
                      ממתין לאימות
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="vendor-card max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">הגדרות התראות</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">הזמנות חדשות</p>
                  <p className="text-sm text-gray-500">קבל התראה כשמתקבלת הזמנה חדשה</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.newBookings}
                  onChange={(e) =>
                    setNotifications({ ...notifications, newBookings: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">תזכורות הזמנות</p>
                  <p className="text-sm text-gray-500">קבל תזכורת לפני שירות מתוכנן</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.bookingReminders}
                  onChange={(e) =>
                    setNotifications({ ...notifications, bookingReminders: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">עדכוני תשלומים</p>
                  <p className="text-sm text-gray-500">קבל התראה כשמתקבל תשלום</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.paymentNotifications}
                  onChange={(e) =>
                    setNotifications({ ...notifications, paymentNotifications: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">דוח שבועי</p>
                  <p className="text-sm text-gray-500">קבל סיכום שבועי של הפעילות</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.weeklyReport}
                  onChange={(e) =>
                    setNotifications({ ...notifications, weeklyReport: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSaveNotifications} className="gap-2">
                <Save className="w-4 h-4" />
                שמור שינויים
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="vendor-card max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">אבטחה</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמה נוכחית
                </label>
                <Input type="password" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  סיסמה חדשה
                </label>
                <Input type="password" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימות סיסמה חדשה
                </label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button className="gap-2">
                <Shield className="w-4 h-4" />
                עדכון סיסמה
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-4">אימות דו-שלבי</h4>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">אימות דו-שלבי (2FA)</p>
                  <p className="text-sm text-gray-500">הוסף שכבת אבטחה נוספת לחשבון</p>
                </div>
                <Button variant="outline">הפעל</Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="vendor-card max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">פרופיל אישי</h3>

            <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  יי
                </AvatarFallback>
              </Avatar>
              <div>
                <Button variant="outline" size="sm">העלאת תמונה</Button>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG עד 5MB</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם פרטי
                </label>
                <Input defaultValue="ישראל" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  שם משפחה
                </label>
                <Input defaultValue="ישראלי" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל
                </label>
                <Input type="email" defaultValue="israel@vendor.co.il" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <Input defaultValue="054-1234567" dir="ltr" />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button className="gap-2">
                <Save className="w-4 h-4" />
                שמור שינויים
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
