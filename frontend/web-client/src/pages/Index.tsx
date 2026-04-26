import { cn } from '@libi/shared-ui';
import { KPIClosingScreen } from '@libi/shared-ui/components/KPIClosingScreen';
import { SCENARIO_DAYS } from '@libi/shared-ui/data/scenario';
import {
  ChevronLeft,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { ServiceCard } from '../components/ServiceCard';
import { useApp } from '../contexts/AppContext';

export default function Index() {
  const { currentClient, recommendations, bookings, currentDay, changelog } = useApp();
  const navigate = useNavigate();
  const [aiLoading, setAiLoading] = useState(false);
  const [showKPI, setShowKPI] = useState(false);
  const [prevDay, setPrevDay] = useState(currentDay);

  const visible = recommendations.filter(s => !s.filteredOut);
  const dayInfo = SCENARIO_DAYS.find(d => d.day === currentDay);

  // AI loading animation on day change
  useEffect(() => {
    if (currentDay !== prevDay) {
      setAiLoading(true);
      const timer = setTimeout(() => {
        setAiLoading(false);
        setPrevDay(currentDay);
        // Auto-show KPI screen on Day 14
        if (currentDay === 14) {
          setTimeout(() => setShowKPI(true), 600);
        }
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentDay, prevDay]);

  // Completed bookings count
  const completedCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  return (
    <div className="page-container bg-gradient-to-b from-primary/5 via-background to-background">
      <Header />

      {/* AI Loading Overlay */}
      {aiLoading && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Heebo', sans-serif", direction: 'rtl',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, animation: 'pulse 1s ease infinite',
          }}>
            <Sparkles style={{ width: 32, height: 32, color: '#fff' }} />
          </div>
          <p style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700 }}>
            LIBI מעבדת נתונים...
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', marginTop: 4 }}>
            {currentDay === 3 && 'מחשבת סבסוד ומאשרת הזמנה'}
            {currentDay === 7 && 'מעדכנת ציון בדידות ומייצרת מעקב'}
            {currentDay === 14 && 'מחשבת תוצאות פיילוט'}
            {currentDay === 1 && 'מנתחת פרופיל ומייצרת המלצות'}
          </p>
          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes pulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.08) } }
          `}</style>
        </div>
      )}

      {/* KPI Closing Screen */}
      {showKPI && <KPIClosingScreen onClose={() => setShowKPI(false)} />}

      <main className="content-padding pt-4 pb-28 space-y-5">
        {/* Hero card — narrative-driven */}
        <div
          className="rounded-2xl p-5 text-white"
          dir="rtl"
          style={{
            background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8c 50%, #1B3A5C 100%)',
            animation: 'fadeIn 0.5s ease',
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/50 text-xs font-medium tracking-wide">{dayInfo?.label}</p>
              <p className="text-xl font-bold mt-1">שלום, {currentClient.name.split(' ')[0]} 👋</p>
              {currentClient.levProfile && (
                <p className="text-white/60 text-sm mt-1">
                  {currentClient.age} · {currentClient.city} · רמת סיעוד {currentClient.nursingLevel}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                <Wallet className="w-4 h-4" />
                <div className="text-left">
                  <p className="text-[10px] text-white/50">ארנק</p>
                  <p className="font-bold text-sm">{currentClient.walletBalance}/{currentClient.walletTotal}</p>
                </div>
              </div>
              {currentClient.levProfile?.riskFlags && currentClient.levProfile.riskFlags.length > 0 && (
                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md">
                  ⚠️ {currentClient.levProfile.riskFlags.includes('loneliness') ? 'בדידות' : currentClient.levProfile.riskFlags[0]}
                </span>
              )}
              {currentDay >= 7 && currentClient.levProfile?.riskFlags?.length === 0 && (
                <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-0.5 rounded-md">
                  ✅ ללא דגלי סיכון
                </span>
              )}
            </div>
          </div>

          {/* Changelog — what just happened */}
          {changelog.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white/10">
              {changelog.slice(0, 3).map((item, i) => (
                <p key={i} className="text-xs text-white/70 mb-0.5 leading-relaxed">
                  <span className="text-white/40 mr-1">•</span> {item}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Active bookings with status signals */}
        {bookings.length > 0 && (
          <section style={{ animation: 'slideUp 0.4s ease' }}>
            <h2 className="text-base font-bold mb-2 flex items-center gap-2">
              📅 ההזמנות שלך
              <span className="text-xs font-normal text-muted-foreground">({bookings.length})</span>
            </h2>
            <div className="space-y-2">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className={cn(
                    "bg-card rounded-xl p-3 border flex items-center justify-between transition-all",
                    b.status === 'confirmed' ? 'border-green-200 bg-green-50/30' :
                    b.status === 'pending' ? 'border-amber-200 bg-amber-50/30' :
                    'border-border'
                  )}
                >
                  <div>
                    <p className="font-medium text-sm">{b.serviceName}</p>
                    <p className="text-xs text-muted-foreground">{b.date} · {b.price === 0 ? 'חינם ✨' : `₪${b.price}`}</p>
                  </div>
                  <span className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold",
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  )}>
                    {b.status === 'confirmed' ? '✅ מאושר' : b.status === 'pending' ? '⏳ ממתין' : b.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Personalized Recommendations */}
        <section style={{ animation: 'slideUp 0.5s ease 0.1s both' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold">נבחר במיוחד עבורך</h2>
              <span className="text-xs text-muted-foreground">({visible.length} שירותים)</span>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-1 text-primary font-medium hover:underline text-xs"
            >
              הכל
              <ChevronLeft className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visible.slice(0, 8).map((service, i) => (
              <div key={service.id} style={{ animation: `slideUp 0.4s ease ${0.15 + i * 0.06}s both` }}>
                <ServiceCard service={service} />
              </div>
            ))}
          </div>
        </section>

        {/* Day 14: Show KPI button */}
        {currentDay === 14 && (
          <section style={{ animation: 'slideUp 0.5s ease 0.3s both' }}>
            <button
              onClick={() => setShowKPI(true)}
              className="w-full py-4 rounded-2xl text-white font-bold text-base"
              style={{
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                boxShadow: '0 4px 14px rgba(22,163,74,0.3)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              📊 צפייה בתוצאות הפיילוט
            </button>
          </section>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  );
}
