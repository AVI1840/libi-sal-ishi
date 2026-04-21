import { cn } from '@libi/shared-ui';
import { Home, MessageCircle, ShoppingBag, User, Users } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'בית', path: '/' },
  { icon: ShoppingBag, label: 'שירותים', path: '/marketplace' },
  { icon: User, label: 'פרופיל', path: '/profile' },
  { icon: Users, label: 'קהילה', path: '/community' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const isOnChat = location.pathname === '/chat';

  return (
    <>
      {/* Limor Chat FAB */}
      {!isOnChat && (
        <button
          onClick={() => navigate('/chat')}
          className="fixed bottom-24 left-4 z-50 w-14 h-14 rounded-full bg-[#0B4DA2] text-white shadow-lg flex items-center justify-center hover:bg-[#083d82] active:scale-95 transition-all"
          aria-label="לימור - העוזרת האישית שלך"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border shadow-soft">
        <div className="flex items-center justify-around h-20 max-w-lg mx-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary-light"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className={cn("w-6 h-6", isActive && "scale-110")} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
