/**
 * ICF Profile Verification Badge
 *
 * Simple checkbox + badge for case managers to verify the self-reported
 * ICF profile. This adds a clinical verification layer.
 *
 * Two modes:
 * - compact: inline badge/button (for use in tables/lists)
 * - full: card with checkbox, notes, and verification info
 */

import { useState } from 'react';

interface ICFVerificationProps {
  userId: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  onVerify?: (data: { verified: boolean; notes?: string }) => void;
  compact?: boolean;
}

export function ICFVerification({
  isVerified = false,
  verifiedBy,
  verifiedAt,
  onVerify,
  compact = false,
}: ICFVerificationProps) {
  const [verified, setVerified] = useState(isVerified);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleVerify = () => {
    setVerified(true);
    setShowNotes(false);
    onVerify?.({ verified: true, notes: notes.trim() || undefined });
  };

  const handleUnverify = () => {
    setVerified(false);
    setShowNotes(true);
  };

  const handleSaveNotes = () => {
    onVerify?.({ verified: false, notes: notes.trim() || undefined });
    setShowNotes(false);
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={verified ? handleUnverify : handleVerify}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          verified
            ? 'bg-green-100 text-green-700 border border-green-200'
            : 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
        }`}
        title={verified ? `אומת ע"י ${verifiedBy || 'מתאמת'}` : 'לחץ/י לאמת פרופיל תפקודי'}
        aria-label={verified ? 'פרופיל ICF מאומת — לחץ לביטול' : 'פרופיל ICF לא מאומת — לחץ לאימות'}
      >
        {verified ? '✅' : '⚠️'}
        {verified ? 'ICF מאומת' : 'ICF לא מאומת'}
      </button>
    );
  }

  return (
    <div
      className={`rounded-lg border-2 p-3 transition-colors ${
        verified ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'
      }`}
      dir="rtl"
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={verified}
            onChange={verified ? handleUnverify : handleVerify}
            className="w-4 h-4 rounded border-gray-300 text-[#1B3A5C] focus:ring-[#1B3A5C]"
            aria-describedby="icf-verification-hint"
          />
          <span className="text-sm font-medium">
            {verified ? 'פרופיל תפקודי מאומת ✅' : 'אימות פרופיל תפקודי (ICF)'}
          </span>
        </label>
        {verified && verifiedBy && (
          <span className="text-xs text-muted-foreground">
            אומת ע"י {verifiedBy}
            {verifiedAt && ` · ${new Date(verifiedAt).toLocaleDateString('he-IL')}`}
          </span>
        )}
      </div>

      {!verified && !showNotes && (
        <p id="icf-verification-hint" className="text-xs text-amber-600 mt-1 mr-6">
          ⚠️ הפרופיל מבוסס על דיווח עצמי. מומלץ לאמת לפני הפעלת המלצות.
        </p>
      )}

      {showNotes && (
        <div className="mt-2 mr-6 space-y-2">
          <label htmlFor="icf-notes" className="text-xs font-medium text-gray-600">
            מה לא מדויק? (לא חובה)
          </label>
          <textarea
            id="icf-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="לדוגמה: ניידות טובה יותר ממה שדווח..."
            maxLength={300}
            className="w-full min-h-[40px] rounded border border-gray-300 p-2 text-xs text-right resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
            dir="rtl"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSaveNotes}
              className="text-xs px-3 py-1 rounded bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors"
            >
              שמור הערה
            </button>
            <button
              type="button"
              onClick={() => setShowNotes(false)}
              className="text-xs px-3 py-1 rounded text-gray-500 hover:bg-gray-100 transition-colors"
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
