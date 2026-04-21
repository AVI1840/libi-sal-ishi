// LEV (לב) - Optimal Aging OS
// Shared Data Types and Mock Data

// ===========================================
// Content Worlds (עולמות תוכן)
// ===========================================

export type ContentWorld =
  | 'belonging_meaning'   // שייכות ומשמעות
  | 'health_function'     // בריאות ותפקוד
  | 'resilience'          // חוסן ועצמאות
  | 'assistive_tech'      // מוצרים וטכנולוגיה מסייעת
  | 'home_services';      // שירותי בית

export const CONTENT_WORLD_LABELS: Record<ContentWorld, string> = {
  belonging_meaning: 'שייכות ומשמעות',
  health_function: 'בריאות ותפקוד',
  resilience: 'חוסן ועצמאות',
  assistive_tech: 'מוצרים וטכנולוגיה מסייעת',
  home_services: 'שירותי בית',
};

export const CONTENT_WORLD_ICONS: Record<ContentWorld, string> = {
  belonging_meaning: '🤝',
  health_function: '💪',
  resilience: '🛡️',
  assistive_tech: '📱',
  home_services: '🏠',
};

// ===========================================
// Subsidy Tiers (טיירי סבסוד)
// ===========================================

export type SubsidyTier = 'full' | 'partial' | 'minimal' | 'none';

export const SUBSIDY_PERCENTAGES: Record<SubsidyTier, number> = {
  full: 100,
  partial: 50,
  minimal: 20,
  none: 0,
};

export const CONTENT_WORLD_SUBSIDY: Record<ContentWorld, SubsidyTier> = {
  belonging_meaning: 'full',
  health_function: 'full',
  resilience: 'partial',
  assistive_tech: 'partial',
  home_services: 'minimal',
};

// ===========================================
// Meaning Tags (תגיות משמעות)
// ===========================================

export type MeaningTag =
  | 'music' | 'nature' | 'faith' | 'family' | 'volunteering'
  | 'art' | 'learning' | 'social' | 'cooking' | 'gardening'
  | 'pets' | 'sports' | 'technology' | 'grandchildren';

export const MEANING_TAG_LABELS: Record<MeaningTag, string> = {
  music: '🎵 מוזיקה',
  nature: '🌳 טבע',
  faith: '🕯️ אמונה ורוחניות',
  family: '👨‍👩‍👧 משפחה',
  volunteering: '💝 התנדבות',
  art: '🎨 אומנות ויצירה',
  learning: '📚 למידה',
  social: '🤝 חיים חברתיים',
  cooking: '🍳 בישול',
  gardening: '🌱 גינון',
  pets: '🐕 חיות',
  sports: '🏃 ספורט',
  technology: '📱 טכנולוגיה',
  grandchildren: '👶 נכדים',
};

// ===========================================
// ICF Profile (פרופיל תפקודי)
// ===========================================

export type MobilityLevel = 'independent' | 'assisted_device' | 'human_assisted';
export type SensoryLevel = 'intact' | 'hearing_impaired' | 'visual_impaired' | 'both_impaired';
export type DigitalLiteracy = 'none' | 'basic' | 'advanced';

export interface ICFProfile {
  mobility: MobilityLevel;
  sensory: SensoryLevel;
  digitalLiteracy: DigitalLiteracy;
  cognitiveScore: number; // 1-5
  socialScore: number; // 1-5
}

// ===========================================
// Persona Types (פרסונות)
// ===========================================

export type PersonaType =
  | 'social_butterfly'    // נהנה מפעילות חברתית
  | 'security_seeker'     // מעדיף ביטחון ושגרה
  | 'independent_spirit'  // שואף לשמור על עצמאות
  | 'family_oriented'     // קשר משפחתי חשוב מאוד
  | 'learner'             // אוהב ללמוד דברים חדשים
  | 'caregiver';          // אוהב לעזור לאחרים

export const PERSONA_LABELS: Record<PersonaType, string> = {
  social_butterfly: 'נהנה/ית מפעילות חברתית',
  security_seeker: 'מעדיף/ה ביטחון ושגרה',
  independent_spirit: 'שואף/ת לשמור על עצמאות',
  family_oriented: 'קשר משפחתי חשוב מאוד',
  learner: 'אוהב/ת ללמוד דברים חדשים',
  caregiver: 'אוהב/ת לעזור לאחרים',
};

// ===========================================
// Risk Flags (דגלי סיכון)
// ===========================================

export type RiskFlagType =
  | 'loneliness' | 'fall_risk' | 'recent_hospitalization'
  | 'cognitive_decline' | 'financial_risk' | 'inactive';

export const RISK_FLAG_LABELS: Record<RiskFlagType, string> = {
  loneliness: 'ייהנה מפעילות חברתית',
  fall_risk: 'חשוב לוודא נגישות',
  recent_hospitalization: 'דורש מעקב צמוד',
  cognitive_decline: 'מתאים לפעילות קוגניטיבית',
  financial_risk: 'כדאי לבדוק זכויות',
  inactive: 'דורש יצירת קשר',
};

// ===========================================
// Lev Profile (פרופיל לב)
// ===========================================

export interface LevProfile {
  meaningTags: MeaningTag[];
  coreDream?: string;
  lonelinessScore: number; // 1-10
  prefersGroupActivities: boolean;
  goals: string[];
  icf: ICFProfile;
  persona: PersonaType;
  secondaryPersonas: PersonaType[];
  keyTraits: string[];
  engagementTips: string[];
  riskFlags: RiskFlagType[];
}

// ===========================================
// Extended Client with Lev Profile
// ===========================================

export type FunctionalLevel = 'independent' | 'partial' | 'significant';

export interface FunctionalProfile {
  mobility: FunctionalLevel;
  dailyFunction: FunctionalLevel;
  cognition: FunctionalLevel;
  cognitive: number;
  emotional: FunctionalLevel;
  social: number;
  vision: number;
  hearing: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface Client {
  id: string;
  name: string;
  age: number;
  city: string;
  functionalProfile: FunctionalProfile;
  walletBalance: number;
  walletUsed: number;
  walletTotal: number;
  totalUnits: number;
  nursingLevel: number;
  status: 'green' | 'yellow' | 'red';
  lastActivity: string;
  preferences: string[];
  goals: string[];
  phone: string;
  emergencyContact: EmergencyContact;
  conditions: string[];
  // Lev Profile extension
  levProfile?: LevProfile;
  hasIncomeSuppelement?: boolean;
  lastActivityDate?: string;
}

export interface Service {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  price: number;
  unitCost: number; // price in units for vendor-portal
  fundingSource: 'סל' | 'ביטוח' | 'פרטי' | 'סל+ביטוח';
  category: 'health' | 'fitness' | 'social' | 'culture' | 'prevention';
  tags: string[];
  rating: number;
  reviews: number;
  imageUrl: string;
  distanceMinutes: number;
  communityCount: number;
  included: string[];
  availability: string[];
  vendorId?: string;
  vendorName?: string;
  // Lev extension
  contentWorld?: ContentWorld;
  meaningTags?: MeaningTag[];
  isGroupActivity?: boolean;
  isPreventive?: boolean;
  subsidyTier?: SubsidyTier;
  subsidizedPrice?: number;
  icfRequirements?: {
    maxMobility?: MobilityLevel;
    maxSensory?: SensoryLevel;
    minCognitiveScore?: number;
    minDigitalLiteracy?: DigitalLiteracy;
  };
}

export interface Vendor {
  id: string;
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  services: Service[];
  rating: number;
  totalBookings: number;
  pendingPayments: number;
  isVerified: boolean;
  serviceAreas: string[];
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string; // for reports
  clientId: string;
  clientName: string;
  vendorId: string;
  vendorName: string;
  date: string;
  time: string;
  scheduledDate: string; // ISO date string for case-manager
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  price: number;
  unitsCost: number; // cost in units
  notes?: string;
}

// Generate 75 realistic clients
const firstNames = ['יוסף', 'שרה', 'משה', 'רחל', 'דוד', 'מרים', 'אברהם', 'לאה', 'יעקב', 'רבקה', 'שמעון', 'דינה', 'יהודה', 'תמר', 'בנימין', 'אסתר', 'נחום', 'רות', 'אליהו', 'נעמי', 'חיים', 'ציפורה', 'מנחם', 'בתיה', 'שלמה'];
const lastNames = ['כהן', 'לוי', 'מזרחי', 'פרץ', 'ביטון', 'אברהם', 'גבאי', 'אוחיון', 'דהן', 'חדד', 'עמר', 'שטרית', 'אזולאי', 'בוחבוט', 'מלכה', 'סויסה', 'טובול', 'אלון', 'רוזנברג', 'גולדשטיין'];
const cities = ['תל אביב', 'ירושלים', 'חיפה', 'באר שבע', 'רמת גן', 'הרצליה', 'נתניה', 'אשדוד', 'פתח תקווה', 'ראשון לציון'];
const preferences = ['פעילות בוקר', 'קבוצות קטנות', 'בעברית', 'קרוב לבית', 'עם הסעה', 'פעילות שקטה', 'פעילות חברתית', 'בחוץ', 'בבית', 'עם מוזיקה'];
const goals = ['שמירה על כושר', 'הרחבת חיי חברה', 'שיפור זיכרון', 'הפחתת בדידות', 'טיפול עצמי', 'לימוד דברים חדשים', 'שמירה על עצמאות', 'חיזוק שרירים'];

const functionalLevels: FunctionalLevel[] = ['independent', 'partial', 'significant'];
const familyRelations = ['בן', 'בת', 'נכד', 'נכדה', 'אח', 'אחות', 'בן זוג', 'בת זוג'];
const medicalConditions = ['סוכרת', 'לחץ דם גבוה', 'אוסטאופורוזיס', 'דלקת פרקים', 'בעיות לב', 'מחלת ריאות'];

// Lev profile generation helpers
const meaningTagOptions: MeaningTag[] = ['music', 'nature', 'faith', 'family', 'volunteering', 'art', 'learning', 'social', 'cooking', 'gardening', 'pets', 'sports', 'technology', 'grandchildren'];
const personaOptions: PersonaType[] = ['social_butterfly', 'security_seeker', 'independent_spirit', 'family_oriented', 'learner', 'caregiver'];
const riskFlagOptions: RiskFlagType[] = ['loneliness', 'fall_risk', 'recent_hospitalization', 'cognitive_decline', 'financial_risk', 'inactive'];
const mobilityOptions: MobilityLevel[] = ['independent', 'assisted_device', 'human_assisted'];
const sensoryOptions: SensoryLevel[] = ['intact', 'hearing_impaired', 'visual_impaired', 'both_impaired'];
const digitalOptions: DigitalLiteracy[] = ['none', 'basic', 'advanced'];
const coreDreams = [
  'לראות את הנכדים גדלים',
  'לחזור לשחות בים',
  'ללמוד לנגן בפסנתר',
  'לכתוב את סיפור חיי',
  'לטייל עוד בארץ',
  'להתנדב ולעזור לאחרים',
  'ללמוד להשתמש במחשב',
  'לשמור על עצמאות כמה שיותר',
  'להכיר חברים חדשים',
  'לחזור לגנן',
  undefined // Some don't have a specific dream
];

const keyTraitsOptions = [
  'אוהב/ת לספר סיפורים',
  'מאוד אדיב/ה',
  'צריך/ה זמן להתחמם',
  'אוהב/ת שגרה קבועה',
  'נהנה/ית מהומור',
  'רגיש/ה לרעש',
  'אוהב/ת מוזיקה',
  'נהנה/ית מבישול',
  'אוהב/ת לעזור',
  'שומר/ת על כבוד',
];

const engagementTipsOptions = [
  'להתקשר בבוקר',
  'לדבר לאט וברור',
  'להזכיר את שם הנכד דני',
  'לשאול על הגינה',
  'לא לדבר על בריאות בהתחלה',
  'להציע תה בפגישה',
  'להזמין את הבת לשיחה',
  'להציע ליווי לפעילות ראשונה',
  'להתקשר אחרי שבת',
  'לשלוח תזכורת ביום לפני',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateLevProfile(clientAge: number, socialScore: number): LevProfile {
  const lonelinessScore = Math.max(1, Math.min(10, 10 - socialScore * 2 + randomInt(-1, 1)));
  const meaningTags = randomSubset(meaningTagOptions, 2, 5);
  const persona = randomFrom(personaOptions);

  // Risk flags based on some logic
  const riskFlags: RiskFlagType[] = [];
  if (lonelinessScore >= 7) riskFlags.push('loneliness');
  if (clientAge >= 82) riskFlags.push('fall_risk');
  if (randomInt(1, 10) === 1) riskFlags.push('recent_hospitalization');
  if (randomInt(1, 8) === 1) riskFlags.push('cognitive_decline');
  if (randomInt(1, 15) === 1) riskFlags.push('inactive');

  return {
    meaningTags,
    coreDream: randomFrom(coreDreams),
    lonelinessScore,
    prefersGroupActivities: persona === 'social_butterfly' || socialScore >= 4,
    goals: randomSubset(goals, 1, 3),
    icf: {
      mobility: clientAge >= 80 ? randomFrom(['assisted_device', 'human_assisted'] as MobilityLevel[]) : randomFrom(mobilityOptions),
      sensory: clientAge >= 85 ? randomFrom(sensoryOptions.filter(s => s !== 'intact')) : randomFrom(sensoryOptions),
      digitalLiteracy: clientAge >= 82 ? randomFrom(['none', 'basic'] as DigitalLiteracy[]) : randomFrom(digitalOptions),
      cognitiveScore: Math.max(1, 5 - Math.floor((clientAge - 65) / 10) + randomInt(-1, 1)),
      socialScore,
    },
    persona,
    secondaryPersonas: randomSubset(personaOptions.filter(p => p !== persona), 0, 2),
    keyTraits: randomSubset(keyTraitsOptions, 2, 4),
    engagementTips: randomSubset(engagementTipsOptions, 2, 4),
    riskFlags,
  };
}

export const clients: Client[] = Array.from({ length: 75 }, (_, i) => {
  const walletTotal = randomInt(20, 50); // units, not NIS
  const walletUsed = randomInt(2, walletTotal - 5);
  const walletBalance = walletTotal - walletUsed;
  const nursingLevel = randomInt(1, 3); // Lev targets levels 1-3
  const status = walletBalance < 5 ? 'red' : walletBalance < 15 ? 'yellow' : 'green';
  const age = randomInt(65, 92);
  const socialScore = randomInt(1, 5);
  const daysAgo = randomInt(1, 30);
  const lastActivityDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

  return {
    id: `client-${i + 1}`,
    name: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
    age,
    city: randomFrom(cities),
    functionalProfile: {
      mobility: randomFrom(functionalLevels),
      dailyFunction: randomFrom(functionalLevels),
      cognition: randomFrom(functionalLevels),
      cognitive: randomInt(1, 5),
      emotional: randomFrom(functionalLevels),
      social: randomInt(1, 5),
      vision: randomInt(2, 5),
      hearing: randomInt(2, 5),
    },
    walletBalance,
    walletUsed,
    walletTotal,
    totalUnits: walletTotal,
    nursingLevel,
    status,
    lastActivity: `לפני ${randomInt(1, 14)} ימים`,
    preferences: Array.from({ length: randomInt(2, 4) }, () => randomFrom(preferences)),
    goals: Array.from({ length: randomInt(1, 3) }, () => randomFrom(goals)),
    phone: `05${randomInt(0, 9)}-${randomInt(1000000, 9999999)}`,
    emergencyContact: {
      name: `${randomFrom(firstNames)} ${randomFrom(lastNames)}`,
      phone: `05${randomInt(0, 9)}-${randomInt(1000000, 9999999)}`,
      relation: randomFrom(familyRelations),
    },
    conditions: Array.from({ length: randomInt(0, 3) }, () => randomFrom(medicalConditions)),
    // Lev Profile
    levProfile: generateLevProfile(age, socialScore),
    hasIncomeSuppelement: randomInt(1, 3) === 1, // ~33% have income supplement
    lastActivityDate,
  };
});

// 30+ Services with Lev data
const rawServices = [
  {
    id: 'service-1',
    name: 'פיזיותרפיה בבית',
    shortDesc: 'טיפול פיזיותרפי אישי בנוחות הבית',
    longDesc: 'פיזיותרפיסט מוסמך מגיע לביתך לטיפול אישי הכולל תרגילים, עיסוי והדרכה',
    price: 280,
    fundingSource: 'סל' as const,
    category: 'health' as const,
    tags: ['בריאות', 'בבית', 'אישי'],
    rating: 4.9,
    reviews: 234,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    distanceMinutes: 0,
    communityCount: 156,
    included: ['הערכה ראשונית', '45 דקות טיפול', 'תוכנית תרגילים אישית', 'מעקב התקדמות'],
    availability: ['ראשון 08:00-12:00', 'שלישי 14:00-18:00', 'חמישי 09:00-13:00'],
    // Lev extension
    contentWorld: 'health_function' as ContentWorld,
    meaningTags: ['sports'] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: true,
  },
  {
    id: 'service-2',
    name: 'בריכה טיפולית',
    shortDesc: 'שחייה והידרותרפיה בקבוצות קטנות',
    longDesc: 'פעילות מים בהדרכת פיזיותרפיסט בבריכה מחוממת ונגישה',
    price: 85,
    fundingSource: 'סל+ביטוח' as const,
    category: 'health' as const,
    tags: ['בריאות', 'קבוצתי', 'בריכה'],
    rating: 4.8,
    reviews: 189,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    distanceMinutes: 12,
    communityCount: 89,
    included: ['שימוש במתקנים', 'הדרכה מקצועית', 'מגבת וכפכפים', 'מלתחות מותאמות'],
    availability: ['ראשון-חמישי 07:00-10:00', 'ראשון-חמישי 16:00-19:00'],
    contentWorld: 'health_function' as ContentWorld,
    meaningTags: ['sports', 'social'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
    icfRequirements: { maxMobility: 'assisted_device' as MobilityLevel },
  },
  {
    id: 'service-3',
    name: 'ייעוץ תזונתי',
    shortDesc: 'תוכנית תזונה מותאמת לגיל השלישי',
    longDesc: 'פגישה עם דיאטנית קלינית לבניית תפריט אישי המותאם למצב הבריאותי',
    price: 200,
    fundingSource: 'ביטוח' as const,
    category: 'health' as const,
    tags: ['בריאות', 'תזונה', 'אישי'],
    rating: 4.7,
    reviews: 145,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
    distanceMinutes: 8,
    communityCount: 67,
    included: ['הערכת מצב תזונתי', 'תפריט שבועי', 'רשימת קניות', 'מעקב טלפוני'],
    availability: ['ראשון 09:00-17:00', 'רביעי 09:00-17:00'],
    contentWorld: 'health_function' as ContentWorld,
    meaningTags: ['cooking'] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: true,
  },
  {
    id: 'service-4',
    name: 'יוגה לגיל השלישי',
    shortDesc: 'יוגה עדינה מותאמת עם כיסא',
    longDesc: 'שיעור יוגה מותאם לכל רמות הניידות, כולל תרגילים על כיסא ועל מזרן',
    price: 45,
    fundingSource: 'סל' as const,
    category: 'fitness' as const,
    tags: ['כושר', 'יוגה', 'קבוצתי'],
    rating: 4.9,
    reviews: 312,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800',
    distanceMinutes: 5,
    communityCount: 134,
    included: ['מזרן יוגה', 'רצועות עזר', 'שתייה חמה', 'אווירה נעימה'],
    availability: ['ראשון-חמישי 08:30', 'ראשון-חמישי 17:00'],
    contentWorld: 'health_function' as ContentWorld,
    meaningTags: ['sports', 'social'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-5',
    name: 'הליכה קבוצתית בפארק',
    shortDesc: 'הליכה בקצב מותאם עם חברים',
    longDesc: 'קבוצת הליכה בהנחיית מדריך כושר בפארק הסמוך לביתך',
    price: 25,
    fundingSource: 'סל' as const,
    category: 'fitness' as const,
    tags: ['כושר', 'הליכה', 'חברתי', 'בחוץ'],
    rating: 4.8,
    reviews: 276,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    distanceMinutes: 3,
    communityCount: 203,
    included: ['מדריך מקצועי', 'בקבוק מים', 'ביטוח', 'מסלולים מגוונים'],
    availability: ['ראשון-שישי 06:30', 'ראשון-שישי 18:00'],
    contentWorld: 'belonging_meaning' as ContentWorld,
    meaningTags: ['nature', 'social', 'sports'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
    icfRequirements: { maxMobility: 'assisted_device' as MobilityLevel },
  },
  {
    id: 'service-6',
    name: 'מועדון צהריים חברתי',
    shortDesc: 'ארוחת צהריים וחברה טובה',
    longDesc: 'מפגש חברתי הכולל ארוחת צהריים חמה, משחקים וסדנאות',
    price: 40,
    fundingSource: 'סל' as const,
    category: 'social' as const,
    tags: ['חברתי', 'ארוחה', 'קבוצתי'],
    rating: 4.9,
    reviews: 423,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    distanceMinutes: 6,
    communityCount: 267,
    included: ['ארוחה חמה', 'שתייה', 'פעילות מונחית', 'אווירה חברתית'],
    availability: ['ראשון-חמישי 12:00-15:00'],
    contentWorld: 'belonging_meaning' as ContentWorld,
    meaningTags: ['social', 'cooking'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-7',
    name: 'סדנת ציור ויצירה',
    shortDesc: 'יצירה אומנותית בקבוצה',
    longDesc: 'סדנת ציור והתנסות באומנות עם מדריך מקצועי וחומרים איכותיים',
    price: 60,
    fundingSource: 'סל' as const,
    category: 'culture' as const,
    tags: ['תרבות', 'יצירה', 'קבוצתי'],
    rating: 4.8,
    reviews: 178,
    imageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
    distanceMinutes: 9,
    communityCount: 92,
    included: ['חומרי יצירה', 'בדים', 'הדרכה', 'תערוכה בסיום'],
    availability: ['ראשון 10:00-12:00', 'חמישי 14:00-16:00'],
    contentWorld: 'belonging_meaning' as ContentWorld,
    meaningTags: ['art', 'social'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-8',
    name: 'סדנת מניעת נפילות',
    shortDesc: 'איזון ותרגילים למניעת נפילות',
    longDesc: 'קורס מקיף למניעת נפילות הכולל תרגילי איזון וחיזוק',
    price: 0,
    fundingSource: 'סל' as const,
    category: 'prevention' as const,
    tags: ['מניעה', 'בטיחות', 'קבוצתי'],
    rating: 4.9,
    reviews: 289,
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    distanceMinutes: 6,
    communityCount: 198,
    included: ['8 מפגשים', 'בדיקת איזון', 'תוכנית אישית', 'מעקב'],
    availability: ['שני ורביעי 09:00-10:30'],
    contentWorld: 'resilience' as ContentWorld,
    meaningTags: ['sports'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-9',
    name: 'אימון זיכרון',
    shortDesc: 'תרגילים לשמירה על הזיכרון',
    longDesc: 'סדנה לחיזוק הזיכרון והיכולות הקוגניטיביות עם מטפלת בעיסוק',
    price: 60,
    fundingSource: 'סל+ביטוח' as const,
    category: 'prevention' as const,
    tags: ['מניעה', 'זיכרון', 'קבוצתי'],
    rating: 4.8,
    reviews: 212,
    imageUrl: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800',
    distanceMinutes: 10,
    communityCount: 134,
    included: ['חוברת תרגילים', 'משחקי חשיבה', 'אפליקציה', 'מעקב'],
    availability: ['ראשון 11:00', 'חמישי 11:00'],
    contentWorld: 'resilience' as ContentWorld,
    meaningTags: ['learning'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-10',
    name: 'ליווי לפעילויות',
    shortDesc: 'מלווה אישי לפעילויות מחוץ לבית',
    longDesc: 'מלווה אישי שילווה אותך לקניות, רופאים או פעילויות',
    price: 80,
    fundingSource: 'סל' as const,
    category: 'social' as const,
    tags: ['חברתי', 'ליווי', 'אישי'],
    rating: 4.9,
    reviews: 178,
    imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800',
    distanceMinutes: 0,
    communityCount: 123,
    included: ['2 שעות ליווי', 'הסעה', 'סבלנות והקשבה'],
    availability: ['ראשון-חמישי 08:00-18:00'],
    contentWorld: 'home_services' as ContentWorld,
    meaningTags: ['social'] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: false,
  },
  // Additional services for more content worlds
  {
    id: 'service-11',
    name: 'מקהלת הזהב',
    shortDesc: 'שירה בקבוצה עם מנצח מקצועי',
    longDesc: 'מקהלה לזמן הזהב - שירה קלאסית ומודרנית בעברית',
    price: 35,
    fundingSource: 'סל' as const,
    category: 'culture' as const,
    tags: ['תרבות', 'מוזיקה', 'קבוצתי'],
    rating: 4.9,
    reviews: 156,
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=800',
    distanceMinutes: 8,
    communityCount: 89,
    included: ['תווים', 'אולם אקוסטי', 'הופעות', 'חברה'],
    availability: ['שני 16:00-18:00', 'חמישי 10:00-12:00'],
    contentWorld: 'belonging_meaning' as ContentWorld,
    meaningTags: ['music', 'social'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-12',
    name: 'סדנת סמארטפון למתחילים',
    shortDesc: 'ללמוד להשתמש בטלפון החכם',
    longDesc: 'קורס למידה בקצב אישי - שיחות וידאו, וואטסאפ, תמונות',
    price: 50,
    fundingSource: 'סל' as const,
    category: 'culture' as const,
    tags: ['טכנולוגיה', 'למידה', 'אישי'],
    rating: 4.7,
    reviews: 234,
    imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    distanceMinutes: 0,
    communityCount: 178,
    included: ['8 מפגשים', 'חוברת הדרכה', 'תמיכה טלפונית', 'קבוצות קטנות'],
    availability: ['ראשון 14:00-16:00', 'רביעי 10:00-12:00'],
    contentWorld: 'assistive_tech' as ContentWorld,
    meaningTags: ['technology', 'learning', 'grandchildren'] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: true,
    icfRequirements: { minCognitiveScore: 3 },
  },
  {
    id: 'service-13',
    name: 'התנדבות עם נוער',
    shortDesc: 'ללמד את הדור הצעיר',
    longDesc: 'תוכנית מפגשים בין-דוריים - להעביר ידע ולקבל חברה צעירה',
    price: 0,
    fundingSource: 'סל' as const,
    category: 'social' as const,
    tags: ['התנדבות', 'חברתי', 'משמעות'],
    rating: 5.0,
    reviews: 67,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    distanceMinutes: 12,
    communityCount: 45,
    included: ['תיאום', 'הסעות', 'פעילויות משותפות', 'אירועים'],
    availability: ['שני 15:00-17:00', 'חמישי 15:00-17:00'],
    contentWorld: 'belonging_meaning' as ContentWorld,
    meaningTags: ['volunteering', 'grandchildren', 'learning'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-14',
    name: 'שירותי ניקיון בבית',
    shortDesc: 'עזרה בניקיון הבית',
    longDesc: 'עוזרת בית מקצועית לניקיון שבועי או חד פעמי',
    price: 120,
    fundingSource: 'סל' as const,
    category: 'health' as const,
    tags: ['בית', 'עזרה', 'אישי'],
    rating: 4.6,
    reviews: 312,
    imageUrl: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    distanceMinutes: 0,
    communityCount: 234,
    included: ['3 שעות ניקיון', 'חומרי ניקוי', 'ביטוח'],
    availability: ['ראשון-חמישי 08:00-17:00'],
    contentWorld: 'home_services' as ContentWorld,
    meaningTags: [] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: false,
  },
  {
    id: 'service-15',
    name: 'לחץ דם וסוכר - מעקב חכם',
    shortDesc: 'מכשיר מדידה + אפליקציה למעקב',
    longDesc: 'מכשיר ביתי עם שליחה אוטומטית לרופא המשפחה',
    price: 350,
    fundingSource: 'סל+ביטוח' as const,
    category: 'prevention' as const,
    tags: ['בריאות', 'טכנולוגיה', 'מניעה'],
    rating: 4.8,
    reviews: 189,
    imageUrl: 'https://images.unsplash.com/photo-1559757175-7e9c5f4c0e5c?w=800',
    distanceMinutes: 0,
    communityCount: 156,
    included: ['מכשיר', 'התקנה', 'הדרכה', 'תמיכה שנתית'],
    availability: ['התקנה תוך 3 ימים'],
    contentWorld: 'assistive_tech' as ContentWorld,
    meaningTags: ['technology'] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: true,
    icfRequirements: { minDigitalLiteracy: 'basic' as DigitalLiteracy },
  },
  {
    id: 'service-16',
    name: 'חוג גינון',
    shortDesc: 'לגדל ולטפח בקבוצה',
    longDesc: 'חוג גינון במרכז הקהילתי - גידול ירקות, תבלינים ופרחים',
    price: 30,
    fundingSource: 'סל' as const,
    category: 'social' as const,
    tags: ['גינון', 'טבע', 'קבוצתי'],
    rating: 4.9,
    reviews: 98,
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    distanceMinutes: 7,
    communityCount: 67,
    included: ['כלי גינון', 'זרעים', 'הדרכה', 'תוצרת הביתה'],
    availability: ['שלישי 09:00-11:00', 'חמישי 09:00-11:00'],
    contentWorld: 'belonging_meaning' as ContentWorld,
    meaningTags: ['gardening', 'nature', 'social'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-17',
    name: 'קבוצת שיח ותמיכה',
    shortDesc: 'מרחב לשתף ולהקשיב',
    longDesc: 'קבוצת שיח מונחית על ידי עובד סוציאלי - נושאים שונים בכל מפגש',
    price: 25,
    fundingSource: 'סל' as const,
    category: 'social' as const,
    tags: ['רגשי', 'חברתי', 'תמיכה'],
    rating: 4.8,
    reviews: 134,
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
    distanceMinutes: 5,
    communityCount: 78,
    included: ['הנחייה מקצועית', 'כיבוד', 'סודיות'],
    availability: ['שני 10:00-12:00', 'רביעי 16:00-18:00'],
    contentWorld: 'resilience' as ContentWorld,
    meaningTags: ['social'] as MeaningTag[],
    isGroupActivity: true,
    isPreventive: true,
  },
  {
    id: 'service-18',
    name: 'כפתור מצוקה חכם',
    shortDesc: 'מענה מהיר במקרה חירום',
    longDesc: 'שרשרת או צמיד עם כפתור מצוקה לקריאה מיידית לעזרה',
    price: 99,
    fundingSource: 'סל' as const,
    category: 'prevention' as const,
    tags: ['בטיחות', 'טכנולוגיה', 'מניעה'],
    rating: 4.9,
    reviews: 267,
    imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800',
    distanceMinutes: 0,
    communityCount: 345,
    included: ['מכשיר', 'התקנה', 'מוקד 24/7', 'בדיקה חודשית'],
    availability: ['התקנה תוך יום'],
    contentWorld: 'assistive_tech' as ContentWorld,
    meaningTags: ['technology'] as MeaningTag[],
    isGroupActivity: false,
    isPreventive: true,
  },
];

// Helper function to calculate subsidy
function calculateSubsidy(service: typeof rawServices[0]): { subsidyTier: SubsidyTier; subsidizedPrice: number } {
  const contentWorld = service.contentWorld;
  if (!contentWorld) {
    return { subsidyTier: 'none', subsidizedPrice: service.price };
  }

  const subsidyTier = CONTENT_WORLD_SUBSIDY[contentWorld];
  const subsidyPercent = SUBSIDY_PERCENTAGES[subsidyTier];
  const subsidizedPrice = Math.round(service.price * (1 - subsidyPercent / 100));

  return { subsidyTier, subsidizedPrice };
}

export const services: Service[] = rawServices.map((service, index) => {
  const { subsidyTier, subsidizedPrice } = calculateSubsidy(service);
  return {
    ...service,
    unitCost: Math.max(1, Math.ceil(service.price / 100)),
    vendorId: `vendor-${(index % 3) + 1}`,
    vendorName: ['פיזיותרפיה בית - ד"ר שרה כהן', 'מרכז כושר הגיל השלישי', 'מועדון חברתי לב'][index % 3],
    subsidyTier,
    subsidizedPrice,
  };
});

// Sample vendors
export const vendors: Vendor[] = [
  {
    id: 'vendor-1',
    businessName: 'פיזיותרפיה בית - ד"ר שרה כהן',
    contactName: 'ד"ר שרה כהן',
    email: 'sarah@physio-home.co.il',
    phone: '050-1234567',
    services: services.filter(s => s.category === 'health').slice(0, 2),
    rating: 4.9,
    totalBookings: 156,
    pendingPayments: 2800,
    isVerified: true,
    serviceAreas: ['תל אביב', 'רמת גן', 'גבעתיים'],
  },
  {
    id: 'vendor-2',
    businessName: 'מרכז כושר הגיל השלישי',
    contactName: 'יוסי לוי',
    email: 'yossi@fitness-senior.co.il',
    phone: '050-2345678',
    services: services.filter(s => s.category === 'fitness'),
    rating: 4.8,
    totalBookings: 312,
    pendingPayments: 1500,
    isVerified: true,
    serviceAreas: ['תל אביב', 'הרצליה', 'רעננה'],
  },
  {
    id: 'vendor-3',
    businessName: 'מועדון חברתי לב',
    contactName: 'רחל גבאי',
    email: 'rachel@lev-club.co.il',
    phone: '050-3456789',
    services: services.filter(s => s.category === 'social'),
    rating: 4.9,
    totalBookings: 423,
    pendingPayments: 3200,
    isVerified: true,
    serviceAreas: ['ירושלים', 'בית שמש', 'מודיעין'],
  },
];

// Sample bookings
export const bookings: Booking[] = [
  {
    id: 'booking-1',
    serviceId: 'service-1',
    serviceName: 'פיזיותרפיה בבית',
    serviceCategory: 'health',
    clientId: 'client-1',
    clientName: 'יוסף כהן',
    vendorId: 'vendor-1',
    vendorName: 'פיזיותרפיה בית - ד"ר שרה כהן',
    date: '2026-01-07',
    time: '10:00',
    scheduledDate: '2026-01-07T10:00:00',
    status: 'confirmed',
    price: 280,
    unitsCost: 3,
  },
  {
    id: 'booking-2',
    serviceId: 'service-4',
    serviceName: 'יוגה לגיל השלישי',
    serviceCategory: 'fitness',
    clientId: 'client-2',
    clientName: 'שרה לוי',
    vendorId: 'vendor-2',
    vendorName: 'מרכז כושר הגיל השלישי',
    date: '2026-01-08',
    time: '08:30',
    scheduledDate: '2026-01-08T08:30:00',
    status: 'pending',
    price: 45,
    unitsCost: 1,
  },
  {
    id: 'booking-3',
    serviceId: 'service-6',
    serviceName: 'מועדון צהריים חברתי',
    serviceCategory: 'social',
    clientId: 'client-3',
    clientName: 'משה מזרחי',
    vendorId: 'vendor-3',
    vendorName: 'מועדון חברתי לב',
    date: '2026-01-06',
    time: '12:00',
    scheduledDate: '2026-01-06T12:00:00',
    status: 'in_progress',
    price: 40,
    unitsCost: 1,
  },
  {
    id: 'booking-4',
    serviceId: 'service-2',
    serviceName: 'בריכה טיפולית',
    serviceCategory: 'health',
    clientId: 'client-4',
    clientName: 'רחל ביטון',
    vendorId: 'vendor-1',
    vendorName: 'פיזיותרפיה בית - ד"ר שרה כהן',
    date: '2026-01-05',
    time: '14:00',
    scheduledDate: '2026-01-05T14:00:00',
    status: 'completed',
    price: 85,
    unitsCost: 1,
  },
  {
    id: 'booking-5',
    serviceId: 'service-5',
    serviceName: 'הליכה קבוצתית בפארק',
    serviceCategory: 'fitness',
    clientId: 'client-1',
    clientName: 'יוסף כהן',
    vendorId: 'vendor-2',
    vendorName: 'מרכז כושר הגיל השלישי',
    date: '2026-01-10',
    time: '07:00',
    scheduledDate: '2026-01-10T07:00:00',
    status: 'confirmed',
    price: 25,
    unitsCost: 1,
  },
];

// Matching weights
export const matchingWeights = {
  functionalFit: 0.28,
  personalGoals: 0.20,
  preferences: 0.16,
  distance: 0.12,
  rightsCoverage: 0.14,
  popularity: 0.10,
};

// Calculate fit score
export function calculateFitScore(client: Client, service: Service): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];

  // Functional fit (28%)
  const functionalScore = calculateFunctionalFit(client.functionalProfile, service);
  score += functionalScore * matchingWeights.functionalFit * 100;
  if (functionalScore > 0.7) reasons.push('מותאם לרמת התפקוד שלך');

  // Personal goals (20%)
  const goalsMatch = client.goals.some(goal =>
    service.tags.some(tag => tag.includes(goal.split(' ')[0]))
  );
  if (goalsMatch) {
    score += matchingWeights.personalGoals * 100;
    reasons.push('תואם את המטרות האישיות שלך');
  }

  // Preferences (16%)
  const prefMatch = client.preferences.filter(pref =>
    service.tags.some(tag => tag.includes(pref.split(' ')[0]))
  ).length;
  score += (prefMatch / client.preferences.length) * matchingWeights.preferences * 100;
  if (prefMatch > 0) reasons.push('מתאים להעדפות שלך');

  // Distance (12%)
  const distanceScore = service.distanceMinutes <= 10 ? 1 : service.distanceMinutes <= 20 ? 0.7 : 0.4;
  score += distanceScore * matchingWeights.distance * 100;
  if (distanceScore === 1) reasons.push('קרוב לביתך');

  // Rights coverage (14%)
  const coverageScore = service.fundingSource === 'סל' ? 1 :
    service.fundingSource === 'סל+ביטוח' ? 0.9 :
    service.fundingSource === 'ביטוח' ? 0.7 : 0.3;
  score += coverageScore * matchingWeights.rightsCoverage * 100;
  if (coverageScore >= 0.9) reasons.push('מכוסה מהסל');

  // Popularity (10%)
  const popularityScore = Math.min(service.communityCount / 200, 1);
  score += popularityScore * matchingWeights.popularity * 100;
  if (service.communityCount > 100) reasons.push('פופולרי בקרב דומים לך');

  return {
    score: Math.round(score),
    reason: reasons.slice(0, 2).join(' ו') || 'שירות מומלץ',
  };
}

function calculateFunctionalFit(profile: FunctionalProfile, service: Service): number {
  const isPhysical = service.category === 'fitness' || service.tags.includes('הליכה');
  const isCognitive = service.tags.includes('זיכרון') || service.tags.includes('משחקים');
  const isSocial = service.category === 'social';

  let fit = 0.7;

  if (isPhysical) {
    if (profile.mobility === 'independent') fit += 0.3;
    else if (profile.mobility === 'partial') fit += 0.2;
    else fit -= 0.1;
  }

  if (isCognitive) {
    if (profile.cognition === 'independent') fit += 0.2;
    else if (profile.cognition === 'partial') fit += 0.3;
  }

  if (isSocial) {
    if (profile.emotional === 'partial' || profile.emotional === 'significant') fit += 0.3;
  }

  return Math.min(Math.max(fit, 0), 1);
}

// Get personalized recommendations
export function getRecommendations(client: Client, count: number = 6): (Service & { fitScore: number; fitReason: string })[] {
  return services
    .map(service => {
      const { score, reason } = calculateFitScore(client, service);
      return { ...service, fitScore: score, fitReason: reason };
    })
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, count);
}

// Default client for demo
export const defaultClient = clients[0];

// ===========================================
// CRM Actions (פעולות פרואקטיביות)
// ===========================================

export type CRMActionType =
  | 'silent_user'
  | 'loneliness_intervention'
  | 'birthday_gift'
  | 'expiring_balance'
  | 'low_balance'
  | 'follow_up'
  | 'first_service_nudge'
  | 'service_completion_check';

export interface CRMAction {
  id: string;
  clientId: string;
  clientName: string;
  actionType: CRMActionType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestedAction: string;
  suggestedServices?: string[];
  dueDate?: string;
  createdAt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

export const CRM_ACTION_LABELS: Record<CRMActionType, string> = {
  silent_user: '🔇 יצירת קשר',
  loneliness_intervention: '💙 התערבות בדידות',
  birthday_gift: '🎂 יום הולדת',
  expiring_balance: '⏳ יתרה עומדת לפוג',
  low_balance: '💰 יתרה נמוכה',
  follow_up: '📞 מעקב',
  first_service_nudge: '🌟 שירות ראשון',
  service_completion_check: '✅ בדיקת שביעות רצון',
};

export const CRM_ACTION_PRIORITIES: Record<string, CRMActionType[]> = {
  high: ['loneliness_intervention', 'expiring_balance', 'silent_user'],
  medium: ['birthday_gift', 'low_balance', 'follow_up'],
  low: ['first_service_nudge', 'service_completion_check'],
};

// Generate CRM actions based on client data
function generateCRMActions(): CRMAction[] {
  const actions: CRMAction[] = [];
  const now = new Date();

  clients.forEach((client, index) => {
    // Silent users - no activity for 14+ days
    if (client.levProfile && client.lastActivityDate) {
      const lastActivity = new Date(client.lastActivityDate);
      const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceActivity >= 14) {
        actions.push({
          id: `action-silent-${client.id}`,
          clientId: client.id,
          clientName: client.name,
          actionType: 'silent_user',
          priority: daysSinceActivity >= 21 ? 'high' : 'medium',
          title: `לא נצפתה פעילות ${daysSinceActivity} ימים`,
          description: `${client.name} לא השתמש/ה בשירותים מזה ${daysSinceActivity} ימים`,
          suggestedAction: 'ליצור קשר טלפוני לבדיקת מצב',
          createdAt: now.toISOString(),
          status: 'pending',
        });
      }
    }

    // Loneliness intervention - high loneliness score + prefers group
    if (client.levProfile && client.levProfile.lonelinessScore >= 7) {
      const lonelyClients = ['client-3', 'client-7', 'client-12', 'client-23', 'client-45'];
      if (lonelyClients.includes(client.id) || client.levProfile.riskFlags.includes('loneliness')) {
        actions.push({
          id: `action-lonely-${client.id}`,
          clientId: client.id,
          clientName: client.name,
          actionType: 'loneliness_intervention',
          priority: 'high',
          title: 'ייהנה מפעילות חברתית',
          description: `ציון בדידות ${client.levProfile.lonelinessScore}/10. ${client.levProfile.prefersGroupActivities ? 'מעדיף/ה פעילות קבוצתית' : ''}`,
          suggestedAction: 'להציע פעילות חברתית קבוצתית',
          suggestedServices: ['service-6', 'service-11', 'service-13', 'service-16'],
          createdAt: now.toISOString(),
          status: 'pending',
        });
      }
    }

    // Low balance
    if (client.walletBalance <= 5) {
      actions.push({
        id: `action-balance-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        actionType: 'low_balance',
        priority: client.walletBalance <= 2 ? 'high' : 'medium',
        title: `יתרה נמוכה: ${client.walletBalance} יחידות`,
        description: `נותרו ${client.walletBalance} יחידות בלבד מתוך ${client.walletTotal}`,
        suggestedAction: 'לוודא שהלקוח מודע ליתרה ולסייע בתכנון',
        createdAt: now.toISOString(),
        status: 'pending',
      });
    }

    // Birthday (mock - random clients)
    if (index % 15 === 0) {
      const birthdayDate = new Date(now);
      birthdayDate.setDate(birthdayDate.getDate() + randomInt(1, 7));
      actions.push({
        id: `action-birthday-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        actionType: 'birthday_gift',
        priority: 'medium',
        title: `יום הולדת ${client.age + 1} בעוד ${randomInt(1, 7)} ימים`,
        description: `${client.name} חוגג/ת ${client.age + 1} בקרוב`,
        suggestedAction: 'להציע שירות מתנה ולאחל מזל טוב',
        suggestedServices: ['service-7', 'service-11'],
        dueDate: birthdayDate.toISOString(),
        createdAt: now.toISOString(),
        status: 'pending',
      });
    }

    // First service nudge - new clients who haven't used any service
    if (client.walletUsed <= 2 && index % 8 === 0) {
      actions.push({
        id: `action-first-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        actionType: 'first_service_nudge',
        priority: 'low',
        title: 'טרם השתמש/ה בשירותים',
        description: `${client.name} עדיין לא ניצל/ה את הסל - הזדמנות להציג שירותים`,
        suggestedAction: 'לתאם שיחת היכרות והצגת שירותים מתאימים',
        suggestedServices: client.levProfile?.meaningTags?.includes('social')
          ? ['service-6', 'service-5']
          : ['service-4', 'service-8'],
        createdAt: now.toISOString(),
        status: 'pending',
      });
    }
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return actions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export const crmActions: CRMAction[] = generateCRMActions();

// Get actions for specific case manager view
export function getCRMActionsByPriority(priority?: 'high' | 'medium' | 'low'): CRMAction[] {
  if (!priority) return crmActions;
  return crmActions.filter(a => a.priority === priority);
}

export function getCRMActionsByType(type: CRMActionType): CRMAction[] {
  return crmActions.filter(a => a.actionType === type);
}

export function getCRMActionsForClient(clientId: string): CRMAction[] {
  return crmActions.filter(a => a.clientId === clientId);
}

// ===========================================
// KPIs & Analytics (מדדי ביצוע)
// ===========================================

export interface KPIMetric {
  id: string;
  name: string;
  nameHe: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  status: 'good' | 'warning' | 'critical';
}

export const kpiMetrics: KPIMetric[] = [
  {
    id: 'utilization_rate',
    name: 'Basket Utilization',
    nameHe: 'ניצול הסל',
    value: 67,
    target: 80,
    unit: '%',
    trend: 'up',
    trendValue: 5,
    status: 'warning',
  },
  {
    id: 'prevention_rate',
    name: 'Prevention Services',
    nameHe: 'שירותי מניעה',
    value: 42,
    target: 50,
    unit: '%',
    trend: 'up',
    trendValue: 8,
    status: 'warning',
  },
  {
    id: 'inactive_users',
    name: 'Inactive Users',
    nameHe: 'משתמשים לא פעילים',
    value: 12,
    target: 5,
    unit: '%',
    trend: 'down',
    trendValue: 3,
    status: 'warning',
  },
  {
    id: 'group_participation',
    name: 'Group Activities',
    nameHe: 'פעילויות קבוצתיות',
    value: 58,
    target: 60,
    unit: '%',
    trend: 'up',
    trendValue: 4,
    status: 'good',
  },
  {
    id: 'vendor_rating',
    name: 'Vendor Rating',
    nameHe: 'דירוג ספקים',
    value: 4.7,
    target: 4.5,
    unit: '⭐',
    trend: 'stable',
    trendValue: 0,
    status: 'good',
  },
  {
    id: 'integrative_score',
    name: 'Optimal Aging Index',
    nameHe: 'מדד הזדקנות מיטבית',
    value: 72,
    target: 75,
    unit: '/100',
    trend: 'up',
    trendValue: 3,
    status: 'good',
  },
];

export interface ContentWorldStats {
  world: ContentWorld;
  totalSpend: number;
  totalServices: number;
  avgRating: number;
  utilizationPercent: number;
}

export const contentWorldStats: ContentWorldStats[] = [
  { world: 'belonging_meaning', totalSpend: 45000, totalServices: 892, avgRating: 4.9, utilizationPercent: 78 },
  { world: 'health_function', totalSpend: 62000, totalServices: 567, avgRating: 4.8, utilizationPercent: 85 },
  { world: 'resilience', totalSpend: 18000, totalServices: 234, avgRating: 4.7, utilizationPercent: 52 },
  { world: 'assistive_tech', totalSpend: 35000, totalServices: 189, avgRating: 4.6, utilizationPercent: 43 },
  { world: 'home_services', totalSpend: 28000, totalServices: 312, avgRating: 4.5, utilizationPercent: 61 },
];
