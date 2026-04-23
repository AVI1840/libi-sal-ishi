/**
 * KPI Closing Screen — The "money shot" of the demo.
 * Shows before vs. after for Sarah Cohen's journey.
 * Displayed as an overlay on Day 14.
 */

interface KPIClosingScreenProps {
  onClose: () => void;
}

const METRICS = [
  { label: 'ציון בדידות', before: '3/10', after: '6/10', emoji: '💙', improvement: '+100%', color: '#3b82f6' },
  { label: 'שירותים שנוצלו', before: '0', after: '6', emoji: '📋', improvement: '6 שירותים', color: '#8b5cf6' },
  { label: 'שירותי מניעה', before: '0%', after: '100%', emoji: '🛡️', improvement: 'כולם מניעה', color: '#16a34a' },
  { label: 'עלות למערכת', before: '—', after: '0 ₪', emoji: '💰', improvement: 'חינם', color: '#f59e0b' },
  { label: 'ניצול ארנק', before: '0%', after: '19%', emoji: '📊', improvement: 'מ-0 ל-6 יחידות', color: '#06b6d4' },
  { label: 'דגלי סיכון', before: '1 (בדידות)', after: '0', emoji: '🚩', improvement: 'הוסר', color: '#ef4444' },
];

const SYSTEM_METRICS = [
  { label: 'ניצול הסל (כלל המערכת)', before: '67%', after: '78%', target: '85%', color: '#3b82f6' },
  { label: 'שירותי מניעה (כלל)', before: '42%', after: '58%', target: '60%', color: '#16a34a' },
  { label: 'משתמשים לא פעילים', before: '12%', after: '7%', target: '5%', color: '#f59e0b' },
  { label: 'לקוחות למתאמת', before: '30', after: '75', target: '75+', color: '#8b5cf6' },
];

export function KPIClosingScreen({ onClose }: KPIClosingScreenProps) {
  return (
    <div
      dir="rtl"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Heebo', sans-serif", cursor: 'pointer',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20, maxWidth: 720, width: '95%',
          maxHeight: '90vh', overflow: 'auto', padding: 0,
          boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
          animation: 'slideUp 0.5s ease',
          cursor: 'default',
        }}
      >
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1B3A5C 0%, #2d5a8c 100%)',
          padding: '28px 32px', borderRadius: '20px 20px 0 0',
          color: '#fff', textAlign: 'center',
        }}>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
            תוצאות פיילוט · 14 יום
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 4px' }}>
            שרה כהן — סיפור הצלחה
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
            78, רמת גן · רמת סיעוד 2 · פרסונה: ממוקדת משפחה
          </p>
        </div>

        {/* Sarah's metrics */}
        <div style={{ padding: '24px 28px 16px' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: 16 }}>
            📈 המסע של שרה
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {METRICS.map((m) => (
              <div key={m.label} style={{
                background: '#f8fafc', borderRadius: 12, padding: '14px 12px',
                textAlign: 'center', border: '1px solid #e2e8f0',
              }}>
                <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{m.emoji}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 6 }}>{m.label}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem', textDecoration: 'line-through' }}>{m.before}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.7rem' }}>→</span>
                  <span style={{ color: m.color, fontSize: '1.05rem', fontWeight: 800 }}>{m.after}</span>
                </div>
                <div style={{
                  marginTop: 6, fontSize: '0.65rem', fontWeight: 600,
                  color: '#16a34a', background: '#f0fdf4',
                  padding: '2px 8px', borderRadius: 6, display: 'inline-block',
                }}>
                  {m.improvement}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System metrics */}
        <div style={{ padding: '0 28px 24px' }}>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b', marginBottom: 12 }}>
            🏛️ השפעה מערכתית (75 לקוחות)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SYSTEM_METRICS.map((m) => (
              <div key={m.label} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: '#f8fafc', borderRadius: 10,
                border: '1px solid #e2e8f0',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155' }}>{m.label}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{m.before}</span>
                  <span style={{ color: '#fbbf24', fontWeight: 800, fontSize: '0.75rem' }}>→</span>
                  <span style={{ color: m.color, fontSize: '1rem', fontWeight: 800 }}>{m.after}</span>
                  <span style={{
                    fontSize: '0.65rem', color: '#64748b', background: '#f1f5f9',
                    padding: '2px 6px', borderRadius: 4,
                  }}>
                    יעד: {m.target}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          padding: '16px 28px 24px', textAlign: 'center',
          borderTop: '1px solid #e2e8f0',
        }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 12 }}>
            כל זה קרה ב-14 יום. בלי אינטגרציות מורכבות. בלי שינוי תהליכים.
          </p>
          <button
            onClick={onClose}
            style={{
              background: '#1B3A5C', color: '#fff', border: 'none',
              padding: '12px 32px', borderRadius: 12, fontSize: '0.95rem',
              fontWeight: 700, cursor: 'pointer', fontFamily: "'Heebo', sans-serif",
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            סגור
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
