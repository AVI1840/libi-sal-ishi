import { cn } from '@libi/shared-ui';
import { Bell, Calendar, Clock, MapPin, Phone, ShoppingBag, User, Users, Wallet, X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

type PopupType = 'none' | 'wallet' | 'schedule' | 'notifications';

const navItems = [
  { icon: ShoppingBag, label: 'סל השירותים', path: '/marketplace' },
  { icon: User, label: 'פרופיל', path: '/profile' },
  { icon: Phone, label: 'מתאמת שירות', path: '/contact' },
  { icon: Users, label: 'קהילה', path: '/community' },
];

// Mock today's schedule
const TODAY_SCHEDULE = [
  { time: '10:00', title: 'התעמלות בוקר', location: 'פארק הירקון' },
  { time: '16:00', title: 'מפגש קהילתי', location: 'מתנ"ס' },
];

// Mock notifications
const NOTIFICATIONS = [
  { id: 1, type: 'reminder', title: 'תזכורת: התעמלות בוקר', body: 'מחר ב-10:00 בפארק הירקון', time: 'לפני שעה', read: false },
  { id: 2, type: 'booking', title: 'ההזמנה אושרה', body: 'פיזיותרפיה עם דנה - יום ראשון 14:00', time: 'לפני 3 שעות', read: false },
  { id: 3, type: 'info', title: 'שירות חדש זמין', body: 'חוג ציור למתחילים נפתח באזורך', time: 'אתמול', read: true },
];

export function Header({ title, showBack }: HeaderProps) {
  const navigate = useNavigate();
  const { currentClient } = useApp();
  const [activePopup, setActivePopup] = useState<PopupType>('none');

  const usagePercent = Math.round((currentClient.walletUsed / currentClient.walletTotal) * 100);
  const unreadCount = NOTIFICATIONS.filter(n => !n.read).length;

  const togglePopup = (popup: PopupType) => {
    setActivePopup(activePopup === popup ? 'none' : popup);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0B4DA2] text-white shadow-lg">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left side - Logo & Title */}
          <div className="flex items-center gap-2">
            {showBack && (
              <button
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <span className="text-lg">→</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="font-bold text-sm">לב</span>
              </div>
              <span className="text-lg font-bold">{title || `שלום ${currentClient.name.split(' ')[0]}`}</span>
            </div>
          </div>

          {/* Right side - Schedule, Wallet & Notifications */}
          <div className="flex items-center gap-1.5">
            {/* Schedule Button */}
            <button
              onClick={() => togglePopup('schedule')}
              className={cn(
                "relative flex items-center gap-1 px-2 py-1.5 rounded-lg",
                activePopup === 'schedule' ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
              )}
            >
              <Calendar className="w-4 h-4" />
              {TODAY_SCHEDULE.length > 0 && (
                <span className="text-xs font-semibold">{TODAY_SCHEDULE.length}</span>
              )}
            </button>

            {/* Wallet Button */}
            <button
              onClick={() => togglePopup('wallet')}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1.5 rounded-lg",
                activePopup === 'wallet' ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
              )}
            >
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-semibold">₪{currentClient.walletBalance.toLocaleString()}</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => togglePopup('notifications')}
              className={cn(
                "relative w-9 h-9 rounded-lg flex items-center justify-center",
                activePopup === 'notifications' ? "bg-white/20" : "bg-white/10 hover:bg-white/20"
              )}
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-orange-400 rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="flex items-center justify-around h-12 bg-[#083d82] border-t border-white/10 px-2">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-all"
            >
              <item.icon className="w-4 h-4" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* Popups Backdrop */}
      {activePopup !== 'none' && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          onClick={() => setActivePopup('none')}
        />
      )}

      {/* Schedule Popup */}
      {activePopup === 'schedule' && (
        <div className="fixed top-[120px] left-4 right-4 z-50 bg-card rounded-2xl shadow-elevated p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              היום בלוח השנה
            </h3>
            <button
              onClick={() => setActivePopup('none')}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {TODAY_SCHEDULE.length > 0 ? (
            <div className="space-y-2">
              {TODAY_SCHEDULE.map((apt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {apt.time}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{apt.title}</p>
                    {apt.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {apt.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">אין פעילויות מתוכננות להיום</p>
          )}

          <button
            onClick={() => {
              setActivePopup('none');
              navigate('/calendar');
            }}
            className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
          >
            צפייה בלוח השנה המלא
          </button>
        </div>
      )}

      {/* Wallet Popup */}
      {activePopup === 'wallet' && (
        <div className="fixed top-[120px] left-4 right-4 z-50 bg-card rounded-2xl shadow-elevated p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">הארנק שלי</h3>
            <button
              onClick={() => setActivePopup('none')}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">יתרה זמינה</p>
                <p className="text-2xl font-bold">₪{currentClient.walletBalance.toLocaleString()}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">ניצלת</p>
              <p className="text-xl font-semibold text-primary">{usagePercent}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2.5 bg-muted rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mb-4">
            נוצלו ₪{currentClient.walletUsed.toLocaleString()} מתוך ₪{currentClient.walletTotal.toLocaleString()}
          </p>

          <button
            onClick={() => {
              setActivePopup('none');
              navigate('/wallet');
            }}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90"
          >
            צפייה בפירוט הארנק
          </button>
        </div>
      )}

      {/* Notifications Popup */}
      {activePopup === 'notifications' && (
        <div className="fixed top-[120px] left-4 right-4 z-50 bg-card rounded-2xl shadow-elevated p-4 max-h-[70vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              התראות
            </h3>
            <button
              onClick={() => setActivePopup('none')}
              className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {NOTIFICATIONS.length > 0 ? (
            <div className="space-y-2 overflow-y-auto flex-1">
              {NOTIFICATIONS.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-3 rounded-xl border-r-4",
                    notification.read
                      ? "bg-muted/30 border-muted"
                      : "bg-primary/5 border-primary"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className={cn("font-medium text-sm", !notification.read && "text-primary")}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                    </div>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {notification.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">אין התראות חדשות</p>
          )}

          <button
            onClick={() => setActivePopup('none')}
            className="w-full mt-4 py-3 border border-border text-foreground rounded-xl font-semibold hover:bg-muted/50"
          >
            סמן הכל כנקרא
          </button>
        </div>
      )}
    </>
  );
}
