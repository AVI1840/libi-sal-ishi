import { cn } from '@libi/shared-ui';
import {
    Clock,
    Heart,
    MessageCircle,
    Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

type PersonaType = 'warm_grandchild' | 'efficient_assistant' | 'motivational_coach';

// Persona greetings based on time of day and persona type
const PERSONA_GREETINGS: Record<PersonaType, Record<string, string>> = {
  warm_grandchild: {
    morning: 'בוקר טוב',
    afternoon: 'צהריים טובים',
    evening: 'ערב טוב',
  },
  efficient_assistant: {
    morning: 'בוקר טוב',
    afternoon: 'צהריים טובים',
    evening: 'ערב טוב',
  },
  motivational_coach: {
    morning: 'בוקר טוב',
    afternoon: 'צהריים טובים',
    evening: 'ערב טוב',
  },
};

const PERSONA_FOLLOW_UPS: Record<PersonaType, string> = {
  warm_grandchild: 'איך אני יכולה לעזור לך היום?',
  efficient_assistant: 'במה לעזור?',
  motivational_coach: 'מה בתוכנית להיום?',
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

interface MorningBriefing {
  appointments: { time: string; title: string; location?: string }[];
  suggestions: { icon: string; text: string; action?: string }[];
}

// Mock morning briefing data
const getMockBriefing = (): MorningBriefing => ({
  appointments: [
    { time: '10:00', title: 'התעמלות בוקר', location: 'פארק הירקון' },
    { time: '16:00', title: 'מפגש קהילתי', location: 'מתנ"ס' },
  ],
  suggestions: [
    { icon: '🏃', text: 'לא שכחת את ההליכה היומית?', action: 'fitness' },
    { icon: '📞', text: 'דיברת לאחרונה עם יעל?', action: 'call' },
    { icon: '💊', text: 'לקחת את התרופות?', action: 'health' },
  ],
});

interface LimorWidgetProps {
  className?: string;
  persona?: PersonaType;
}

export function LimorWidget({ className, persona = 'warm_grandchild' }: LimorWidgetProps) {
  const navigate = useNavigate();
  const { currentClient } = useApp();

  const timeOfDay = getTimeOfDay();
  const greeting = PERSONA_GREETINGS[persona][timeOfDay];
  const followUp = PERSONA_FOLLOW_UPS[persona];
  const briefing = getMockBriefing();
  const firstName = currentClient.name.split(' ')[0];

  return (
    <div className={cn("bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden", className)}>
      {/* Compact Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl shadow-md">
            💙
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">{greeting}, {firstName}!</h2>
            <p className="text-sm text-muted-foreground">{followUp}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Today's Appointments */}
        {briefing.appointments.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              מה בתוכנית להיום
            </h3>
            <div className="space-y-2">
              {briefing.appointments.map((apt, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {apt.time}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{apt.title}</p>
                    {apt.location && (
                      <p className="text-xs text-muted-foreground">{apt.location}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gentle Suggestions */}
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-2 text-foreground">
            <Sparkles className="w-4 h-4 text-secondary" />
            תזכורות עדינות
          </h3>
          <div className="space-y-2">
            {briefing.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                className="w-full flex items-center gap-3 p-3 bg-secondary/5 hover:bg-secondary/10 rounded-xl transition-colors text-right"
              >
                <span className="text-lg">{suggestion.icon}</span>
                <span className="text-sm">{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate('/chat')}
          className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-5 h-5" />
          דבר/י איתי
        </button>

        {/* Emotional Support Prompt */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs">
          <Heart className="w-3 h-3 text-red-400" />
          <span>אני כאן בשבילך - תמיד</span>
        </div>
      </div>
    </div>
  );
}
