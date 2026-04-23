import { cn } from '@libi/shared-ui';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { ServiceCard } from '../components/ServiceCard';
import { useApp } from '../contexts/AppContext';

const categories = [
  { key: 'all', label: 'הכל' },
  { key: 'health', label: 'בריאות' },
  { key: 'fitness', label: 'כושר' },
  { key: 'social', label: 'חברתי' },
  { key: 'culture', label: 'תרבות' },
  { key: 'prevention', label: 'מניעה' },
];

export default function Marketplace() {
  const { recommendations } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');

  const visible = recommendations.filter(s => !s.filteredOut);

  const filteredServices = useMemo(() => {
    return visible.filter(service => {
      const matchesSearch = search === '' ||
        service.name.includes(search) ||
        service.shortDesc.includes(search) ||
        service.tags.some(tag => tag.includes(search));
      const matchesCategory = category === 'all' || service.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [visible, search, category]);

  const filteredOut = recommendations.filter(s => s.filteredOut);

  return (
    <div className="page-container">
      <Header title="שוק השירותים" showBack />

      <main className="content-padding pt-4 pb-28 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש שירות, פעילות או תחום..."
            className="w-full h-14 pr-12 pl-16 rounded-2xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          />
          <button className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                category === cat.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground border border-border hover:border-primary"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-muted-foreground">{filteredServices.length} שירותים מומלצים</p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        {/* Filtered out services */}
        {filteredOut.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">
              🚫 {filteredOut.length} שירותים סוננו (לא מתאימים לפרופיל התפקודי)
            </p>
            <div className="space-y-2">
              {filteredOut.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl opacity-60">
                  <span className="text-sm">{service.name}</span>
                  <span className="text-xs text-red-500">{service.filterReason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
