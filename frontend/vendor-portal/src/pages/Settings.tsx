import { Bell, Building2, Globe, Lock, Mail, MapPin, Phone, Save, Shield, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "../lib/utils";
import { VendorLayout } from "../components/VendorLayout";
import { useApp } from "../contexts/AppContext";

const inputCls = "w-full h-10 px-3 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors";
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    {children}
  </div>
);

const SECTIONS = [
  { id: "business",       icon: Building2, label: "פרטי עסק" },
  { id: "notifications",  icon: Bell,      label: "התראות" },
  { id: "security",       icon: Shield,    label: "אבטחה" },
] as const;

type Section = typeof SECTIONS[number]["id"];

export default function Settings() {
  const { vendor } = useApp();
  const [section, setSection] = useState<Section>("business");

  const [business, setBusiness] = useState({
    name:         vendor.name,
    contactName:  vendor.contactName || "ישראל ישראלי",
    email:        vendor.email       || "info@vendor.co.il",
    phone:        vendor.phone       || "03-1234567",
    licenseNumber: vendor.licenseNumber || "12345",
    description:  "ספק שירותי סיעוד ורווחה איכותיים",
  });

  const [notifs, setNotifs] = useState({
    newBookings:          true,
    bookingReminders:     true,
    paymentNotifications: true,
    weeklyReport:         false,
  });

  return (
    <VendorLayout title="הגדרות" subtitle="ניהול פרטי העסק וההעדפות">
      <div className="flex gap-6 max-w-5xl">

        {/* Sidebar nav */}
        <nav className="w-48 shrink-0 space-y-1">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-right",
                  section === s.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {s.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {section === "business" && (
            <div className="space-y-5">
              <div className="libi-card p-6">
                <h3 className="text-base font-semibold text-foreground mb-5">פרטי העסק</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="שם העסק">
                    <input value={business.name} onChange={(e) => setBusiness({ ...business, name: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="מספר רישיון">
                    <input value={business.licenseNumber} onChange={(e) => setBusiness({ ...business, licenseNumber: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="איש קשר">
                    <input value={business.contactName} onChange={(e) => setBusiness({ ...business, contactName: e.target.value })} className={inputCls} />
                  </Field>
                  <Field label="טלפון">
                    <input value={business.phone} onChange={(e) => setBusiness({ ...business, phone: e.target.value })} className={inputCls} dir="ltr" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="אימייל">
                      <input type="email" value={business.email} onChange={(e) => setBusiness({ ...business, email: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                  <div className="md:col-span-2">
                    <Field label="תיאור העסק">
                      <textarea
                        value={business.description}
                        onChange={(e) => setBusiness({ ...business, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2.5 rounded-lg border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 resize-none transition-colors"
                      />
                    </Field>
                  </div>
                </div>
                <div className="flex justify-end mt-5">
                  <button onClick={() => toast.success("פרטי העסק נשמרו")} className="flex items-center gap-2 px-5 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
                    <Save className="w-4 h-4" /> שמור שינויים
                  </button>
                </div>
              </div>

              {/* Service areas + verification */}
              <div className="grid grid-cols-2 gap-5">
                <div className="libi-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">אזורי שירות</h4>
                  <div className="flex flex-wrap gap-2">
                    {vendor.serviceAreas.map((a) => (
                      <span key={a} className="libi-chip bg-primary-soft text-primary">
                        <MapPin className="w-3 h-3" />{a}
                      </span>
                    ))}
                  </div>
                  <button className="w-full mt-4 py-2 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    עדכון אזורים
                  </button>
                </div>
                <div className="libi-card p-5">
                  <h4 className="text-sm font-semibold text-foreground mb-3">סטטוס אימות</h4>
                  {vendor.isVerified ? (
                    <span className="libi-chip bg-success-soft text-success"><Shield className="w-3.5 h-3.5" />מאומת</span>
                  ) : (
                    <span className="libi-chip bg-warning-soft text-warning-foreground">ממתין לאימות</span>
                  )}
                  <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /><span dir="ltr">{business.phone}</span></div>
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{business.email}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === "notifications" && (
            <div className="libi-card p-6">
              <h3 className="text-base font-semibold text-foreground mb-5">הגדרות התראות</h3>
              <div className="space-y-3">
                {[
                  { key: "newBookings",          label: "הזמנות חדשות",    desc: "קבל התראה כשמתקבלת הזמנה חדשה" },
                  { key: "bookingReminders",     label: "תזכורות הזמנות",  desc: "קבל תזכורת לפני שירות מתוכנן" },
                  { key: "paymentNotifications", label: "עדכוני תשלומים",  desc: "קבל התראה כשמתקבל תשלום" },
                  { key: "weeklyReport",         label: "דוח שבועי",       desc: "קבל סיכום שבועי של הפעילות" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors">
                    <div>
                      <div className="font-medium text-foreground text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifs[item.key as keyof typeof notifs]}
                      onChange={(e) => setNotifs({ ...notifs, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-primary"
                    />
                  </label>
                ))}
              </div>
              <div className="flex justify-end mt-5">
                <button onClick={() => toast.success("הגדרות ההתראות נשמרו")} className="flex items-center gap-2 px-5 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
                  <Save className="w-4 h-4" /> שמור
                </button>
              </div>
            </div>
          )}

          {section === "security" && (
            <div className="libi-card p-6 space-y-5">
              <h3 className="text-base font-semibold text-foreground">אבטחה</h3>
              {["סיסמה נוכחית", "סיסמה חדשה", "אימות סיסמה חדשה"].map((label) => (
                <Field key={label} label={label}>
                  <input type="password" placeholder="••••••••" className={inputCls} />
                </Field>
              ))}
              <div className="flex justify-end">
                <button onClick={() => toast.success("הסיסמה עודכנה")} className="flex items-center gap-2 px-5 h-9 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-glow transition-colors">
                  <Shield className="w-4 h-4" /> עדכון סיסמה
                </button>
              </div>
              <div className="pt-5 border-t border-border">
                <h4 className="text-sm font-semibold text-foreground mb-3">אימות דו-שלבי</h4>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/40">
                  <div>
                    <div className="font-medium text-foreground text-sm">אימות דו-שלבי (2FA)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">הוסף שכבת אבטחה נוספת לחשבון</div>
                  </div>
                  <button className="px-4 h-8 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
                    הפעל
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </VendorLayout>
  );
}
