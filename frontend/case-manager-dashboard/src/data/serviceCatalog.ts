export type ServiceDomain =
  | "belonging_meaning"    // שייכות ומשמעות
  | "function_health"      // תפקוד ובריאות
  | "personal_resilience"  // חוסן אישי וכלכלי
  | "digital"              // דיגיטציה תומכת
  | "assistive_products";  // מוצרים מסייעים

export interface CatalogService {
  id: string;
  name: string;
  domain: ServiceDomain;
  category: string;
  description: string;
  level: "local" | "regional" | "national"; // 🟢 🟡 🔴
  preventionScore: number; // 1-10 how much it prevents deterioration
  meaningTags: string[];
  unitCost: number; // in basket units
  subsidyPercent: number;
  isGroupActivity: boolean;
  minFunctionalLevel: number; // 1-5, minimum mobility needed
}

export const SERVICE_DOMAINS: Record<ServiceDomain, { label: string; emoji: string; color: string }> = {
  belonging_meaning: { label: "שייכות ומשמעות", emoji: "🤝", color: "#3b82f6" },
  function_health: { label: "תפקוד ובריאות", emoji: "💪", color: "#22c55e" },
  personal_resilience: { label: "חוסן אישי", emoji: "🛡️", color: "#8b5cf6" },
  digital: { label: "דיגיטציה תומכת", emoji: "📱", color: "#0ea5e9" },
  assistive_products: { label: "מוצרים מסייעים", emoji: "🔧", color: "#f59e0b" },
};

export const CATALOG_SERVICES: CatalogService[] = [
  // Domain 1: שייכות ומשמעות (12 services)
  { id: "cs1", name: "מועדון חברתי שכונתי", domain: "belonging_meaning", category: "חיבור חברתי", description: "מפגשים חברתיים שבועיים עם ארוחה, משחקים ופעילות", level: "local", preventionScore: 8, meaningTags: ["חברה"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs2", name: "קבוצות עניין משותפות", domain: "belonging_meaning", category: "חיבור חברתי", description: "קבוצות לפי תחומי עניין — שירה, ספרות, תנ\"ך, גינון", level: "local", preventionScore: 7, meaningTags: ["מוזיקה", "למידה"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs3", name: "קבוצות הליכה", domain: "belonging_meaning", category: "חיבור חברתי", description: "הליכה קבוצתית בפארק עם מדריך בקצב מותאם", level: "local", preventionScore: 9, meaningTags: ["טבע", "ספורט", "חברה"], unitCost: 1, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 3 },
  { id: "cs4", name: "פעילויות בין-דוריות", domain: "belonging_meaning", category: "חיבור חברתי", description: "מפגשים עם בני נוער — שיחות, משחקים, למידה הדדית", level: "regional", preventionScore: 8, meaningTags: ["נכדים", "התנדבות"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs5", name: "התנדבות מותאמת", domain: "belonging_meaning", category: "תעסוקה והתנדבות", description: "התנדבות בהתאם ליכולות — חונכות, סיוע, הדרכה", level: "local", preventionScore: 9, meaningTags: ["התנדבות"], unitCost: 1, subsidyPercent: 100, isGroupActivity: false, minFunctionalLevel: 2 },
  { id: "cs6", name: "תעסוקה חלקית למבוגרים", domain: "belonging_meaning", category: "תעסוקה והתנדבות", description: "עבודה חלקית מותאמת — ייעוץ, הדרכה, מכירות", level: "regional", preventionScore: 7, meaningTags: ["למידה"], unitCost: 0, subsidyPercent: 100, isGroupActivity: false, minFunctionalLevel: 3 },
  { id: "cs7", name: "חונכות ומנטורינג", domain: "belonging_meaning", category: "תעסוקה והתנדבות", description: "העברת ידע מקצועי לדור הצעיר", level: "national", preventionScore: 8, meaningTags: ["התנדבות", "למידה"], unitCost: 1, subsidyPercent: 100, isGroupActivity: false, minFunctionalLevel: 2 },
  { id: "cs8", name: "פעילויות תרבות מקומיות", domain: "belonging_meaning", category: "תרבות והעשרה", description: "הופעות, הרצאות, סרטים, מוזיקה חיה", level: "local", preventionScore: 6, meaningTags: ["מוזיקה", "אומנות"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 1 },
  { id: "cs9", name: "למידה לאורך החיים", domain: "belonging_meaning", category: "תרבות והעשרה", description: "קורסים, סדנאות, הרצאות בנושאים מגוונים", level: "regional", preventionScore: 7, meaningTags: ["למידה"], unitCost: 3, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs10", name: "טיולים וסיורים", domain: "belonging_meaning", category: "תרבות והעשרה", description: "טיולים מאורגנים מותאמים עם הסעה ונגישות", level: "regional", preventionScore: 7, meaningTags: ["טבע", "חברה"], unitCost: 4, subsidyPercent: 80, isGroupActivity: true, minFunctionalLevel: 3 },
  { id: "cs11", name: "חוגי יצירה וביטוי", domain: "belonging_meaning", category: "תרבות והעשרה", description: "ציור, קרמיקה, כתיבה יוצרת, צילום", level: "local", preventionScore: 7, meaningTags: ["אומנות"], unitCost: 3, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 1 },
  { id: "cs12", name: "מקהלה קהילתית", domain: "belonging_meaning", category: "תרבות והעשרה", description: "שירה בקבוצה עם מנצח — שירים ישראליים וקלאסיים", level: "local", preventionScore: 8, meaningTags: ["מוזיקה", "חברה"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 1 },

  // Domain 2: תפקוד ובריאות (12 services)
  { id: "cs13", name: "התעמלות מותאמת לגיל", domain: "function_health", category: "כושר גופני", description: "שיעור התעמלות בקבוצה קטנה עם מדריך מוסמך", level: "local", preventionScore: 9, meaningTags: ["ספורט"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs14", name: "הידרותרפיה / בריכה", domain: "function_health", category: "כושר גופני", description: "פעילות מים בהדרכת פיזיותרפיסט בבריכה מחוממת", level: "local", preventionScore: 9, meaningTags: ["ספורט"], unitCost: 3, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs15", name: "יוגה / פילאטיס לגיל השלישי", domain: "function_health", category: "כושר גופני", description: "יוגה עדינה מותאמת כולל תרגילים על כיסא", level: "local", preventionScore: 8, meaningTags: ["ספורט"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs16", name: "אימון כוח ואיזון", domain: "function_health", category: "כושר גופני", description: "תרגילי חיזוק ואיזון למניעת נפילות", level: "local", preventionScore: 10, meaningTags: ["ספורט"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 3 },
  { id: "cs17", name: "אימון מוח וזיכרון", domain: "function_health", category: "בריאות קוגניטיבית", description: "תרגילי חשיבה, זיכרון ותפקודים ניהוליים", level: "regional", preventionScore: 8, meaningTags: ["למידה"], unitCost: 3, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 1 },
  { id: "cs18", name: "משחקי חשיבה קבוצתיים", domain: "function_health", category: "בריאות קוגניטיבית", description: "שחמט, סודוקו, חידות, טריוויה בקבוצה", level: "local", preventionScore: 7, meaningTags: ["למידה", "חברה"], unitCost: 1, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 1 },
  { id: "cs19", name: "ייעוץ תזונה מותאם", domain: "function_health", category: "תזונה ואורח חיים", description: "דיאטנית קלינית — תפריט אישי למצב בריאותי", level: "regional", preventionScore: 7, meaningTags: ["בישול"], unitCost: 4, subsidyPercent: 80, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs20", name: "סדנאות בישול בריא", domain: "function_health", category: "תזונה ואורח חיים", description: "בישול בריא בקבוצה — מתכונים מותאמים", level: "local", preventionScore: 6, meaningTags: ["בישול", "חברה"], unitCost: 3, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs21", name: "התאמת הבית למניעת נפילות", domain: "function_health", category: "בטיחות ומניעה", description: "מאחזי יד, תאורה, הסרת מכשולים, מדרגות", level: "local", preventionScore: 10, meaningTags: [], unitCost: 6, subsidyPercent: 80, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs22", name: "פיזיותרפיה בבית", domain: "function_health", category: "בטיחות ומניעה", description: "פיזיותרפיסט מגיע לבית — תרגילים ושיקום", level: "local", preventionScore: 9, meaningTags: ["ספורט"], unitCost: 5, subsidyPercent: 80, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs23", name: "בדיקות בריאות מונעות", domain: "function_health", category: "בטיחות ומניעה", description: "בדיקות תקופתיות — לחץ דם, סוכר, שמיעה, ראייה", level: "local", preventionScore: 8, meaningTags: [], unitCost: 3, subsidyPercent: 100, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs24", name: "סדנת מניעת נפילות", domain: "function_health", category: "בטיחות ומניעה", description: "קורס 8 מפגשים — איזון, חיזוק, מודעות", level: "local", preventionScore: 10, meaningTags: ["ספורט"], unitCost: 2, subsidyPercent: 100, isGroupActivity: true, minFunctionalLevel: 2 },

  // Domain 3: חוסן אישי וכלכלי (10 services)
  { id: "cs25", name: "ייעוץ למיצוי זכויות", domain: "personal_resilience", category: "יציבות כלכלית", description: "בדיקת זכאויות — ביטוח לאומי, קופ\"ח, רשות", level: "regional", preventionScore: 6, meaningTags: [], unitCost: 3, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs26", name: "סיוע בירוקרטי", domain: "personal_resilience", category: "יציבות כלכלית", description: "עזרה במילוי טפסים, פניות לגורמים, מעקב", level: "local", preventionScore: 5, meaningTags: [], unitCost: 2, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs27", name: "תמיכה נפשית", domain: "personal_resilience", category: "חוסן נפשי", description: "שיחות תמיכה עם עו\"ס או פסיכולוג", level: "local", preventionScore: 8, meaningTags: [], unitCost: 4, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs28", name: "קבוצות תמיכה נושאיות", domain: "personal_resilience", category: "חוסן נפשי", description: "קבוצות לאלמנות, מטפלים, חולים כרוניים", level: "local", preventionScore: 8, meaningTags: ["חברה"], unitCost: 2, subsidyPercent: 50, isGroupActivity: true, minFunctionalLevel: 1 },
  { id: "cs29", name: "טיפול באבל ואובדן", domain: "personal_resilience", category: "חוסן נפשי", description: "ליווי מקצועי בתהליכי אובדן ושינוי", level: "regional", preventionScore: 7, meaningTags: [], unitCost: 4, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs30", name: "שירותי עזר ביתיים", domain: "personal_resilience", category: "עצמאות יומיומית", description: "ניקיון, כביסה, סידור הבית", level: "local", preventionScore: 4, meaningTags: [], unitCost: 4, subsidyPercent: 20, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs31", name: "ליווי לרופאים ומוסדות", domain: "personal_resilience", category: "עצמאות יומיומית", description: "מלווה אישי לתורים, בנקים, מוסדות", level: "local", preventionScore: 5, meaningTags: [], unitCost: 3, subsidyPercent: 20, isGroupActivity: false, minFunctionalLevel: 1 },

  // Domain 4: דיגיטציה תומכת (8 services)
  { id: "cs32", name: "הדרכת סמארטפון בסיסית", domain: "digital", category: "אוריינות דיגיטלית", description: "שיחות, הודעות, מצלמה, וואטסאפ", level: "local", preventionScore: 6, meaningTags: ["טכנולוגיה"], unitCost: 3, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs33", name: "שימוש באפליקציות יומיומיות", domain: "digital", category: "אוריינות דיגיטלית", description: "בנקאות, קופ\"ח, מונית, קניות", level: "regional", preventionScore: 5, meaningTags: ["טכנולוגיה"], unitCost: 3, subsidyPercent: 50, isGroupActivity: true, minFunctionalLevel: 2 },
  { id: "cs34", name: "תמיכה טכנית בבית", domain: "digital", category: "תמיכה טכנית", description: "טכנאי מגיע לבית — התקנה, תיקון, הדרכה", level: "local", preventionScore: 4, meaningTags: ["טכנולוגיה"], unitCost: 3, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs35", name: "וידאו-שיחות עם המשפחה", domain: "digital", category: "קישוריות חברתית", description: "הדרכה והתקנה לשיחות וידאו עם ילדים ונכדים", level: "national", preventionScore: 7, meaningTags: ["טכנולוגיה", "משפחה", "נכדים"], unitCost: 2, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },

  // Domain 5: מוצרים מסייעים (8 services)
  { id: "cs36", name: "מכשירי שמיעה מתקדמים", domain: "assistive_products", category: "שיפור חושים", description: "מכשיר שמיעה דיגיטלי מותאם אישית", level: "national", preventionScore: 8, meaningTags: [], unitCost: 12, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs37", name: "לחצן מצוקה אישי", domain: "assistive_products", category: "בטיחות", description: "שרשרת/צמיד עם כפתור מצוקה + מוקד 24/7", level: "national", preventionScore: 9, meaningTags: ["טכנולוגיה"], unitCost: 4, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs38", name: "חיישני נפילה חכמים", domain: "assistive_products", category: "בטיחות", description: "חיישנים בבית לזיהוי נפילות + התראה אוטומטית", level: "national", preventionScore: 9, meaningTags: ["טכנולוגיה"], unitCost: 5, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs39", name: "תאורה אוטומטית ללילה", domain: "assistive_products", category: "בטיחות", description: "תאורת לילה חכמה עם חיישני תנועה", level: "national", preventionScore: 7, meaningTags: ["טכנולוגיה"], unitCost: 3, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
  { id: "cs40", name: "אפליקציית תזכורת תרופות", domain: "assistive_products", category: "טכנולוגיות מסייעות", description: "אפליקציה עם תזכורות, מעקב ודיווח למשפחה", level: "national", preventionScore: 7, meaningTags: ["טכנולוגיה"], unitCost: 2, subsidyPercent: 50, isGroupActivity: false, minFunctionalLevel: 1 },
];

// Helper to get services by domain
export function getServicesByDomain(domain: ServiceDomain): CatalogService[] {
  return CATALOG_SERVICES.filter(s => s.domain === domain);
}

// Helper to recommend services based on client profile
export function recommendServices(profile: {
  meaningTags: string[];
  functionalLevel: number;
  riskFlags: string[];
  lonelinessScore: number;
}): CatalogService[] {
  return CATALOG_SERVICES
    .filter(s => s.minFunctionalLevel <= profile.functionalLevel)
    .map(s => {
      let score = s.preventionScore * 3;
      // Meaning match
      const matchedTags = s.meaningTags.filter(t => profile.meaningTags.includes(t));
      score += matchedTags.length * 10;
      // Loneliness boost for group activities
      if (profile.lonelinessScore <= 4 && s.isGroupActivity) score += 15;
      // Risk flag boost
      if (profile.riskFlags.includes("fall_risk") && s.name.includes("נפילות")) score += 20;
      if (profile.riskFlags.includes("loneliness") && s.isGroupActivity) score += 15;
      if (profile.riskFlags.includes("cognitive_decline") && s.category.includes("קוגניטיב")) score += 15;
      return { ...s, _score: score };
    })
    .sort((a, b) => (b as any)._score - (a as any)._score)
    .slice(0, 8);
}
