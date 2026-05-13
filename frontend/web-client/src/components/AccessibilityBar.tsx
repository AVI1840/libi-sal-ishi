import { useState, useEffect } from "react";

export function AccessibilityBar() {
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [highContrast]);

  const increase = () => setFontSize((prev) => Math.min(prev + 15, 150));
  const decrease = () => setFontSize((prev) => Math.max(prev - 15, 85));

  return (
    <div
      dir="rtl"
      role="toolbar"
      aria-label="סרגל נגישות"
      style={{
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        padding: "6px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        fontSize: "0.8rem",
        fontFamily: "'Heebo', sans-serif",
      }}
    >
      <button
        onClick={increase}
        style={{
          background: "#1B3A5C",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "4px 10px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "0.85rem",
          minHeight: 32,
          minWidth: 32,
        }}
        aria-label="הגדל טקסט"
      >
        A+
      </button>
      <button
        onClick={decrease}
        style={{
          background: "#e2e8f0",
          color: "#334155",
          border: "none",
          borderRadius: 6,
          padding: "4px 10px",
          fontWeight: 700,
          cursor: "pointer",
          fontSize: "0.85rem",
          minHeight: 32,
          minWidth: 32,
        }}
        aria-label="הקטן טקסט"
      >
        A-
      </button>
      <span style={{ color: "#64748b" }} aria-hidden="true">|</span>
      <button
        onClick={() => setHighContrast(!highContrast)}
        style={{
          background: highContrast ? "#1B3A5C" : "#e2e8f0",
          color: highContrast ? "#fff" : "#334155",
          border: "none",
          borderRadius: 6,
          padding: "4px 10px",
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "0.75rem",
          minHeight: 32,
          minWidth: 32,
        }}
        aria-label="ניגודיות גבוהה"
        aria-pressed={highContrast}
      >
        {highContrast ? "◐ ניגודיות" : "◑ ניגודיות"}
      </button>
      <span style={{ color: "#64748b" }} aria-hidden="true">|</span>
      <a
        href="tel:*6050"
        style={{
          color: "#1B3A5C",
          fontWeight: 700,
          textDecoration: "none",
          display: "flex",
          alignItems: "center",
          gap: 4,
          minHeight: 32,
        }}
        aria-label="התקשר למוקד תמיכה *6050"
      >
        📞 מוקד: *6050
      </a>
    </div>
  );
}
