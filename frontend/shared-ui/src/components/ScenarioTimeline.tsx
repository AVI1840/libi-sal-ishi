import { SCENARIO_DAYS, type ScenarioDay } from '../data/scenario';

interface ScenarioTimelineProps {
  currentDay: ScenarioDay;
  onDayChange: (day: ScenarioDay) => void;
}

const NARRATIVE: Record<number, { before: string; after: string }> = {
  1:  { before: 'שרה כהן, 78, בודדה. 32 יחידות לא מנוצלות.', after: 'המערכת מזהה בדידות ומציעה פעילות חברתית — חינם.' },
  3:  { before: 'שרה מהססת. מעולם לא השתמשה בסל.', after: 'הזמנה ראשונה: מועדון צהריים. 0 ₪. ספק אישר.' },
  7:  { before: 'שרה הגיעה לפעילות. מה קרה?', after: 'ציון בדידות עלה מ-3 ל-5. הזמינה עוד 2 שירותים.' },
  14: { before: '14 יום. מה השתנה?', after: '6 שירותי מניעה. בדידות: 3→6. ניצול ארנק: 19%. עלות: 0 ₪.' },
};

export function ScenarioTimeline({ currentDay, onDayChange }: ScenarioTimelineProps) {
  const narrative = NARRATIVE[currentDay];

  return (
    <div dir="rtl" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      fontFamily: "'Heebo', sans-serif",
      zIndex: 9998,
      position: 'relative',
    }}>
      {/* Timeline steps */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 0, padding: '0 16px', height: 48,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {SCENARIO_DAYS.map(({ day, label }, i) => {
          const isActive = currentDay === day;
          const isPast = day < currentDay;
          const isLast = i === SCENARIO_DAYS.length - 1;
          return (
            <div key={day} style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => onDayChange(day)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 10, cursor: 'pointer',
                  background: isActive ? 'rgba(59,130,246,0.2)' : 'transparent',
                  border: isActive ? '1px solid rgba(59,130,246,0.4)' : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  fontFamily: "'Heebo', sans-serif",
                }}
              >
                {/* Step dot */}
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: isActive ? '#3b82f6' : isPast ? '#22c55e' : '#475569',
                  boxShadow: isActive ? '0 0 8px rgba(59,130,246,0.5)' : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{
                  color: isActive ? '#fff' : isPast ? '#94a3b8' : '#64748b',
                  fontSize: '0.78rem', fontWeight: isActive ? 700 : 400,
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
                {isPast && !isActive && (
                  <span style={{ color: '#22c55e', fontSize: '0.7rem' }}>✓</span>
                )}
              </button>
              {/* Connector line */}
              {!isLast && (
                <div style={{
                  width: 24, height: 2, margin: '0 2px',
                  background: isPast ? '#22c55e' : '#334155',
                  borderRadius: 1, transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Narrative bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 12, padding: '8px 20px', minHeight: 36,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: '0.76rem', lineHeight: 1.4,
        }}>
          <span style={{
            color: '#f87171', fontWeight: 600, whiteSpace: 'nowrap',
            padding: '2px 8px', background: 'rgba(248,113,113,0.1)',
            borderRadius: 6, fontSize: '0.7rem',
          }}>
            לפני
          </span>
          <span style={{ color: '#94a3b8' }}>{narrative.before}</span>
          <span style={{
            color: '#0f172a', background: '#fbbf24', fontWeight: 700,
            padding: '1px 8px', borderRadius: 4, fontSize: '0.65rem',
            margin: '0 4px',
          }}>
            →
          </span>
          <span style={{
            color: '#4ade80', fontWeight: 600, whiteSpace: 'nowrap',
            padding: '2px 8px', background: 'rgba(74,222,128,0.1)',
            borderRadius: 6, fontSize: '0.7rem',
          }}>
            אחרי
          </span>
          <span style={{ color: '#d1d5db' }}>{narrative.after}</span>
        </div>
      </div>
    </div>
  );
}
