/**
 * אלגוריתם התאמה — הגדרות משקלות 5 שכבות
 * מאפשר למנהלים לראות ולהתאים את משקלות ההמלצה עם תצוגה חיה של תוצאות
 */

import { useState, useMemo } from "react";
import AppLayout from "@/components/AppLayout";
import { Card, CardHeader } from "@/components/common/Card";
import { Chip } from "@/components/common/Chip";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, Target, Heart, User, Star, MapPin, Save, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   DATA & TYPES
   ═══════════════════════════════════════════ */

const LAYERS = [
  { id: "prevention", label: "מניעת הידרדרות", emoji: "🎯", icon: Target, color: "#dc2626", description: "מה יעיל למצב התפקודי הספציפי, מה מקדם הזדקנות מיטבית" },
  { id: "desires", label: "רצון ומוטיבציות", emoji: "❤️", icon: Heart, color: "#e11d48", description: "מה האדם רוצה, מה מתאים לאישיותו, מה הוא מוכן להשקיע" },
  { id: "profile", label: "התאמה לפרופיל", emoji: "👤", icon: User, color: "#7c3aed", description: "יכולות פיזיות, קוגניטיביות, חברתיות, מגבלות" },
  { id: "recommendations", label: "המלצות וניסיון", emoji: "🌟", icon: Star, color: "#f59e0b", description: "מה אחרים בפרופיל דומה המליצו, ביקורות, המלצות מקצועיות" },
  { id: "availability", label: "זמינות מעשית", emoji: "📍", icon: MapPin, color: "#0ea5e9", description: "קרבה גיאוגרפית, זמני פעילות, עלות והתאמה תקציבית" },
];

const DEFAULT_WEIGHTS = [30, 25, 20, 15, 10];

// Mock service recommendations that change based on weights
const MOCK_SERVICES = [
  { name: "סדנת מניעת נפילות", domain: "תפקוד ובריאות", scores: [95, 40, 70, 80, 90] },
  { name: "מועדון חברתי שכונתי", domain: "שייכות ומשמעות", scores: [60, 95, 80, 85, 95] },
  { name: "מקהלה קהילתית", domain: "שייכות ומשמעות", scores: [50, 90, 60, 70, 85] },
  { name: "אימון כוח ואיזון", domain: "תפקוד ובריאות", scores: [98, 50, 65, 75, 80] },
  { name: "הדרכת סמארטפון", domain: "דיגיטציה תומכת", scores: [40, 70, 50, 60, 70] },
  { name: "קבוצות הליכה", domain: "שייכות ומשמעות", scores: [85, 80, 75, 90, 95] },
  { name: "לחצן מצוקה אישי", domain: "מוצרים מסייעים", scores: [90, 30, 80, 70, 95] },
  { name: "תמיכה נפשית", domain: "חוסן אישי", scores: [70, 60, 90, 65, 80] },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */

export default function Algorithm() {
  const [weights, setWeights] = useState<number[]>([...DEFAULT_WEIGHTS]);

  const totalWeight = useMemo(() => weights.reduce((sum, w) => sum + w, 0), [weights]);

  const handleSliderChange = (index: number, value: number) => {
    setWeights((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleReset = () => {
    setWeights([...DEFAULT_WEIGHTS]);
    toast("🔄 המשקלות אופסו לברירת מחדל");
  };

  const handleSave = () => {
    if (totalWeight !== 100) {
      toast.error("⚠️ סה״כ המשקלות חייב להיות 100%");
      return;
    }
    toast.success("✅ ההגדרות נשמרו בהצלחה");
  };

  // Calculate weighted scores for services and return top 4
  const rankedServices = useMemo(() => {
    return MOCK_SERVICES.map((service) => {
      const score = service.scores.reduce(
        (sum, s, i) => sum + (s * weights[i]) / 100,
        0
      );
      return { ...service, score };
    })
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [weights]);

  const maxScore = useMemo(
    () => Math.max(...rankedServices.map((s) => s.score), 1),
    [rankedServices]
  );

  return (
    <AppLayout
      title="אלגוריתם התאמה"
      subtitle="הגדרת משקלות 5 שכבות ההתאמה וצפייה בתוצאות בזמן אמת"
    >
      {/* ── Header Explanation ── */}
      <Card className="mb-6">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-1">איך עובד האלגוריתם?</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              אלגוריתם ההתאמה מדרג שירותים לפי 5 שכבות מדיניות. כל שכבה מקבלת משקל שקובע את
              חשיבותה בדירוג הסופי. שנו את המשקלות כדי לראות כיצד משתנות ההמלצות בזמן אמת.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* ── Sliders Section (3/5 width on xl) ── */}
        <div className="xl:col-span-3 space-y-6">
          <Card>
            <CardHeader
              title="שכבות האלגוריתם"
              subtitle="התאם את המשקל של כל שכבה (סה״כ צריך להיות 100%)"
              action={
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  איפוס
                </button>
              }
            />

            <div className="space-y-5">
              {LAYERS.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <div key={layer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${layer.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: layer.color }} />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-foreground">
                            {layer.emoji} {layer.label}
                          </span>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {layer.description}
                          </p>
                        </div>
                      </div>
                      <span
                        className="text-sm font-bold tabular-nums min-w-[4ch] text-left rounded-md px-2 py-0.5"
                        style={{ backgroundColor: `${layer.color}15`, color: layer.color }}
                      >
                        {weights[index]}%
                      </span>
                    </div>

                    {/* Slider with colored track */}
                    <div className="relative h-3 flex items-center">
                      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-150"
                          style={{
                            width: `${(weights[index] / 50) * 100}%`,
                            backgroundColor: layer.color,
                          }}
                        />
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={50}
                        step={5}
                        value={weights[index]}
                        onChange={(e) =>
                          handleSliderChange(index, Number(e.target.value))
                        }
                        className="absolute inset-0 w-full h-3 opacity-0 cursor-pointer"
                        aria-label={layer.label}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total indicator */}
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">סה״כ משקלות:</span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-base font-bold tabular-nums",
                    totalWeight === 100 ? "text-green-600" : "text-red-600"
                  )}
                >
                  {totalWeight}%
                </span>
                {totalWeight !== 100 && (
                  <Chip tone="destructive" className="text-xs">
                    ⚠️ חייב להיות 100%
                  </Chip>
                )}
                {totalWeight === 100 && (
                  <Chip tone="success" className="text-xs">
                    ✓ תקין
                  </Chip>
                )}
              </div>
            </div>
          </Card>

          {/* Save button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                totalWeight === 100
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              disabled={totalWeight !== 100}
            >
              <Save className="w-4 h-4" />
              שמור הגדרות
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              איפוס לברירת מחדל
            </button>
          </div>
        </div>

        {/* ── Live Preview Section (2/5 width on xl) ── */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader
              title="תצוגה מקדימה חיה"
              subtitle="דוגמה: שרה כהן"
            />

            {/* Client profile mini-card */}
            <div className="mb-5 p-3 rounded-xl border border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  שכ
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">שרה כהן</div>
                  <div className="text-xs text-muted-foreground">
                    בת 78 · בדידות · ניידות עם הליכון · קטגינה
                  </div>
                </div>
              </div>
            </div>

            {/* Ranked services */}
            <div className="space-y-3">
              {rankedServices.map((service, idx) => (
                <div
                  key={service.name}
                  className={cn(
                    "rounded-xl border p-4 transition-all duration-300",
                    idx === 0
                      ? "border-primary/30 bg-primary/5 shadow-sm"
                      : "border-border hover:shadow-sm"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
                          idx === 0
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-foreground">
                          {service.name}
                        </span>
                        <div className="mt-0.5">
                          <Chip tone="muted" className="text-[10px]">
                            {service.domain}
                          </Chip>
                        </div>
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {service.score.toFixed(0)}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        idx === 0 ? "bg-primary" : "bg-primary/60"
                      )}
                      style={{
                        width: `${(service.score / maxScore) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Layer breakdown for top result */}
                  {idx === 0 && (
                    <div className="mt-3 pt-2 border-t border-border/50 flex flex-wrap gap-1.5">
                      {LAYERS.map((layer, li) => (
                        <span
                          key={layer.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: `${layer.color}15`,
                            color: layer.color,
                          }}
                        >
                          {layer.emoji} {service.scores[li]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info note */}
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <Sparkles className="w-3 h-3 inline-block ml-1" />
                הדירוג מתעדכן בזמן אמת בהתאם למשקלות שנבחרו. בסביבת הייצור, הציונים מחושבים
                על בסיס נתוני הלקוח בפועל.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
