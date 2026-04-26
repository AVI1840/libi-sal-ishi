/**
 * Escalation Badge
 *
 * Shows when a CRM action has been auto-escalated due to not being
 * handled within the threshold (72h for URGENT, 1 week for HIGH).
 *
 * Three states:
 * 1. Already escalated → red badge "הועבר למנהל רשות"
 * 2. Approaching escalation (< 24h remaining) → orange countdown
 * 3. Past threshold but not yet marked → red warning
 * 4. Not applicable → null (renders nothing)
 */

interface EscalationBadgeProps {
  escalated: boolean;
  escalatedAt?: string;
  escalationReason?: string;
  priority: string;
  createdAt: string;
}

function getHoursSince(dateStr: string): number {
  return (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60);
}

function getEscalationThreshold(priority: string): number {
  switch (priority) {
    case 'urgent': return 72;   // 3 days
    case 'high':   return 168;  // 1 week
    default:       return Infinity;
  }
}

export function EscalationBadge({
  escalated,
  escalatedAt,
  priority,
  createdAt,
}: EscalationBadgeProps) {
  // State 1: Already escalated
  if (escalated) {
    return (
      <div
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 border border-red-200 text-xs font-medium"
        dir="rtl"
        role="status"
        aria-label="פעולה הועברה למנהל רשות"
      >
        <span aria-hidden="true">🔺</span>
        <span>הועבר למנהל רשות</span>
        {escalatedAt && (
          <span className="text-red-400">
            · {new Date(escalatedAt).toLocaleDateString('he-IL')}
          </span>
        )}
      </div>
    );
  }

  const threshold = getEscalationThreshold(priority);
  if (threshold === Infinity) return null;

  const hours = getHoursSince(createdAt);
  const remaining = threshold - hours;

  // State 3: Past threshold — should have been escalated
  if (remaining <= 0) {
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-medium"
        dir="rtl"
        role="alert"
      >
        🔺 חרגה מזמן הטיפול
      </span>
    );
  }

  // State 2: Approaching escalation (< 24h remaining)
  if (remaining <= 24) {
    const hoursLeft = Math.max(1, Math.round(remaining));
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium"
        dir="rtl"
        role="status"
        aria-label={`${hoursLeft} שעות להסלמה אוטומטית`}
      >
        ⏰ {hoursLeft} שעות להסלמה
      </span>
    );
  }

  // State 4: Not applicable yet
  return null;
}
