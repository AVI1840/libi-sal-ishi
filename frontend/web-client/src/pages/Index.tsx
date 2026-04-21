import { cn, getRecommendations, services } from '@libi/shared-ui';
import {
    Activity,
    ChevronLeft,
    Heart,
    Sparkles,
    TrendingUp,
    Users,
    Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { ServiceCard } from '../components/ServiceCard';
import { useApp } from '../contexts/AppContext';

// Category quick filters
const QUICK_CATEGORIES = [
  { icon: Activity, label: 'פעילות גופנית', category: 'fitness', color: 'text-green-600 bg-green-100' },
  { icon: Users, label: 'פעילות חברתית', category: 'social', color: 'text-blue-600 bg-blue-100' },
  { icon: Heart, label: 'בריאות', category: 'health', color: 'text-red-600 bg-red-100' },
  { icon: Zap, label: 'תרבות', category: 'cultural', color: 'text-purple-600 bg-purple-100' },
];

export default function Index() {
  const { currentClient } = useApp();
  const navigate = useNavigate();

  const recommendations = getRecommendations(currentClient, 6);
  const popular = services
    .sort((a, b) => b.communityCount - a.communityCount)
    .slice(0, 6)
    .map(s => ({ ...s, fitScore: undefined, fitReason: undefined }));

  return (
    <div className="page-container bg-gradient-to-b from-primary/5 via-background to-background">
      <Header />

      <main className="content-padding pt-4 pb-28 space-y-5">
        {/* Quick Category Filters - HERO SECTION */}
        <section className="animate-slide-up" style={{ animationDelay: '0ms' }}>
          <h2 className="text-xl font-bold mb-3">מה בא לך לעשות?</h2>
          <div className="grid grid-cols-4 gap-3">
            {QUICK_CATEGORIES.map((cat) => (
              <button
                key={cat.category}
                onClick={() => navigate(`/marketplace?category=${cat.category}`)}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 hover:border-primary/50 hover:shadow-md active:scale-95 transition-all"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", cat.color)}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-center leading-tight">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Personalized Recommendations - MAIN FOCUS */}
        <section className="animate-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">נבחר במיוחד עבורך</h2>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-1 text-primary font-medium hover:underline text-sm"
            >
              הכל
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </section>

        {/* Popular in Community */}
        <section className="animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <h2 className="text-lg font-bold">פופולרי בקהילה</h2>
            </div>
            <button
              onClick={() => navigate('/marketplace')}
              className="flex items-center gap-1 text-primary font-medium hover:underline text-sm"
            >
              הכל
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {popular.slice(0, 4).map((service) => (
              <ServiceCard key={service.id} service={service as any} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
