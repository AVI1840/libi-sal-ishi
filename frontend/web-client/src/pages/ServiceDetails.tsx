import { Button } from '@libi/shared-ui';
import { DecisionExplainer } from '@libi/shared-ui/components/DecisionExplainer';
import { RECOMMENDATION_TYPE_LABELS } from '@libi/shared-ui/data/scenario';
import { Calendar, Check, Clock, MapPin, Star, Users } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { useApp } from '../contexts/AppContext';

export default function ServiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookService, currentClient, recommendations } = useApp();

  const service = recommendations.find(s => s.id === id);

  if (!service) {
    return (
      <div className="page-container">
        <Header title="שירות לא נמצא" showBack />
        <main className="content-padding pt-8 text-center">
          <p className="text-muted-foreground">השירות המבוקש לא נמצא</p>
        </main>
        <BottomNav />
      </div>
    );
  }

  const subsidyInfo = service.explanation?.subsidyBreakdown;
  const displayPrice = subsidyInfo ? subsidyInfo.finalPrice : service.price;
  const recType = service.explanation?.type;
  const typeInfo = recType ? RECOMMENDATION_TYPE_LABELS[recType] : null;
  const normalizedScore = service.explanation?.score;

  const handleBook = () => {
    if (currentClient.walletBalance < 1) {
      toast.error('אין מספיק יתרה בארנק');
      return;
    }
    bookService(service);
    toast.success('השירות נרשם בהצלחה! מעבר ליום 3...');
  };

  return (
    <div className="page-container">
      <Header title={service.name} showBack />

      <main className="pb-28">
        {/* Hero Image */}
        <div className="relative h-64">
          <img
            src={service.imageUrl}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          {subsidyInfo && subsidyInfo.finalPercent > 0 && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
              {subsidyInfo.finalPercent === 100 ? 'חינם ✨' : `${subsidyInfo.finalPercent}% סבסוד`}
            </div>
          )}
          {/* Type + score badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {typeInfo && (
              <span
                className="px-3 py-1.5 rounded-lg text-sm font-bold shadow-md"
                style={{ background: typeInfo.bgColor, color: typeInfo.color, border: `1px solid ${typeInfo.color}33` }}
              >
                {typeInfo.emoji} {typeInfo.label}
              </span>
            )}
            {normalizedScore !== undefined && (
              <span
                className="px-3 py-1.5 rounded-lg text-sm font-bold shadow-md"
                style={{ background: '#1B3A5C', color: '#fff', fontFamily: 'monospace' }}
              >
                {normalizedScore.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <div className="content-padding pt-6 space-y-6">
          {/* Title & Meta */}
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-2">{service.name}</h1>
            <p className="text-muted-foreground text-lg mb-4">{service.shortDesc}</p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-warning fill-warning" />
                <span className="font-medium">{service.rating}</span>
                <span>({service.reviews} ביקורות)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-5 h-5" />
                <span>{service.distanceMinutes} דק׳ מהבית</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-5 h-5" />
                <span>{service.communityCount} מהקהילה</span>
              </div>
            </div>
          </div>

          {/* Decision Explanation */}
          {service.explanation && (
            <div className="animate-slide-up">
              <DecisionExplainer explanation={service.explanation} />
            </div>
          )}

          {/* Description */}
          <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up">
            <h2 className="text-xl font-bold mb-3">תיאור השירות</h2>
            <p className="text-foreground leading-relaxed">{service.longDesc}</p>
          </div>

          {/* What's Included */}
          <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold mb-3">מה כלול</h2>
            <ul className="space-y-2">
              {service.included.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-success-light flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Availability */}
          <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: '150ms' }}>
            <h2 className="text-xl font-bold mb-3">זמינות</h2>
            <div className="space-y-2">
              {service.availability.map((time, idx) => (
                <div key={idx} className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-elevated animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">מחיר</p>
                <p className="text-3xl font-bold">
                  {displayPrice === 0 ? 'חינם ✨' : `₪${displayPrice}`}
                </p>
                {subsidyInfo && subsidyInfo.finalPercent > 0 && displayPrice !== service.price && (
                  <p className="text-white/50 text-sm line-through">₪{service.price}</p>
                )}
              </div>
              <div className="text-left">
                <p className="text-white/70 text-sm">יתרה בארנק</p>
                <p className="text-xl font-bold">{currentClient.walletBalance} יחידות</p>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full bg-white text-primary hover:bg-white/90"
              onClick={handleBook}
            >
              <Calendar className="w-5 h-5 ml-2" />
              הזמן עכשיו
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
