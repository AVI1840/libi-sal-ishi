import { Button, cn, Service } from '@libi/shared-ui';
import { MapPin, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ServiceCardProps {
  service: Service & { fitScore?: number; fitReason?: string };
  compact?: boolean;
}

export function ServiceCard({ service, compact = false }: ServiceCardProps) {
  const navigate = useNavigate();

  const getFitBadgeClass = (score: number) => {
    if (score >= 80) return 'fit-badge fit-badge-high';
    if (score >= 60) return 'fit-badge fit-badge-medium';
    return 'fit-badge fit-badge-low';
  };

  const getFundingBadgeClass = (source: string) => {
    if (source === 'סל' || source === 'סל+ביטוח') return 'bg-success-light text-success';
    if (source === 'ביטוח') return 'bg-primary-light text-primary';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div
      className={cn(
        "service-card cursor-pointer h-full flex flex-col",
        compact && "w-72 flex-shrink-0"
      )}
      onClick={() => navigate(`/service/${service.id}`)}
    >
      <div className="relative">
        <img
          src={service.imageUrl}
          alt={service.name}
          className="w-full h-40 object-cover"
        />
        {service.fitScore && (
          <div className={`absolute top-3 right-3 ${getFitBadgeClass(service.fitScore)}`}>
            <span>{service.fitScore}% התאמה</span>
          </div>
        )}
        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full text-sm font-medium ${getFundingBadgeClass(service.fundingSource)}`}>
          {service.fundingSource}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{service.name}</h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2 flex-grow">{service.shortDesc}</p>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3 flex-wrap">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span>{service.rating}</span>
            <span>({service.reviews})</span>
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
          <p className="text-xs text-primary mb-3 font-medium line-clamp-1">{service.fitReason}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg font-bold">
            {service.price === 0 ? 'חינם' : `₪${service.price}`}
          </div>
          <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/service/${service.id}`); }}>
            לפרטים
          </Button>
        </div>
      </div>
    </div>
  );
}
