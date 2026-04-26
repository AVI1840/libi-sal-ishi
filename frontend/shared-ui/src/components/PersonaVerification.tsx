/**
 * Persona Verification Card
 *
 * Displayed to case managers after intake. Shows the algorithmically-derived
 * persona and allows the case manager to approve, override, or add notes.
 *
 * Critical because persona affects all recommendations (boost up to ×1.5).
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const PERSONA_LABELS: Record<string, { label: string; emoji: string; description: string }> = {
  social_butterfly:   { label: 'נהנה/ית מפעילות חברתית', emoji: '🦋', description: 'מעדיף/ה פעילויות קבוצתיות, נהנה/ית מחברה' },
  security_seeker:    { label: 'מעדיף/ה ביטחון ושגרה', emoji: '🛡️', description: 'מעדיף/ה סביבה מוכרת, שגרה קבועה' },
  independent_spirit: { label: 'שואף/ת לשמור על עצמאות', emoji: '🦅', description: 'רוצה לעשות דברים בכוחות עצמו/ה' },
  family_oriented:    { label: 'קשר משפחתי חשוב מאוד', emoji: '👨‍👩‍👧', description: 'משפחה במרכז, אוהב/ת פעילויות עם נכדים' },
  learner:            { label: 'אוהב/ת ללמוד דברים חדשים', emoji: '📚', description: 'סקרן/ית, נהנה/ית מלמידה וסדנאות' },
  caregiver:          { label: 'אוהב/ת לעזור לאחרים', emoji: '💝', description: 'מרגיש/ה סיפוק מעזרה והתנדבות' },
};

interface PersonaVerificationProps {
  userId: string;
  userName: string;
  primaryPersona: string;
  secondaryPersonas?: string[];
  keyTraits?: string[];
  engagementTips?: string[];
  onVerify?: (data: { approved: boolean; override_persona?: string; notes?: string }) => void;
  isVerified?: boolean;
}

export function PersonaVerification({
  userName,
  primaryPersona,
  secondaryPersonas = [],
  keyTraits = [],
  engagementTips = [],
  onVerify,
  isVerified = false,
}: PersonaVerificationProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [selectedOverride, setSelectedOverride] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [verified, setVerified] = useState(isVerified);

  const primary = PERSONA_LABELS[primaryPersona] || { label: primaryPersona, emoji: '❓', description: '' };

  const handleApprove = () => {
    setVerified(true);
    setShowOverride(false);
    onVerify?.({ approved: true, notes: notes.trim() || undefined });
  };

  const handleOverride = () => {
    if (!selectedOverride) return;
    setVerified(true);
    setShowOverride(false);
    onVerify?.({ approved: false, override_persona: selectedOverride, notes: notes.trim() || undefined });
  };

  return (
    <Card className={`border-2 transition-colors ${verified ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2" dir="rtl">
            {verified ? '✅' : '⚠️'} פרסונה — {userName}
          </CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            verified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {verified ? 'אומתה ✓' : 'ממתינה לאימות'}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4" dir="rtl">
        {/* Primary Persona */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-white border">
          <span className="text-2xl" aria-hidden="true">{primary.emoji}</span>
          <div>
            <p className="font-medium text-sm">{primary.label}</p>
            <p className="text-xs text-muted-foreground">{primary.description}</p>
          </div>
        </div>

        {/* Secondary */}
        {secondaryPersonas.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {secondaryPersonas.map((p) => {
              const info = PERSONA_LABELS[p];
              return info ? (
                <span key={p} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                  {info.emoji} {info.label}
                </span>
              ) : null;
            })}
          </div>
        )}

        {/* Key Traits */}
        {keyTraits.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">תכונות מרכזיות</p>
            <div className="flex gap-2 flex-wrap">
              {keyTraits.map((trait, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#1B3A5C]/10 text-[#1B3A5C]">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Engagement Tips */}
        {engagementTips.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">💡 טיפים להתקשרות</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {engagementTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-gray-400" aria-hidden="true">•</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Verification Actions */}
        {!verified && (
          <div className="space-y-3 pt-2 border-t">
            <label htmlFor="persona-notes" className="sr-only">הערות לפרסונה</label>
            <textarea
              id="persona-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="הערות (לא חובה)..."
              maxLength={300}
              className="w-full min-h-[40px] rounded-lg border border-gray-300 p-2 text-xs text-right resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
              dir="rtl"
            />

            <div className="flex gap-2">
              <Button
                onClick={handleApprove}
                size="sm"
                className="flex-1 text-white text-xs"
                style={{ backgroundColor: '#16a34a' }}
              >
                ✅ מאשר/ת פרסונה
              </Button>
              <Button
                onClick={() => setShowOverride(!showOverride)}
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                aria-expanded={showOverride}
              >
                ✏️ לא מדויק — שנה
              </Button>
            </div>

            {/* Override Selection */}
            {showOverride && (
              <div className="space-y-2 p-3 rounded-lg bg-white border" role="radiogroup" aria-label="בחירת פרסונה חלופית">
                <p className="text-xs font-medium">בחר/י פרסונה מתאימה:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PERSONA_LABELS).map(([key, info]) => (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selectedOverride === key}
                      onClick={() => setSelectedOverride(key)}
                      className={`p-2 rounded-lg border text-xs text-right transition-colors ${
                        selectedOverride === key
                          ? 'border-[#1B3A5C] bg-[#1B3A5C]/10 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {info.emoji} {info.label}
                    </button>
                  ))}
                </div>
                {selectedOverride && (
                  <Button
                    onClick={handleOverride}
                    size="sm"
                    className="w-full text-white text-xs"
                    style={{ backgroundColor: '#1B3A5C' }}
                  >
                    עדכן פרסונה
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
