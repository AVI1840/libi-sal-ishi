import { cn } from '@libi/shared-ui';
import { Bell, Phone, ShoppingBag, User, Users, Wallet } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

const navItems = [
  { icon: ShoppingBag, label: 'שירותים', path: '/marketplace' },
  { icon: User, label: 'פרופיל', path: '/profile' },
  { icon: Phone, label: 'מתאמת', path: '/contact' },
  { icon: Users, label: 'קהילה', path: '/community' },
];

export function Header({ title, showBack }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentClient } = useApp();

  const balance = currentClient.walletBalance;
  const total = currentClient.walletTotal;
  // Convert units to NIS for display (1 unit ≈ 120 NIS)
  const balanceNIS = balance * 120;

  return (
    <header className="sticky top-0 z-30 bg-[#1B3A5C] text-white shadow-lg">
      {/* Main Row */}
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2.5">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <span className="text-base">→</span>
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <span className="font-bold text-xs">לב</span>
            </div>
            <span className="text-base font-semibold">
              {title || `שלום, ${currentClient.name.split(' ')[0]}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Wallet — shows NIS */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span className="text-sm font-semibold">₪{balanceNIS.toLocaleString()}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate('/chat')}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] font-bold flex items-center justify-center">2</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center justify-around h-11 bg-[#15304d] border-t border-white/5 px-2">
        {navItems.map((item) => {
          const isActive = location?.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium",
                isActive
                  ? "text-white bg-white/15"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
