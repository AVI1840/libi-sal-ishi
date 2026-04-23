/**
 * Shared DemoNav bar — used by all 3 apps.
 * Links to landing page + all 3 interfaces.
 */

const APPS = [
  { label: "🏠 עמוד ראשי", href: "https://libi-landing.vercel.app", id: "landing" },
  { label: "👵 ממשק אזרח", href: "https://libi-sal-ishi.vercel.app", id: "client" },
  { label: "📋 לוח מתאמת", href: "https://libi-case-manager.vercel.app", id: "manager" },
  { label: "🏪 פורטל ספקים", href: "https://libi-vendor-portal.vercel.app", id: "vendor" },
];

interface DemoNavBarProps {
  current: "client" | "manager" | "vendor";
}

export function DemoNavBar({ current }: DemoNavBarProps) {
  return (
    <div
      dir="rtl"
      style={{
        background: '#0f172a',
        padding: '6px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        flexWrap: 'wrap',
        fontFamily: "'Heebo', sans-serif",
        fontSize: '0.75rem',
        zIndex: 9999,
        position: 'relative',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <span style={{ color: '#475569', marginLeft: 6, fontWeight: 600, letterSpacing: '0.5px' }}>
        LIBI
      </span>
      <span style={{ color: '#334155', margin: '0 4px' }}>|</span>
      {APPS.map((app) => {
        const isActive = app.id === current;
        return (
          <a
            key={app.id}
            href={app.href}
            style={{
              color: isActive ? '#fff' : '#94a3b8',
              background: isActive ? '#1d4ed8' : 'transparent',
              padding: '4px 10px',
              borderRadius: 6,
              textDecoration: 'none',
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {app.label}
          </a>
        );
      })}
    </div>
  );
}
