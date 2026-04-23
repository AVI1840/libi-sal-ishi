/**
 * Scenario Engine — Single source of truth for the entire demo.
 *
 * One user (Sarah Cohen) persists across all three apps.
 * One timeline (Day 1 → Day 14) drives all state changes.
 * Decision explanations are embedded in every recommendation and action.
 */

import type {
  Client,
  Service,
  Booking,
  CRMAction,
  ContentWorld,
  SubsidyTier,
  MeaningTag,
  PersonaType,
  LevProfile,
  KPIMetric,
} from './mockData';

// ===========================================
// Timeline
// ===========================================

export type ScenarioDay = 1 | 3 | 7 | 14;

export const SCENARIO_DAYS: { day: ScenarioDay; label: string; description: string }[] = [
  { day: 1,  label: 'יום 1 — קליטה',       description: 'שרה נקלטת במערכת, מקבלת פרופיל והמלצות' },
  { day: 3,  label: 'יום 3 — שירות ראשון',  description: 'שרה מזמינה מועדון צהריים, ספק מאשר' },
  { day: 7,  label: 'יום 7 — מעקב',         description: 'שירות הושלם, CRM מייצר מעקב, שרה מזמינה שוב' },
  { day: 14, label: 'יום 14 — תוצאות',      description: 'KPIs משתפרים, שרה פעילה, בדידות יורדת' },
];

// ===========================================
// Sarah Cohen — The Protagonist
// ===========================================

export const SARAH_BASE: Client = {
  id: 'sarah-cohen',
  name: 'שרה כהן',
  age: 78,
  city: 'רמת גן',
  functionalProfile: {
    mobility: 'partial',       // uses walker
    dailyFunction: 'independent',
    cognition: 'independent',
    cognitive: 4,
    emotional: 'partial',
    social: 2,                 // low social engagement
    vision: 4,
    hearing: 2,                // hearing impaired
  },
  walletBalance: 32,
  walletUsed: 0,
  walletTotal: 32,
  totalUnits: 32,
  nursingLevel: 2,
  status: 'green',
  lastActivity: 'היום',
  preferences: ['פעילות בוקר', 'קבוצות קטנות', 'בעברית', 'קרוב לבית'],
  goals: ['הרחבת חיי חברה', 'שמירה על עצמאות', 'שיפור זיכרון'],
  phone: '050-1234567',
  emergencyContact: {
    name: 'דנה כהן',
    phone: '052-9876543',
    relation: 'בת',
  },
  conditions: ['לחץ דם גבוה', 'אוסטאופורוזיס'],
  levProfile: {
    meaningTags: ['music', 'grandchildren', 'cooking'] as MeaningTag[],
    coreDream: 'לבשל עם הנכדות',
    lonelinessScore: 3,        // lonely (below threshold of 4)
    prefersGroupActivities: true,
    goals: ['הרחבת חיי חברה', 'שמירה על עצמאות'],
    icf: {
      mobility: 'assisted_device',
      sensory: 'hearing_impaired',
      digitalLiteracy: 'basic',
      cognitiveScore: 4,
      socialScore: 2,
    },
    persona: 'family_oriented' as PersonaType,
    secondaryPersonas: ['social_butterfly'] as PersonaType[],
    keyTraits: ['אוהבת לבשל', 'מאוד אדיבה', 'רגישה לרעש'],
    engagementTips: [
      'להזכיר את הנכדה דנה',
      'לשאול על הבישול',
      'לדבר לאט וברור (לקות שמיעה)',
      'להציע ליווי לפעילות ראשונה',
    ],
    riskFlags: ['loneliness'],
  },
  hasIncomeSuppelement: false,
  lastActivityDate: new Date().toISOString(),
};

// ===========================================
// Recommendation Types
// ===========================================

export type RecommendationType = 'must_do' | 'recommended' | 'optional';

export const RECOMMENDATION_TYPE_LABELS: Record<RecommendationType, { label: string; emoji: string; color: string; bgColor: string }> = {
  must_do:      { label: 'חובה',   emoji: '🔴', color: '#dc2626', bgColor: '#fef2f2' },
  recommended:  { label: 'מומלץ',  emoji: '🟡', color: '#d97706', bgColor: '#fffbeb' },
  optional:     { label: 'אפשרי', emoji: '🟢', color: '#16a34a', bgColor: '#f0fdf4' },
};

// ===========================================
// Decision Explanation Format
// ===========================================

export interface TriggeredRule {
  id: string;
  name: string;
  /** Human-readable Hebrew explanation */
  description: string;
  /** Was this rule the winner in a conflict? */
  isWinner?: boolean;
}

export interface RuleConflict {
  /** What competed */
  description: string;
  /** Which rules were involved */
  competingRules: string[];
  /** Which rule won */
  winner: string;
  /** Why it won */
  reason: string;
}

export interface DecisionExplanation {
  /** Short Hebrew explanation for the user */
  userFacing: string;
  /** Normalized score 0.00–1.00 */
  score: number;
  /** Recommendation classification */
  type: RecommendationType;
  /** Top 2 rules that drove this decision */
  triggeredRules: TriggeredRule[];
  /** Conflicts between rules (if any) */
  conflicts: RuleConflict[];
  /** Score breakdown (for recommendations) */
  scoreBreakdown?: {
    prevention: number;
    meaningMatch: number;
    proximity: number;
    socialProof: number;
    personaBoost: number;
    total: number;
  };
  /** Subsidy breakdown (for pricing) */
  subsidyBreakdown?: {
    contentWorld: string;
    baseTier: string;
    basePercent: number;
    boosters: { name: string; percent: number }[];
    finalPercent: number;
    originalPrice: number;
    finalPrice: number;
  };
}

export interface RecommendedService extends Service {
  fitScore: number;
  fitReason: string;
  explanation: DecisionExplanation;
  /** Whether this service was filtered out by safety */
  filteredOut?: boolean;
  filterReason?: string;
}

// ===========================================
// Scenario State per Day
// ===========================================

export interface ScenarioState {
  day: ScenarioDay;
  sarah: Client;
  recommendations: RecommendedService[];
  bookings: Booking[];
  crmActions: CRMAction[];
  alerts: ScenarioAlert[];
  kpis: KPIMetric[];
  /** What changed since last day */
  changelog: string[];
}

export interface ScenarioAlert {
  id: string;
  type: 'loneliness' | 'booking_confirmed' | 'service_completed' | 'kpi_update' | 'balance_update';
  severity: 'info' | 'warning' | 'success';
  title: string;
  description: string;
  timestamp: string;
  isNew: boolean;
}

// ===========================================
// Subsidy Calculation (real logic, frontend)
// ===========================================

const CONTENT_WORLD_SUBSIDY_MAP: Record<ContentWorld, { tier: SubsidyTier; percent: number }> = {
  belonging_meaning: { tier: 'full', percent: 100 },
  health_function:   { tier: 'full', percent: 100 },
  resilience:        { tier: 'partial', percent: 50 },
  assistive_tech:    { tier: 'partial', percent: 50 },
  home_services:     { tier: 'minimal', percent: 20 },
};

const TIER_LABELS: Record<SubsidyTier, string> = {
  full: 'מסובסד במלואו',
  partial: 'מסובסד חלקית',
  minimal: 'סבסוד מינימלי',
  none: 'תשלום פרטי',
};

function calculateSubsidy(
  service: Service,
  isLonely: boolean,
  hasIncomeSupplement: boolean,
): DecisionExplanation['subsidyBreakdown'] {
  const world = service.contentWorld || 'health_function';
  const mapping = CONTENT_WORLD_SUBSIDY_MAP[world];
  const boosters: { name: string; percent: number }[] = [];

  let totalPercent = mapping.percent;

  if (hasIncomeSupplement) {
    boosters.push({ name: 'השלמת הכנסה', percent: 20 });
    totalPercent += 20;
  }
  if (isLonely && service.isGroupActivity) {
    boosters.push({ name: 'עידוד פעילות חברתית (נגד בדידות)', percent: 20 });
    totalPercent += 20;
  }

  totalPercent = Math.min(totalPercent, 100);
  const finalPrice = Math.round(service.price * (1 - totalPercent / 100));

  return {
    contentWorld: world,
    baseTier: TIER_LABELS[mapping.tier],
    basePercent: mapping.percent,
    boosters,
    finalPercent: totalPercent,
    originalPrice: service.price,
    finalPrice,
  };
}

// ===========================================
// Recommendation Scoring (real logic, frontend)
// ===========================================

function scoreService(sarah: Client, service: Service): RecommendedService {
  const lev = sarah.levProfile!;
  const icf = lev.icf;

  // ── Safety filter (R02) ──────────────────────────────────
  if (service.icfRequirements) {
    const req = service.icfRequirements;
    if (req.maxMobility === 'independent' && icf.mobility !== 'independent') {
      return filteredResult(service, 'R02', 'safety_filter',
        'שרה משתמשת בהליכון — שירות זה דורש הליכה עצמאית',
        'שירות זה דורש הליכה עצמאית');
    }
    if (req.minCognitiveScore && icf.cognitiveScore < req.minCognitiveScore) {
      return filteredResult(service, 'R02', 'safety_filter',
        `שירות זה דורש ציון קוגניטיבי ${req.minCognitiveScore}+, לשרה יש ${icf.cognitiveScore}`,
        'דרישות קוגניטיביות גבוהות');
    }
  }

  // Hearing filter — choir requires intact hearing
  const hearingServices = ['service-11'];
  if (hearingServices.includes(service.id) && icf.sensory === 'hearing_impaired') {
    return filteredResult(service, 'R02', 'safety_filter',
      'שרה עם לקות שמיעה — מקהלה דורשת שמיעה תקינה',
      'שירות זה דורש שמיעה תקינה');
  }

  // ── Scoring components ───────────────────────────────────

  // Prevention score (40%)
  const world = service.contentWorld || 'health_function';
  const preventionScores: Record<string, number> = {
    belonging_meaning: 100, health_function: 100,
    resilience: 70, assistive_tech: 50, home_services: 30,
  };
  const prevention = preventionScores[world] || 50;

  // Meaning match (30%)
  const userTags = lev.meaningTags || [];
  const serviceTags = service.meaningTags || [];
  const matched = userTags.filter(t => serviceTags.includes(t));
  const meaningRaw = userTags.length > 0 ? (matched.length / userTags.length) * 100 * 1.5 : 0;
  const meaning = Math.min(meaningRaw, 100);

  // Proximity (20%)
  const dist = service.distanceMinutes || 10;
  const proximity = dist <= 5 ? 100 : dist <= 10 ? 80 : dist <= 15 ? 60 : 40;

  // Social proof (10%)
  const community = service.communityCount || 0;
  const social = community >= 200 ? 100 : community >= 100 ? 80 : community >= 50 ? 60 : community * 1.2;

  // Weighted raw score
  const raw = prevention * 0.4 + meaning * 0.3 + proximity * 0.2 + social * 0.1;

  // ── Persona boost ────────────────────────────────────────
  let personaBoost = 0;
  let boostReason = '';
  if (lev.persona === 'family_oriented' && serviceTags.includes('grandchildren')) {
    personaBoost = 0.3; boostReason = 'פעילות עם נכדים — מתאים לפרסונה "ממוקדת משפחה"';
  } else if (lev.persona === 'family_oriented' && service.isGroupActivity && lev.riskFlags.includes('loneliness')) {
    personaBoost = 0.2; boostReason = 'פעילות קבוצתית + בדידות — מומלצת לפרסונה "ממוקדת משפחה"';
  } else if (serviceTags.includes('cooking')) {
    personaBoost = 0.15; boostReason = 'קשור לבישול — החלום של שרה: "לבשל עם הנכדות"';
  }

  const total = Math.min(Math.round(raw * (1 + personaBoost)), 100);
  const normalizedScore = Math.round(total) / 100; // 0.00–1.00

  // ── Subsidy calculation ──────────────────────────────────
  const isLonely = lev.lonelinessScore < 4;
  const subsidy = calculateSubsidy(service, isLonely, sarah.hasIncomeSuppelement || false);

  // ── Recommendation type ──────────────────────────────────
  let recType: RecommendationType;
  if (isLonely && service.isGroupActivity && prevention >= 80) {
    recType = 'must_do';   // lonely + group + prevention = must do
  } else if (total >= 70) {
    recType = 'recommended';
  } else {
    recType = 'optional';
  }

  // ── Build rules & conflicts ──────────────────────────────
  const rules: TriggeredRule[] = [];
  const conflicts: RuleConflict[] = [];
  const reasons: string[] = [];

  // Rule: prevention subsidy
  if (prevention >= 80) {
    const WORLD_LABELS: Record<string, string> = {
      belonging_meaning: 'שייכות ומשמעות', health_function: 'בריאות ותפקוד',
      resilience: 'חוסן ועצמאות', assistive_tech: 'טכנולוגיה מסייעת', home_services: 'שירותי בית',
    };
    rules.push({
      id: 'R04', name: 'subsidy_prevention_free',
      description: `עולם תוכן "${WORLD_LABELS[world] || world}" → סבסוד ${subsidy!.basePercent}%`,
    });
    reasons.push('שירות מניעה מומלץ');
  } else if (world === 'home_services') {
    rules.push({
      id: 'R06', name: 'subsidy_home_minimal',
      description: 'שירותי בית → סבסוד 20% בלבד. המערכת מעדיפה שירותי מניעה.',
    });
  }

  // Rule: loneliness nudge
  if (isLonely && service.isGroupActivity) {
    rules.push({
      id: 'R07', name: 'loneliness_nudge',
      description: `שרה עם ציון בדידות ${lev.lonelinessScore}/10 — פעילות קבוצתית מקבלת +20% סבסוד`,
      isWinner: true,
    });
    reasons.push('פעילות חברתית — מומלצת במיוחד');
  }

  // Rule: meaning match
  if (matched.length > 0) {
    const MEANING_LABELS: Record<string, string> = {
      music: 'מוזיקה', grandchildren: 'נכדים', cooking: 'בישול',
      nature: 'טבע', social: 'חברתי', sports: 'ספורט',
      art: 'אומנות', learning: 'למידה', volunteering: 'התנדבות',
    };
    const tagNames = matched.map(t => MEANING_LABELS[t] || t).join(', ');
    rules.push({
      id: 'R08', name: 'meaning_match',
      description: `תחומי עניין תואמים: ${tagNames} (×1.5 מכפיל)`,
    });
    reasons.push(`מתאים לתחומי העניין: ${tagNames}`);
  }

  // Rule: persona boost
  if (personaBoost > 0) {
    rules.push({
      id: 'R08b', name: 'persona_boost',
      description: boostReason + ` → +${Math.round(personaBoost * 100)}% לציון`,
    });
  }

  if (proximity >= 80) reasons.push('קרוב לבית');

  // Subsidy display
  if (subsidy!.finalPercent >= 100) {
    reasons.push('חינם! ✨');
  } else if (subsidy!.finalPercent > 0) {
    reasons.push(`סבסוד ${subsidy!.finalPercent}%`);
  }

  // ── Conflict: prevention vs. choice ──────────────────────
  if (world === 'home_services' && isLonely) {
    conflicts.push({
      description: 'שירותי בית vs. עידוד מניעה',
      competingRules: ['R06', 'R04'],
      winner: 'R06',
      reason: 'שירותי בית מקבלים רק 20% סבסוד — המערכת מעדיפה שירותי מניעה (100%) אבל לא חוסמת בחירה',
    });
  }
  if (isLonely && service.isGroupActivity && subsidy!.basePercent < 100) {
    conflicts.push({
      description: 'סבסוד בסיס vs. בוסטר בדידות',
      competingRules: [rules[0]?.id || 'R05', 'R07'],
      winner: 'R07',
      reason: `בוסטר בדידות (+20%) מצטרף לסבסוד הבסיס (${subsidy!.basePercent}%) → סה"כ ${subsidy!.finalPercent}%`,
    });
  }
  if (personaBoost > 0 && meaning > 0) {
    conflicts.push({
      description: 'התאמה אישית vs. בוסט פרסונה',
      competingRules: ['R08', 'R08b'],
      winner: 'R08b',
      reason: `שני הכללים פועלים יחד: התאמה (${Math.round(meaning * 0.3)} נק׳) + פרסונה (+${Math.round(personaBoost * 100)}%) = ציון גבוה יותר`,
    });
  }

  // Keep only top 2 rules for display
  const topRules = rules.slice(0, 2);

  return {
    ...service,
    unitCost: service.unitCost || Math.max(1, Math.ceil(service.price / 100)),
    fitScore: total,
    fitReason: reasons.slice(0, 2).join(' • ') || 'שירות מומלץ',
    explanation: {
      userFacing: reasons.join(' • '),
      score: normalizedScore,
      type: recType,
      triggeredRules: topRules.length > 0 ? topRules : [{ id: 'R08', name: 'recommendation_scoring', description: 'דירוג לפי התאמה אישית' }],
      conflicts,
      scoreBreakdown: {
        prevention: Math.round(prevention * 0.4),
        meaningMatch: Math.round(meaning * 0.3),
        proximity: Math.round(proximity * 0.2),
        socialProof: Math.round(social * 0.1),
        personaBoost: Math.round(personaBoost * 100),
        total,
      },
      subsidyBreakdown: subsidy!,
    },
  };
}

/** Helper: build a filtered-out result */
function filteredResult(
  service: Service, ruleId: string, ruleName: string,
  ruleDesc: string, filterReason: string,
): RecommendedService {
  return {
    ...service, unitCost: service.unitCost || 1,
    fitScore: 0, fitReason: '', filteredOut: true, filterReason,
    explanation: {
      userFacing: '',
      score: 0,
      type: 'optional',
      triggeredRules: [{ id: ruleId, name: ruleName, description: ruleDesc }],
      conflicts: [],
    },
  };
}

// ===========================================
// Build Scenario States
// ===========================================

import { services } from './mockData';

function buildDay1(): ScenarioState {
  const sarah = { ...SARAH_BASE };
  const scored = services.map(s => scoreService(sarah, s));
  const visible = scored.filter(s => !s.filteredOut).sort((a, b) => b.fitScore - a.fitScore);
  const filtered = scored.filter(s => s.filteredOut);

  return {
    day: 1,
    sarah,
    recommendations: [...visible, ...filtered],
    bookings: [],
    crmActions: [
      {
        id: 'action-lonely-sarah',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        actionType: 'loneliness_intervention',
        priority: 'high',
        title: 'ייהנה מפעילות חברתית',
        description: 'ציון בדידות 3/10. מעדיפה פעילות קבוצתית. אוהבת מוזיקה, נכדים ובישול.',
        suggestedAction: 'להציע מועדון צהריים חברתי או סדנת בישול',
        suggestedServices: ['service-6', 'service-7'],
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
    ],
    alerts: [
      {
        id: 'alert-intake-complete',
        type: 'loneliness',
        severity: 'warning',
        title: 'זוהתה בדידות — שרה כהן',
        description: 'ציון בדידות 3/10. פרסונה: ממוקדת משפחה. מומלץ להציע פעילות קבוצתית.',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
    ],
    kpis: buildKPIs(1),
    changelog: [
      'שרה כהן נקלטה במערכת',
      'פרופיל ICF חושב: ניידות עם הליכון, לקות שמיעה',
      'פרסונה: ממוקדת משפחה (secondary: חברותית)',
      'דגל סיכון: בדידות (ציון 3/10)',
      'ארנק: 32 יחידות הוקצו (רמת סיעוד 2)',
      '12 שירותים מומלצים (6 סוננו — דורשים שמיעה תקינה או הליכה עצמאית)',
    ],
  };
}

function buildDay3(): ScenarioState {
  const sarah: Client = {
    ...SARAH_BASE,
    walletBalance: 31,
    walletUsed: 1,
    lastActivity: 'לפני שעתיים',
    status: 'green',
  };

  const scored = services.map(s => scoreService(sarah, s));
  const visible = scored.filter(s => !s.filteredOut).sort((a, b) => b.fitScore - a.fitScore);
  const filtered = scored.filter(s => s.filteredOut);

  return {
    day: 3,
    sarah,
    recommendations: [...visible, ...filtered],
    bookings: [
      {
        id: 'booking-sarah-1',
        serviceId: 'service-6',
        serviceName: 'מועדון צהריים חברתי',
        serviceCategory: 'social',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        vendorId: 'vendor-3',
        vendorName: 'מועדון חברתי לב',
        date: 'יום שלישי',
        time: '12:00',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'confirmed',
        price: 0,
        unitsCost: 1,
        notes: 'הזמנה ראשונה — ליווי מומלץ',
      },
    ],
    crmActions: [
      {
        id: 'action-lonely-sarah',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        actionType: 'loneliness_intervention',
        priority: 'high',
        title: 'ייהנה מפעילות חברתית',
        description: 'ציון בדידות 3/10. הוזמנה למועדון צהריים — לוודא שמגיעה.',
        suggestedAction: 'להתקשר יום לפני ולוודא הגעה. טיפ: להזכיר את הנכדה דנה.',
        suggestedServices: ['service-6'],
        createdAt: new Date().toISOString(),
        status: 'in_progress',
      },
      {
        id: 'action-first-sarah',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        actionType: 'first_service_nudge',
        priority: 'low',
        title: 'שירות ראשון הוזמן ✅',
        description: 'שרה הזמינה מועדון צהריים חברתי — שירות מניעה, חינם.',
        suggestedAction: 'לעקוב אחרי חוויה ראשונה',
        createdAt: new Date().toISOString(),
        status: 'completed',
      },
    ],
    alerts: [
      {
        id: 'alert-booking-confirmed',
        type: 'booking_confirmed',
        severity: 'success',
        title: 'הזמנה אושרה — שרה כהן',
        description: 'מועדון צהריים חברתי, יום שלישי 12:00. ספק: מועדון חברתי לב.',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
      {
        id: 'alert-intake-complete',
        type: 'loneliness',
        severity: 'warning',
        title: 'זוהתה בדידות — שרה כהן',
        description: 'ציון בדידות 3/10. הוזמנה לפעילות קבוצתית.',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        isNew: false,
      },
    ],
    kpis: buildKPIs(3),
    changelog: [
      'שרה הזמינה "מועדון צהריים חברתי" — חינם (100% סבסוד, belonging_meaning + loneliness nudge)',
      '1 יחידה הוקפאה מהארנק (31 נותרו)',
      'ספק "מועדון חברתי לב" אישר את ההזמנה',
      'פעולת CRM "התערבות בדידות" עודכנה ל-in_progress',
    ],
  };
}

function buildDay7(): ScenarioState {
  const sarah: Client = {
    ...SARAH_BASE,
    walletBalance: 29,
    walletUsed: 3,
    lastActivity: 'היום',
    status: 'green',
  };
  // Update loneliness after social activity
  if (sarah.levProfile) {
    sarah.levProfile = { ...sarah.levProfile, lonelinessScore: 5 };
  }

  const scored = services.map(s => scoreService(sarah, s));
  const visible = scored.filter(s => !s.filteredOut).sort((a, b) => b.fitScore - a.fitScore);
  const filtered = scored.filter(s => s.filteredOut);

  return {
    day: 7,
    sarah,
    recommendations: [...visible, ...filtered],
    bookings: [
      {
        id: 'booking-sarah-1',
        serviceId: 'service-6',
        serviceName: 'מועדון צהריים חברתי',
        serviceCategory: 'social',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        vendorId: 'vendor-3',
        vendorName: 'מועדון חברתי לב',
        date: 'יום שלישי',
        time: '12:00',
        scheduledDate: new Date(Date.now() - 345600000).toISOString(),
        status: 'completed',
        price: 0,
        unitsCost: 1,
      },
      {
        id: 'booking-sarah-2',
        serviceId: 'service-4',
        serviceName: 'יוגה לגיל השלישי',
        serviceCategory: 'fitness',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        vendorId: 'vendor-2',
        vendorName: 'מרכז כושר הגיל השלישי',
        date: 'יום חמישי',
        time: '08:30',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'confirmed',
        price: 0,
        unitsCost: 1,
      },
      {
        id: 'booking-sarah-3',
        serviceId: 'service-7',
        serviceName: 'סדנת ציור ויצירה',
        serviceCategory: 'culture',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        vendorId: 'vendor-3',
        vendorName: 'מועדון חברתי לב',
        date: 'יום ראשון',
        time: '10:00',
        scheduledDate: new Date(Date.now() + 259200000).toISOString(),
        status: 'pending',
        price: 0,
        unitsCost: 1,
      },
    ],
    crmActions: [
      {
        id: 'action-followup-sarah',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        actionType: 'follow_up',
        priority: 'medium',
        title: 'מעקב אחרי מועדון צהריים',
        description: 'שרה השלימה את הפעילות הראשונה. לברר שביעות רצון.',
        suggestedAction: 'להתקשר ולשאול איך היה. טיפ: לשאול על הבישול שם.',
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
      {
        id: 'action-lonely-sarah-resolved',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        actionType: 'loneliness_intervention',
        priority: 'medium',
        title: 'בדידות — שיפור',
        description: 'ציון בדידות עלה מ-3 ל-5 אחרי פעילות חברתית. להמשיך מעקב.',
        suggestedAction: 'לעודד המשך פעילויות קבוצתיות',
        createdAt: new Date().toISOString(),
        status: 'in_progress',
      },
    ],
    alerts: [
      {
        id: 'alert-service-completed',
        type: 'service_completed',
        severity: 'success',
        title: 'שירות הושלם — שרה כהן',
        description: 'מועדון צהריים חברתי הושלם בהצלחה. 1 יחידה נוכתה.',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
      {
        id: 'alert-loneliness-improving',
        type: 'loneliness',
        severity: 'info',
        title: 'שיפור בבדידות — שרה כהן',
        description: 'ציון בדידות עלה מ-3/10 ל-5/10 אחרי פעילות חברתית.',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
    ],
    kpis: buildKPIs(7),
    changelog: [
      'מועדון צהריים הושלם — 1 יחידה נוכתה',
      'שרה הזמינה יוגה (חינם) וסדנת ציור (חינם) — 2 יחידות נוספות',
      'ציון בדידות עלה מ-3 ל-5 (שיפור!)',
      'CRM: מעקב אחרי שירות ראשון',
      '3 שירותי מניעה מתוך 3 — 100% מניעה',
    ],
  };
}

function buildDay14(): ScenarioState {
  const sarah: Client = {
    ...SARAH_BASE,
    walletBalance: 26,
    walletUsed: 6,
    lastActivity: 'אתמול',
    status: 'green',
  };
  if (sarah.levProfile) {
    sarah.levProfile = { ...sarah.levProfile, lonelinessScore: 6, riskFlags: [] };
  }

  const scored = services.map(s => scoreService(sarah, s));
  const visible = scored.filter(s => !s.filteredOut).sort((a, b) => b.fitScore - a.fitScore);
  const filtered = scored.filter(s => s.filteredOut);

  return {
    day: 14,
    sarah,
    recommendations: [...visible, ...filtered],
    bookings: [
      {
        id: 'booking-sarah-1', serviceId: 'service-6', serviceName: 'מועדון צהריים חברתי',
        serviceCategory: 'social', clientId: 'sarah-cohen', clientName: 'שרה כהן',
        vendorId: 'vendor-3', vendorName: 'מועדון חברתי לב',
        date: 'יום שלישי', time: '12:00',
        scheduledDate: new Date(Date.now() - 1209600000).toISOString(),
        status: 'completed', price: 0, unitsCost: 1,
      },
      {
        id: 'booking-sarah-2', serviceId: 'service-4', serviceName: 'יוגה לגיל השלישי',
        serviceCategory: 'fitness', clientId: 'sarah-cohen', clientName: 'שרה כהן',
        vendorId: 'vendor-2', vendorName: 'מרכז כושר הגיל השלישי',
        date: 'יום חמישי', time: '08:30',
        scheduledDate: new Date(Date.now() - 604800000).toISOString(),
        status: 'completed', price: 0, unitsCost: 1,
      },
      {
        id: 'booking-sarah-3', serviceId: 'service-7', serviceName: 'סדנת ציור ויצירה',
        serviceCategory: 'culture', clientId: 'sarah-cohen', clientName: 'שרה כהן',
        vendorId: 'vendor-3', vendorName: 'מועדון חברתי לב',
        date: 'יום ראשון', time: '10:00',
        scheduledDate: new Date(Date.now() - 432000000).toISOString(),
        status: 'completed', price: 0, unitsCost: 1,
      },
      {
        id: 'booking-sarah-4', serviceId: 'service-6', serviceName: 'מועדון צהריים חברתי',
        serviceCategory: 'social', clientId: 'sarah-cohen', clientName: 'שרה כהן',
        vendorId: 'vendor-3', vendorName: 'מועדון חברתי לב',
        date: 'יום שלישי', time: '12:00',
        scheduledDate: new Date(Date.now() - 172800000).toISOString(),
        status: 'completed', price: 0, unitsCost: 1,
      },
      {
        id: 'booking-sarah-5', serviceId: 'service-8', serviceName: 'סדנת מניעת נפילות',
        serviceCategory: 'prevention', clientId: 'sarah-cohen', clientName: 'שרה כהן',
        vendorId: 'vendor-2', vendorName: 'מרכז כושר הגיל השלישי',
        date: 'יום שני', time: '09:00',
        scheduledDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'confirmed', price: 0, unitsCost: 1,
      },
      {
        id: 'booking-sarah-6', serviceId: 'service-9', serviceName: 'אימון זיכרון',
        serviceCategory: 'prevention', clientId: 'sarah-cohen', clientName: 'שרה כהן',
        vendorId: 'vendor-2', vendorName: 'מרכז כושר הגיל השלישי',
        date: 'יום חמישי', time: '11:00',
        scheduledDate: new Date(Date.now() + 259200000).toISOString(),
        status: 'confirmed', price: 0, unitsCost: 1,
      },
    ],
    crmActions: [
      {
        id: 'action-success-sarah',
        clientId: 'sarah-cohen',
        clientName: 'שרה כהן',
        actionType: 'service_completion_check',
        priority: 'low',
        title: '✅ סיפור הצלחה',
        description: '6 שירותים ב-14 יום. ציון בדידות עלה מ-3 ל-6. 100% שירותי מניעה.',
        suggestedAction: 'לתעד כסיפור הצלחה לדוח רשות',
        createdAt: new Date().toISOString(),
        status: 'pending',
      },
    ],
    alerts: [
      {
        id: 'alert-kpi-update',
        type: 'kpi_update',
        severity: 'success',
        title: 'עדכון מדדים — שרה כהן',
        description: 'ניצול ארנק: 19%. שירותי מניעה: 100%. בדידות: שיפור מ-3 ל-6.',
        timestamp: new Date().toISOString(),
        isNew: true,
      },
    ],
    kpis: buildKPIs(14),
    changelog: [
      'שרה השלימה 4 שירותים, 2 נוספים מתוכננים',
      'כל 6 השירותים = שירותי מניעה (100%)',
      'ציון בדידות: 3 → 6 (שיפור משמעותי)',
      'דגל בדידות הוסר',
      'ניצול ארנק: 6 מתוך 32 יחידות (19%)',
      'עלות למערכת: 0 ₪ (כל השירותים מסובסדים 100%)',
    ],
  };
}

function buildKPIs(day: ScenarioDay): KPIMetric[] {
  const base: Record<ScenarioDay, { util: number; prev: number; inactive: number; group: number }> = {
    1:  { util: 67, prev: 42, inactive: 12, group: 58 },
    3:  { util: 69, prev: 45, inactive: 11, group: 60 },
    7:  { util: 73, prev: 52, inactive: 9,  group: 64 },
    14: { util: 78, prev: 58, inactive: 7,  group: 68 },
  };
  const d = base[day];
  return [
    { id: 'utilization_rate', name: 'Basket Utilization', nameHe: 'ניצול הסל', value: d.util, target: 85, unit: '%', trend: day > 1 ? 'up' : 'stable', trendValue: day > 1 ? d.util - 67 : 0, status: d.util >= 75 ? 'good' : 'warning' },
    { id: 'prevention_rate', name: 'Prevention Services', nameHe: 'שירותי מניעה', value: d.prev, target: 60, unit: '%', trend: day > 1 ? 'up' : 'stable', trendValue: day > 1 ? d.prev - 42 : 0, status: d.prev >= 55 ? 'good' : 'warning' },
    { id: 'inactive_users', name: 'Inactive Users', nameHe: 'משתמשים לא פעילים', value: d.inactive, target: 5, unit: '%', trend: day > 1 ? 'down' : 'stable', trendValue: day > 1 ? 12 - d.inactive : 0, status: d.inactive <= 8 ? 'good' : 'warning' },
    { id: 'group_participation', name: 'Group Activities', nameHe: 'פעילויות קבוצתיות', value: d.group, target: 70, unit: '%', trend: day > 1 ? 'up' : 'stable', trendValue: day > 1 ? d.group - 58 : 0, status: d.group >= 65 ? 'good' : 'warning' },
    { id: 'vendor_rating', name: 'Vendor Rating', nameHe: 'דירוג ספקים', value: 4.7, target: 4.5, unit: '⭐', trend: 'stable', trendValue: 0, status: 'good' },
    { id: 'loneliness_improvement', name: 'Loneliness Improvement', nameHe: 'שיפור בדידות (שרה)', value: day === 1 ? 3 : day === 3 ? 3 : day === 7 ? 5 : 6, target: 7, unit: '/10', trend: day >= 7 ? 'up' : 'stable', trendValue: day >= 7 ? (day === 7 ? 2 : 3) : 0, status: day >= 7 ? 'good' : 'warning' },
  ];
}

// ===========================================
// Public API
// ===========================================

const SCENARIO_CACHE: Partial<Record<ScenarioDay, ScenarioState>> = {};

export function getScenarioState(day: ScenarioDay): ScenarioState {
  if (SCENARIO_CACHE[day]) return SCENARIO_CACHE[day]!;

  let state: ScenarioState;
  switch (day) {
    case 1:  state = buildDay1(); break;
    case 3:  state = buildDay3(); break;
    case 7:  state = buildDay7(); break;
    case 14: state = buildDay14(); break;
    default: state = buildDay1();
  }
  SCENARIO_CACHE[day] = state;
  return state;
}

/** Get Sarah's data for a specific day */
export function getSarah(day: ScenarioDay): Client {
  return getScenarioState(day).sarah;
}

/** Get recommendations with full explanations */
export function getScenarioRecommendations(day: ScenarioDay): RecommendedService[] {
  return getScenarioState(day).recommendations;
}

/** Get bookings for a specific day */
export function getScenarioBookings(day: ScenarioDay): Booking[] {
  return getScenarioState(day).bookings;
}

/** Get CRM actions for a specific day */
export function getScenarioCRMActions(day: ScenarioDay): CRMAction[] {
  return getScenarioState(day).crmActions;
}

/** Get alerts for a specific day */
export function getScenarioAlerts(day: ScenarioDay): ScenarioAlert[] {
  return getScenarioState(day).alerts;
}

/** Get KPIs for a specific day */
export function getScenarioKPIs(day: ScenarioDay): KPIMetric[] {
  return getScenarioState(day).kpis;
}
