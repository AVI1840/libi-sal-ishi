import { Button, cn, Service } from '@libi/shared-ui';
import { DecisionExplainer } from '@libi/shared-ui/components/DecisionExplainer';
import { RECOMMENDATION_TYPE_LABELS, type DecisionExplanation } from '@libi/shared-ui/data/scenario';
import { ChevronDown, ChevronUp, MapPin, Star, Users } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service & { fitScore?: number; fitReason?: string; explanation?: DecisionExplanation };
  compact?: boolean;
}

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);

  const subsidyInfo = service.explanation?.subsidyBreakdown;
  const displayPrice = subsidyInfo ? subsidyInfo.finalPrice : service.price;
  const recType = service.explanation?.type;
  const typeInfo = recType ? RECOMMENDATION_TYPE_LABELS[recType] : null;
  const normalizedScore = service.explanation?.score;

  return (
    <div
      className={cn(
        "service-card h-full flex flex-col",
        compact && "w-72 flex-shrink-0"
      )}
    >
      <div className="relative cursor-pointer" onClick={() => navigate(`/service/${service.id}`)}>
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-40 object-cover"
        />
        {/* Top-right: recommendation type + score */}
        {typeInfo && normalizedScore !== undefined && (
          <div className="absolute top-3 right-3 flex items-center gap-1.5">
            <span
              className="px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm"
              style={{ background: typeInfo.bgColor, color: typeInfo.color, border: `1px solid ${typeInfo.color}33` }}
            >
              {typeInfo.emoji} {typeInfo.label}
            </span>
            <span
              className="px-2 py-1 rounded-lg text-xs font-bold shadow-sm"
              style={{ background: '#1B3A5C', color: '#fff', fontFamily: 'monospace' }}
            >
              {normalizedScore.toFixed(2)}
            </span>
          </div>
        )}
        {/* Top-left: subsidy badge */}
        {subsidyInfo && subsidyInfo.finalPercent > 0 && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
            {subsidyInfo.finalPercent === 100 ? 'חינם ✨' : `${subsidyInfo.finalPercent}% סבסוד`}
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-1 line-clamp-1 cursor-pointer" onClick={() => navigate(`/service/${service.id}`)}>{service.name}</h3>
        <p className="text-muted-foreground text-sm mb-2 line-clamp-2 flex-grow">{service.shortDesc}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span>{service.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span>{service.distanceMinutes} דק׳</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{service.communityCount}</span>
          </div>
        </div>

        {service.fitReason && (
          <p className="text-xs text-primary mb-2 font-medium line-clamp-2">{service.fitReason}</p>
        )}

        {/* Decision explanation toggle */}
        {service.explanation && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowExplanation(!showExplanation); }}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mb-2 font-medium"
          >
            {showExplanation ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showExplanation ? 'הסתר הסבר' : '🔍 למה ההמלצה הזו?'}
          </button>
        )}

        {showExplanation && service.explanation && (
          <div className="mb-3">
            <DecisionExplainer explanation={service.explanation} />
          </div>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg font-bold">
            {displayPrice === 0 ? (
              <span className="text-green-600">חינם</span>
            ) : (
              <span>
                <span className="text-muted-foreground line-through text-sm mr-1">₪{subsidyInfo?.originalPrice}</span>
                ₪{displayPrice}
              </span>
            )}
          </div>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/service/${service.id}`); }}>
            לפרטים
          </Button>
        </div>
      </div>
    </div>
  );
}
