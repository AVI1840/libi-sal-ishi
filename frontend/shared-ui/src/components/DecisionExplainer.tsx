import { RECOMMENDATION_TYPE_LABELS, type DecisionExplanation } from '../data/scenario';

interface DecisionExplainerProps {
  explanation: DecisionExplanation;
  compact?: boolean;
}

export function DecisionExplainer({ explanation, compact = false }: DecisionExplainerProps) {
  const { triggeredRules, scoreBreakdown, subsidyBreakdown, conflicts, score, type } = explanation;
  const typeInfo = RECOMMENDATION_TYPE_LABELS[type];

  // ── Compact mode: inline on cards ────────────────────────
  if (compact) {
    return (
      <div dir="rtl" style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.6 }}>
        {/* Type + score badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{
            background: typeInfo.bgColor, color: typeInfo.color,
            padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
          }}>
            {typeInfo.emoji} {typeInfo.label}
          </span>
          <span style={{
            background: '#f1f5f9', color: '#334155',
            padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600,
            fontFamily: 'monospace',
          }}>
            {score.toFixed(2)}
          </span>
        </div>
        {triggeredRules.slice(0, 2).map((rule) => (
          <div key={rule.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 2 }}>
            <span style={{
              background: '#e0f2fe', color: '#0369a1', padding: '1px 6px',
              borderRadius: 4, fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap',
              fontFamily: 'monospace',
            }}>
              {rule.id}
            </span>
            <span>{rule.description}</span>
          </div>
        ))}
      </div>
    );
  }

  // ── Full mode: expanded on detail pages ──────────────────
  return (
    <div dir="rtl" style={{
      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
      padding: 16, fontSize: '0.8rem', fontFamily: "'Heebo', sans-serif",
    }}>
      {/* Header: type + score */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>🔍 למה ההמלצה הזו?</span>
          <span style={{
            background: typeInfo.bgColor, color: typeInfo.color, border: `1px solid ${typeInfo.color}22`,
            padding: '3px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 700,
          }}>
            {typeInfo.emoji} {typeInfo.label}
          </span>
        </div>
        <div style={{
          background: '#1B3A5C', color: '#fff', padding: '4px 12px',
          borderRadius: 8, fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem',
        }}>
          {score.toFixed(2)}
        </div>
      </div>

      {/* Rules */}
      <div style={{ marginBottom: 12 }}>
        <p style={{ fontWeight: 600, marginBottom: 6, color: '#475569', fontSize: '0.78rem' }}>⚡ כללים שהופעלו</p>
        {triggeredRules.map((rule) => (
          <div key={rule.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6,
            padding: '8px 10px', background: '#fff', borderRadius: 8,
            border: rule.isWinner ? '2px solid #16a34a' : '1px solid #f1f5f9',
          }}>
            <span style={{
              background: rule.isWinner ? '#dcfce7' : '#dbeafe',
              color: rule.isWinner ? '#15803d' : '#1d4ed8',
              padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700,
              whiteSpace: 'nowrap', fontFamily: 'monospace',
            }}>
              {rule.id}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontWeight: 600, color: '#334155' }}>{rule.name}</span>
                {rule.isWinner && (
                  <span style={{ fontSize: '0.65rem', color: '#16a34a', fontWeight: 600 }}>✓ מנצח</span>
                )}
              </div>
              <p style={{ color: '#64748b', margin: '2px 0 0' }}>{rule.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Conflicts */}
      {conflicts.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 6, color: '#475569', fontSize: '0.78rem' }}>⚖️ התנגשויות בין כללים</p>
          {conflicts.map((conflict, i) => (
            <div key={i} style={{
              padding: '8px 10px', background: '#fffbeb', borderRadius: 8,
              border: '1px solid #fde68a', marginBottom: 6,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, color: '#92400e', fontSize: '0.78rem' }}>
                  {conflict.description}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                {conflict.competingRules.map((r) => (
                  <span key={r} style={{
                    background: r === conflict.winner ? '#dcfce7' : '#fee2e2',
                    color: r === conflict.winner ? '#15803d' : '#991b1b',
                    padding: '1px 6px', borderRadius: 4, fontSize: '0.65rem',
                    fontWeight: 600, fontFamily: 'monospace',
                  }}>
                    {r} {r === conflict.winner ? '✓' : ''}
                  </span>
                ))}
              </div>
              <p style={{ color: '#78716c', fontSize: '0.75rem', margin: 0 }}>{conflict.reason}</p>
            </div>
          ))}
        </div>
      )}

      {/* Score breakdown */}
      {scoreBreakdown && (
        <div style={{ marginBottom: 12 }}>
          <p style={{ fontWeight: 600, marginBottom: 6, color: '#475569', fontSize: '0.78rem' }}>📊 פירוט ציון</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'מניעה', value: scoreBreakdown.prevention, max: 40, color: '#16a34a' },
              { label: 'התאמה', value: scoreBreakdown.meaningMatch, max: 30, color: '#2563eb' },
              { label: 'קרבה', value: scoreBreakdown.proximity, max: 20, color: '#d97706' },
              { label: 'חברתי', value: scoreBreakdown.socialProof, max: 10, color: '#7c3aed' },
            ].map(({ label, value, max, color }) => (
              <div key={label} style={{
                background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8,
                padding: '6px 10px', textAlign: 'center', minWidth: 64, position: 'relative', overflow: 'hidden',
              }}>
                {/* Fill bar */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: `${Math.round((value / max) * 100)}%`,
                  background: `${color}10`, transition: 'height 0.3s',
                }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>{label} (/{max})</div>
                </div>
              </div>
            ))}
            {scoreBreakdown.personaBoost > 0 && (
              <div style={{
                background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8,
                padding: '6px 10px', textAlign: 'center', minWidth: 64,
              }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309' }}>+{scoreBreakdown.personaBoost}%</div>
                <div style={{ fontSize: '0.6rem', color: '#92400e' }}>פרסונה</div>
              </div>
            )}
            <div style={{
              background: '#1B3A5C', borderRadius: 8,
              padding: '6px 14px', textAlign: 'center', minWidth: 64,
            }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{scoreBreakdown.total}</div>
              <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)' }}>סה"כ /100</div>
            </div>
          </div>
        </div>
      )}

      {/* Subsidy breakdown */}
      {subsidyBreakdown && (
        <div>
          <p style={{ fontWeight: 600, marginBottom: 6, color: '#475569', fontSize: '0.78rem' }}>💰 פירוט סבסוד</p>
          <div style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: '#64748b' }}>בסיס ({subsidyBreakdown.baseTier})</span>
              <span style={{ fontWeight: 600 }}>{subsidyBreakdown.basePercent}%</span>
            </div>
            {subsidyBreakdown.boosters.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#16a34a' }}>+ {b.name}</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>+{b.percent}%</span>
              </div>
            ))}
            <div style={{
              borderTop: '2px solid #e2e8f0', paddingTop: 8, marginTop: 6,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontWeight: 700 }}>סה"כ סבסוד</span>
              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '1rem' }}>{subsidyBreakdown.finalPercent}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, alignItems: 'baseline' }}>
              <span style={{ color: '#94a3b8', textDecoration: 'line-through', fontSize: '0.85rem' }}>₪{subsidyBreakdown.originalPrice}</span>
              <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#1B3A5C' }}>
                {subsidyBreakdown.finalPrice === 0 ? 'חינם ✨' : `₪${subsidyBreakdown.finalPrice}`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
