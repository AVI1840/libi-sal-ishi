import { Avatar, AvatarFallback, AvatarImage } from "@libi/shared-ui/components/ui/avatar";
import { Button } from "@libi/shared-ui/components/ui/button";
import { Input } from "@libi/shared-ui/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@libi/shared-ui/components/ui/tabs";
import { Bell, Globe, Palette, Save, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Settings() {
  const [profile, setProfile] = useState({
    name: "שרית מזרחי",
    email: "sarit.mizrachi@lev.co.il",
    phone: "054-1234567",
    role: "מתאמת טיפול",
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    dailySummary: true,
    weeklyReport: false,
  });

  const handleSaveProfile = () => {
    toast.success("הפרופיל נשמר בהצלחה");
  };

  const handleSaveNotifications = () => {
    toast.success("הגדרות ההתראות נשמרו");
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">הגדרות</h1>
        <p className="text-gray-500 mt-1">נהל את הפרופיל וההעדפות שלך</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            פרופיל
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            התראות
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            אבטחה
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            תצוגה
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="dashboard-card max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">פרטי פרופיל</h3>

            <div className="flex items-center gap-6 mb-8">
              <Avatar className="h-20 w-20">
                <AvatarImage src="/avatar-coordinator.jpg" />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  שמ
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
                  שם מלא
                </label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  תפקיד
                </label>
                <Input
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  אימייל
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  טלפון
                </label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  dir="ltr"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={handleSaveProfile} className="gap-2">
                <Save className="w-4 h-4" />
                שמור שינויים
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="dashboard-card max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">הגדרות התראות</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">התראות אימייל</p>
                  <p className="text-sm text-gray-500">קבל התראות על אירועים חשובים במייל</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.emailAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, emailAlerts: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">התראות SMS</p>
                  <p className="text-sm text-gray-500">קבל התראות דחופות ב-SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.smsAlerts}
                  onChange={(e) =>
                    setNotifications({ ...notifications, smsAlerts: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">התראות Push</p>
                  <p className="text-sm text-gray-500">קבל התראות בזמן אמת בדפדפן</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.pushNotifications}
                  onChange={(e) =>
                    setNotifications({ ...notifications, pushNotifications: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">סיכום יומי</p>
                  <p className="text-sm text-gray-500">קבל סיכום יומי של הפעילות</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.dailySummary}
                  onChange={(e) =>
                    setNotifications({ ...notifications, dailySummary: e.target.checked })
                  }
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">דוח שבועי</p>
                  <p className="text-sm text-gray-500">קבל דוח שבועי מסכם</p>
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
          <div className="dashboard-card max-w-2xl">
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

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="dashboard-card max-w-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">תצוגה</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  ערכת נושא
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button className="p-4 border-2 border-primary rounded-lg bg-white text-center">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 mx-auto mb-2" />
                    <span className="text-sm font-medium">בהיר</span>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg bg-white text-center hover:border-gray-300">
                    <div className="w-8 h-8 rounded-full bg-gray-900 mx-auto mb-2" />
                    <span className="text-sm font-medium">כהה</span>
                  </button>
                  <button className="p-4 border border-gray-200 rounded-lg bg-white text-center hover:border-gray-300">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-b from-white to-gray-900 mx-auto mb-2" />
                    <span className="text-sm font-medium">אוטומטי</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  שפה
                </label>
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-400" />
                  <select className="flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-white">
                    <option value="he">עברית</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
