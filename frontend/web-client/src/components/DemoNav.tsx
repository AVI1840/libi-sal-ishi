const APPS = [
  { label: "👵 ממשק אזרח", href: "https://libi-sal-ishi.vercel.app", id: "client" },
  { label: "📋 לוח בקרה למתאמת", href: "https://libi-case-manager.vercel.app", id: "manager" },
  { label: "🏪 פורטל ספקים", href: "https://libi-vendor-portal.vercel.app", id: "vendor" },
];

export function DemoNav({ current }: { current: "client" | "manager" | "vendor" }) {
  return (
    <div style={{
      background: "#0f172a",
      padding: "8px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      flexWrap: "wrap",
      direction: "rtl",
      fontFamily: "'Heebo', sans-serif",
      fontSize: "0.8rem",
      zIndex: 9999,
      position: "relative",
    }}>
      <span style={{ color: "#64748b", marginLeft: 8 }}>LIBI Demo</span>
      {APPS.map((app) => (
        <a
          key={app.id}
          href={app.href}
          style={{
            color: app.id === current ? "#fff" : "#94a3b8",
            background: app.id === current ? "#1d4ed8" : "transparent",
            padding: "4px 12px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: app.id === current ? 600 : 400,
            transition: "all 0.2s",
            whiteSpace: "nowrap",
            minHeight: "auto",
            minWidth: "auto",
          }}
        >
          {app.label}
        </a>
      ))}
    </div>
  );
}
