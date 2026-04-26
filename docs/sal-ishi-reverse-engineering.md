<div dir="rtl">

# LIBI / סל אישי — ניתוח הנדסה לאחור של מערכת הרפורמה

> מסמך ניתוח מדיניות, ארכיטקטורה ולוגיקת החלטות · מבוסס על קריאת קוד מלאה

---

## 1. סיכום מערכתי (עמוד אחד)

### מה המערכת מנסה להשיג — במציאות

LIBI היא **מערכת הפעלה לזכויות סיעוד** שפותרת שלוש בעיות מבניות:

1. **אי-מימוש זכויות** — אזרחים ותיקים לא מנצלים שעות סיעוד. המערכת ממירה שעות ליחידות דיגיטליות בארנק עם תפוגה (90 יום), מה שיוצר לחץ חיובי לניצול.
2. **הטיית תקציב למניעה** — במקום שהכסף ילך לניקיון בית (20% סבסוד), המערכת מסבסדת 100% שירותי מניעה (פעילות חברתית, כושר, קוגניציה). זה nudge כלכלי — לא חסימה.
3. **סקלביליות של מתאמות** — מעבר מניהול ידני של 30 לקוחות לניהול מונחה-פעולות של 75+. המתאמת רואה רשימת פעולות ממוינת, לא רשימת לקוחות.

### השחקנים — מה הם עושים בפועל

| שחקן | מה עושה בפועל | מה המערכת עושה בשבילו |
|------|---------------|----------------------|
| **אזרח ותיק** (65-95) | מדבר בעברית עם AI, עונה על שאלון קליטה | AI מזהה צרכים, ממליץ שירותים, מבצע הזמנות, מזהה חירום |
| **בן משפחה** | מקבל התראות, יכול לאשר הזמנות | התראות אוטומטיות על חירום/בדידות/חוסר פעילות |
| **מתאמת שירות** | מנהלת 75 לקוחות, מבצעת פעולות CRM | רשימת פעולות יומית ממוינת לפי דחיפות + טיפים לפי פרסונה |
| **ספק שירות** | מספק פיזיותרפיה/פעילות/ציוד | הזמנות אוטומטיות, ניהול לוח זמנים, תשלום (בניכוי 7% עמלה) |
| **מנהל רשות** | מפקח על תקציב ואיכות | KPI dashboard: אחוז מניעה, ניצול ארנק, דירוג ספקים |

### מה קורה צעד אחר צעד — במציאות

```
1. אזרח מקבל דרגת סיעוד (1-6) מביטוח לאומי ← הזנה ידנית (אין API)
2. שעות סיעוד מומרות ליחידות: רמה 1=19, רמה 2=32, רמה 3=43 יחידות
3. מתאמת מפעילה אשף קליטה: ניידות, חושים, תגיות משמעות, ציון בדידות, חלום
4. המערכת מחשבת אוטומטית: פרופיל ICF + פרסונה + דגלי סיכון
5. מנוע המלצות מדרג שירותים: מניעה(40%) + התאמה(30%) + קרבה(20%) + חברתי(10%)
6. מנוע סבסוד מחשב מחיר אישי: עולם תוכן → טייר → בוסטרים → מחיר ללקוח
7. אזרח (או AI בשמו) מזמין → יחידות מוקפאות → שירות מבוצע → יחידות מנוכות
8. CRM מייצר פעולות יומיות למתאמת: שקט, בדידות, יתרה פגה, מעקב
```

---

## 2. שלושה תהליכי עבודה מרכזיים

### תהליך א׳ — קליטה → הערכה → הקצאה → ניטור

</div>
<div dir="rtl">

```
שלב 1: קליטה (Intake Wizard)
├── 6 שאלות מובנות:
│   ├── q_mobility: "איך מסתדר/ת בהליכה?" → 3 רמות (עצמאי/עזר הליכה/עזרה מאדם)
│   ├── q_sensory: "מצב שמיעה וראייה?" → 4 רמות (תקין/שמיעה/ראייה/שניהם)
│   ├── q_meaning: "מה מביא שמחה?" → בחירת עד 5 תגיות מ-14 אפשרויות
│   ├── q_loneliness: "כמה פעמים מרגיש/ה לבד?" → סקאלה 1-10
│   ├── q_group_pref: "מעדיף/ה קבוצתי או אישי?"
│   └── q_dream: "מה הכי רוצה לעשות?" → טקסט חופשי
├── נקודת החלטה: אין — כל השאלות מוצגות ברצף
├── נתון קריטי חסר: אין בדיקה קלינית — הכל self-reported
└── צוואר בקבוק: תלוי בשיתוף פעולה של האזרח + יכולת הבנה

שלב 2: חישוב פרופיל (אוטומטי מלא — RiskFlags.compute_from_intake + UserPersona.compute_from_profile)
├── ICF Profile: mobility × sensory × digital_literacy × cognitive_score × social_score
├── Risk Flags (אלגוריתמי):
│   ├── בדידות: loneliness_score < 4
│   ├── נפילה: mobility=human_assisted OR cognitive_score ≤ 2
│   ├── קוגניציה: cognitive_score ≤ 2 OR מילות מפתח ("שכחה","זיכרון","מבולבל")
│   └── חוסר פעילות: 21+ יום ללא פעילות
├── Persona (weighted scoring):
│   ├── meaning_tags → social_butterfly / family_oriented / learner / caregiver
│   ├── loneliness_score ≤ 4 → social_butterfly +0.2
│   ├── prefers_group → social_butterfly +0.2, else → independent_spirit +0.2
│   ├── cognitive ≥ 4 + learning tag → learner +0.3
│   ├── mobility=human_assisted OR cognitive ≤ 3 → security_seeker +0.3
│   └── independence keywords in goals → independent_spirit +0.3
├── נקודת החלטה: הפרסונה נגזרת אלגוריתמית — אין אישור אנושי
└── סיכון: פרסונה שגויה → כל ההמלצות מוטות

שלב 3: הקצאת ארנק (אוטומטי מלא)
├── רמת סיעוד → יחידות חודשיות:
│   ├── רמה 1: 9.5 שעות → 19 יחידות
│   ├── רמה 2: 16 שעות → 32 יחידות
│   ├── רמה 3: 21.5 שעות → 43 יחידות
│   ├── רמה 4: 30 שעות → 60 יחידות ← אומדן!
│   ├── רמה 5: 40 שעות → 80 יחידות ← אומדן!
│   └── רמה 6: 50 שעות → 100 יחידות ← אומדן!
├── חובה: מינימום 2 יחידות להזדקנות מיטבית (OPTIMAL_AGING_MIN_UNITS)
├── חלוקה: 10% optimal aging, 90% traditional
├── תפוגה: 90 יום
└── נקודת החלטה: אין — אוטומטי לחלוטין

שלב 4: ניטור שוטף
├── AI (Limor): מנטר שיחות, מזהה מילות חירום (16 ביטויים), בדידות (8 ביטויים), קוגניציה (7 ביטויים)
├── CRM Engine: מייצר פעולות יומיות למתאמת (ראה תהליך ג׳)
├── Health Monitor: anomaly detection על מדדי בריאות (לא מחובר עדיין)
└── נקודת החלטה: מתאמת מחליטה אם לפעול על כל התראה — אין escalation אוטומטי
```

### תהליך ב׳ — המלצה → סבסוד → הזמנה → ביצוע

```
שלב 1: Safety Filter (שער קשיח — ICFRequirements.user_meets_requirements)
├── בדיקת ניידות: mobility_order[user] ≥ mobility_order[service_min]
├── בדיקת שמיעה: אם שירות דורש → user.sensory ∉ {hearing_impaired, both_impaired}
├── בדיקת ראייה: אם שירות דורש → user.sensory ∉ {visual_impaired, both_impaired}
├── בדיקת קוגניציה: user.cognitive_score ≥ service.min_cognitive_score
└── אם נכשל → השירות לא מוצג כלל (hard gate)

שלב 2: Scoring Loop (RecommendationEngine._score_service)
├── Prevention Value (40%):
│   ├── belonging_meaning / health_function → 100 נקודות
│   ├── resilience → 70 נקודות
│   ├── assistive_tech → 50 נקודות
│   └── home_services → 30 נקודות
├── Meaning Match (30%):
│   ├── חפיפה: user_meaning_tags ∩ service_meaning_tags
│   ├── ציון בסיס: (matched / total_user_tags) × 100
│   └── כפל: × 1.5 (RECOMMENDATION_WEIGHTS_MEANING_MULTIPLIER)
├── Proximity (20%):
│   ├── <1km → 100, <3km → 80, <5km → 60, <10km → 40, else → 20
│   └── אם אין מיקום → 50 (ברירת מחדל)
└── Social Proof (10%):
    ├── ≥10 שכנים → 100, ≥5 → 60-80 (ליניארי)
    └── <5 → proportional (count × 12)

שלב 3: Persona Boost (כפל על הציון הסופי)
├── security_seeker + assistive_tech/preventive → ×1.5
├── social_butterfly + group_activity → ×1.3
├── learner + cognitive/learning → ×1.3
├── family_oriented + grandchildren → ×1.3
└── caregiver + volunteering → ×1.3

שלב 4: Subsidy Calculation (SubsidyEngine.calculate_subsidy)
├── עולם תוכן → טייר בסיס:
│   ├── שייכות ומשמעות → 100%
│   ├── בריאות ותפקוד → 100%
│   ├── חוסן ועצמאות → 50%
│   ├── טכנולוגיה מסייעת → 50%
│   └── שירותי בית → 20%
├── בוסטרים:
│   ├── השלמת הכנסה → +20%
│   └── בודד (score<4) + פעילות קבוצתית → +20%
├── תקרה: min(base + boosters, 100%)
└── מחיר ללקוח = base_price × (1 - final_subsidy)

שלב 5: הזמנה (WalletService)
├── check_balance → reserve_units → create booking (pending)
├── ספק מאשר → confirmed → in_progress → completed
├── complete_transaction: reserved → spent
├── ביטול: cancel_reservation → units returned
└── ספק מקבל תשלום בניכוי 7% עמלת פלטפורמה

שלב 6: מעקב
└── CRM מייצר פעולת follow_up 2-5 ימים אחרי השלמה
```

### תהליך ג׳ — CRM פרואקטיבי (CRMEngine.generate_actions)

```
Job יומי — מייצר רשימת פעולות ממוינת:

1. יתרה עומדת לפוג (< 14 יום)
   ├── עדיפות: URGENT
   ├── פעולה: "להתקשר ולהציע שירותים לניצול"
   └── due_date: היום

2. משתמש שקט (21+ יום ללא פעילות)
   ├── עדיפות: HIGH
   ├── פעולה: "להתקשר ולברר מצב"
   ├── הקשר: פרסונה + engagement_tips
   └── due_date: היום

3. התערבות בדידות (loneliness_score < 4)
   ├── עדיפות: HIGH
   ├── פעולה: "להציע פעילות קבוצתית"
   ├── הקשר: שירות מומלץ לפי meaning_tags (מקהלה/ציור/הליכה/מועדון)
   └── due_date: היום + 2

4. יתרה נמוכה (< 15% מהסל)
   ├── עדיפות: MEDIUM
   ├── פעולה: "לבדוק זכויות נוספות"
   └── due_date: היום + 3

5. יום הולדת (7 ימים קדימה)
   ├── עדיפות: MEDIUM
   ├── פעולה: "לשלוח שובר מתנה"
   └── due_date: יום הולדת - 2

6. מעקב אחרי שירות (2-5 ימים אחרי השלמה)
   ├── עדיפות: LOW
   ├── פעולה: "לברר שביעות רצון"
   └── due_date: היום + 3

מיון: URGENT(0) → HIGH(1) → MEDIUM(2) → LOW(3), ובתוך כל רמה לפי due_date
```

---

## 3. טבלת כללי החלטה (20 כללים — מהקוד)

| # | תנאי | החלטה | עדיפות | מקור (קובץ) |
|---|-------|--------|--------|-------------|
| 1 | רמת סיעוד 1-3 | הקצאת 19-43 יחידות | — | `constants.py: NURSING_LEVEL_UNITS` |
| 2 | רמת סיעוד 4-6 | הקצאת 60-100 יחידות | — | `constants.py` — **אומדן, לא מדיניות** |
| 3 | כל הקצאה חודשית | מינימום 2 יחידות optimal aging | חובה | `marketplace/config.py: OPTIMAL_AGING_MIN_UNITS` |
| 4 | יחידות לא נוצלו 90 יום | תפוגה אוטומטית | — | `wallet/service.py` |
| 5 | שירות בעולם belonging_meaning | סבסוד 100% | — | `constants.py: CONTENT_WORLD_DEFAULT_SUBSIDY` |
| 6 | שירות בעולם health_function | סבסוד 100% | — | `constants.py` |
| 7 | שירות בעולם resilience | סבסוד 50% | — | `constants.py` |
| 8 | שירות בעולם assistive_tech | סבסוד 50% | — | `constants.py` |
| 9 | שירות בעולם home_services | סבסוד 20% | — | `constants.py` |
| 10 | מקבל השלמת הכנסה | +20% סבסוד | — | `constants.py: SUBSIDY_BOOSTERS` |
| 11 | בודד (score<4) + פעילות קבוצתית | +20% סבסוד (anti-loneliness nudge) | — | `subsidy/engine.py` |
| 12 | סבסוד כולל > 100% | חיתוך ל-100% | — | `constants.py: SUBSIDY_MAX_PERCENTAGE` |
| 13 | ICF משתמש < דרישות שירות | שירות לא מוצג (hard gate) | — | `recommendation/engine.py: _check_safety_filter` |
| 14 | loneliness_score < 4 | דגל סיכון: בדידות | HIGH | `lev_profile.py: RiskFlags.compute_from_intake` |
| 15 | mobility=human_assisted OR cognitive ≤ 2 | דגל סיכון: נפילה | HIGH | `lev_profile.py` |
| 16 | מילות מפתח קוגניטיביות ("שכחה","זיכרון") | דגל סיכון: ירידה קוגניטיבית | HIGH | `lev_profile.py` |
| 17 | 21+ יום ללא פעילות | דגל: לא פעיל + פעולת CRM | HIGH | `constants.py: KPI_THRESHOLDS["silent_user_days"]` |
| 18 | יתרה < 15% מהסל | התראת יתרה נמוכה | MEDIUM | `crm/engine.py: _is_balance_low` |
| 19 | יתרה פגה בעוד < 14 יום | התראה דחופה | URGENT | `crm/engine.py: _is_balance_expiring` |
| 20 | מילות חירום בשיחה (16 ביטויים) | פרוטוקול חירום + התראה למשפחה + alert | CRITICAL | `constants.py: EMERGENCY_KEYWORDS_HEBREW` |

---

## 4. מפת החלטות לפי תפקיד

</div>
<div dir="rtl">

### מה כל תפקיד מחליט — מהקוד

| החלטה | מתאמת (ידני) | מערכת (אוטומטי) | ספק | אזרח | AI (Limor) |
|-------|-------------|-----------------|-----|------|------------|
| קליטת לקוח | מפעילה אשף | מייצרת ICF+פרסונה+דגלים | — | עונה על שאלות | — |
| הקצאת יחידות | — | ✅ אוטומטי לפי nursing_level | — | — | — |
| המלצת שירות | יכולה לדרוס | ✅ scoring algorithm | — | בוחר מרשימה | מציע בשיחה |
| חישוב סבסוד | — | ✅ אוטומטי (SubsidyEngine) | — | — | — |
| הזמנת שירות | יכולה להזמין בשם לקוח | — | — | מאשר | יכול להזמין (ai_booked=true) |
| אישור הזמנה | — | — | ✅ מאשר/דוחה | — | — |
| סימון "הושלם" | — | — | ✅ + proof_of_service | — | — |
| פעולת CRM | ✅ מבצעת/דוחה/דוחה | ✅ מייצרת (CRMEngine) | — | — | — |
| זיהוי חירום | — | ✅ keyword matching | — | — | ✅ מזהה + מתריע |
| דריסת דגל סיכון | ✅ manual_overrides | ✅ חישוב ראשוני | — | — | — |
| זיהוי רגשי | — | — | — | — | ✅ EmotionalState detection |

### איפה ההחלטות ידניות vs. מובנות

**מובנה לחלוטין (אין מגע אנושי):**
- הקצאת יחידות לפי רמת סיעוד
- חישוב סבסוד (עולם תוכן → טייר → בוסטרים)
- Safety filter (ICF requirements)
- תפוגת יחידות (90 יום)
- חישוב פרסונה ודגלי סיכון

**מובנה + אישור אנושי:**
- המלצת שירות (מערכת ממליצה, אזרח בוחר)
- הזמנה דרך AI (AI מציע, אזרח מאשר, payment_approval_required=true מעל 50 ₪)
- פעולות CRM (מערכת מייצרת, מתאמת מבצעת)

**ידני לחלוטין:**
- דריסת דגלי סיכון (manual_overrides dict)
- הזמנה בשם לקוח
- הסלמה לגורם חיצוני (אין מנגנון מובנה!)
- אימות פרופיל ICF (אין checkbox "אימתתי")

---

## 5. לוגיקת שיבוץ שירותים (מהקוד)

### נוסחת הציון

```
raw_score = (prevention × 0.40) + (meaning × 0.30) + (proximity × 0.20) + (social_proof × 0.10)
total_score = raw_score × (1 + persona_boost)
final_score = min(total_score, 100)
```

### קריטריונים

| קריטריון | משקל | חישוב מדויק (מהקוד) |
|----------|------|---------------------|
| ערך מניעתי | 40% | belonging/health=100, resilience=70, tech=50, home=30 |
| התאמה אישית | 30% | (matched_tags / user_tags) × 100 × 1.5, capped at 100 |
| קרבה | 20% | haversine distance: <1km=100, <3=80, <5=60, <10=40, else=20 |
| הוכחה חברתית | 10% | ≥10=100, 5-10=60+(count-5)×8, <5=count×12 |

### אילוצים (Hard Constraints)

1. **ICF Safety Filter** — שירות שדורש ניידות עצמאית לא יוצג למי שצריך עזרה. שירות שדורש שמיעה תקינה לא יוצג ללקוי שמיעה. **זה שער קשיח — אין override.**
2. **רמת סיעוד** — שירות עם min/max_nursing_level מסנן לפי רמת הלקוח
3. **הפניה רפואית** — שירותים עם requires_referral=true מסומנים (אבל לא חסומים בקוד)

### Trade-offs מובנים במערכת

1. **מניעה vs. בחירה** — 40% מהמשקל למניעה, אבל שירותי בית עדיין זמינים (30 נקודות, לא 0)
2. **סבסוד כ-nudge** — שירותי מניעה חינמיים, שירותי בית ב-80% מהמחיר
3. **בדידות כבוסטר** — אזרח בודד + פעילות קבוצתית = +20% סבסוד נוסף
4. **פרסונה כמכפיל** — security_seeker מקבל ×1.5 על כפתור מצוקה, social_butterfly מקבל ×1.3 על פעילות קבוצתית

---

## 6. מודל נתונים (מה נדרש כדי שהמערכת תעבוד)

### שדות חובה (מהקוד — validation rules)

| שדה | טיפוס | מקור | שימוש | קובץ |
|-----|-------|------|-------|------|
| teudat_zehut | VARCHAR(9), validated | רישום | זיהוי ייחודי | `user.py` |
| first_name, last_name | VARCHAR(100) | רישום | תצוגה | `user.py` |
| birth_date | DATE, age<120 | רישום | גיל, יום הולדת CRM | `user.py` |
| phone | Israeli format | רישום | תקשורת | `user.py` |
| nursing_level | INT 1-6 | ביטוח לאומי (ידני) | הקצאת יחידות | `user.py` |
| mobility | enum 3 values | שאלון קליטה | safety filter | `lev_profile.py` |
| sensory | enum 4 values | שאלון קליטה | safety filter | `lev_profile.py` |
| meaning_tags | list, max 5 | שאלון קליטה | המלצות + CRM | `lev_profile.py` |
| loneliness_score | INT 1-10 | שאלון קליטה | דגלי סיכון + סבסוד | `lev_profile.py` |
| emergency_contact | name+phone | רישום | פרוטוקול חירום | `user.py` |

### שדות אופציונליים (משפרים המלצות)

| שדה | טיפוס | שימוש |
|-----|-------|-------|
| core_dream | text, max 500 | פרסונליזציה של AI |
| digital_literacy | enum 3 values | סינון שירותי טכנולוגיה |
| cognitive_score | INT 1-5 | safety filter + דגלי סיכון |
| social_score | INT 1-5 | חישוב פרסונה |
| has_income_supplement | bool | בוסטר סבסוד +20% |
| lat/lng | float | proximity scoring |
| preferred_times | list | סינון זמינות |
| prefers_group | bool | המלצות + פרסונה |

### נתונים שחסרים היום (מהקוד — TODO comments + mock data)

| נתון | למה חסר | השפעה | ראיה בקוד |
|------|---------|-------|-----------|
| רמת סיעוד בזמן אמת | אין API לביטוח לאומי | הזנה ידנית | `nursing_level` field, no API call |
| מיקום GPS מדויק | פרטיות | proximity=50 (default) | `if user_lat is None: return 50.0` |
| היסטוריית שירותים | אין אינטגרציה | אין learning | `booking_history: list[dict] | None` unused |
| מדדי בריאות אמיתיים | אין חיבור למכשירים | health monitor לא פעיל | `health_readings` table empty |
| הערכה קלינית | הכל self-reported | ICF לא מדויק | no clinical validation |
| vector embeddings | Pinecone/pgvector לא מחובר | אין זיכרון סמנטי | `semantic_memories` table, `embedding_id` unused |
| WhatsApp integration | לא מומש | רק web channel | `ConversationChannel.WHATSAPP` defined, not used |

---

## 7. שבעת הפערים המרכזיים (Reality Check)

### פער 1: Self-Reported ICF — אין אימות קליני
**מה בקוד:** `ICFProfile` נבנה מ-6 שאלות self-reported. `RiskFlags.compute_from_intake` מחשב דגלי סיכון מהתשובות.
**הסיכון:** safety filter מבוסס על מה שהאזרח אומר. אזרח שמדווח "הולך עצמאי" אבל בפועל נופל — יקבל המלצה לשירות שדורש הליכה.
**ראיה:** אין שום `verified_by` או `clinical_assessment` field בקוד.

### פער 2: פרסונה אלגוריתמית ללא אישור
**מה בקוד:** `UserPersona.compute_from_profile` מחשב פרסונה מ-weighted scoring. הפרסונה משפיעה על כל ההמלצות (persona_boost עד ×1.5).
**הסיכון:** אזרח שענה "אוהב מוזיקה" ו"מעדיף קבוצתי" מסווג כ-social_butterfly ומקבל ×1.3 על כל פעילות קבוצתית — גם אם בפועל הוא ביישן.
**ראיה:** אין `persona_approved_by_case_manager` field. אין UI לאישור פרסונה.

### פער 3: רמות סיעוד 4-6 — אומדן
**מה בקוד:** `NURSING_LEVEL_HOURS = {4: 30.0, 5: 40.0, 6: 50.0}` עם הערה `# Estimated for levels 4-6`.
**הסיכון:** הקצאה שגויה. אזרח ברמה 5 מקבל 80 יחידות — אולי מגיע לו 70 או 90.
**ראיה:** הערה מפורשת בקוד. אין מקור מדיניות.

### פער 4: אין feedback loop
**מה בקוד:** `RecommendationEngine` מחשב ציון אבל לא לומד מתוצאות. אין שאלון שביעות רצון. אין עדכון משקלות.
**הסיכון:** המלצות לא משתפרות עם הזמן. שירות עם דירוג 4.9 שבפועל לא מתאים לפרסונה מסוימת — ימשיך להיות מומלץ.
**ראיה:** `booking_history` parameter ב-`compute_from_profile` קיים אבל לא בשימוש (`list[dict] | None = None`).

### פער 5: CRM ללא escalation
**מה בקוד:** `CRMEngine.generate_actions` מייצר פעולות עם priority (URGENT/HIGH/MEDIUM/LOW) אבל אין מנגנון שבודק אם פעולה טופלה.
**הסיכון:** פעולה URGENT "יתרה עומדת לפוג" יכולה להישאר pending לנצח. אין auto-escalation למנהל רשות.
**ראיה:** `status: str = "pending"` — אין timer, אין escalation logic, אין notification למנהל.

### פער 6: Frontend ↔ Backend disconnect
**מה בקוד:** Frontend (`mockData.ts`) מייצר 75 לקוחות, 18 שירותים, 3 ספקים — הכל mock. Backend (`wallet/service.py`) מחזיר mock data עם TODO comments.
**הסיכון:** הדמו מרשים אבל לא מוכיח שהלוגיקה עובדת end-to-end. אין API call אמיתי.
**ראיה:** `# TODO: Fetch from database` ב-`WalletService.get_wallet`. `# TODO: Update database` ב-`reserve_units`.

### פער 7: אין multi-tenancy
**מה בקוד:** `authority_id: str | None` קיים ב-`UserInDB` אבל אין RBAC ברמת רשות. אין סינון לפי authority בשום query.
**הסיכון:** הרחבה ל-6 אתרים תדרוש: הוספת authority_id לכל entity, סינון בכל query, הרשאות cross-site.
**ראיה:** `authority_id` field קיים אבל `None` by default. אין `WHERE authority_id = ?` בשום מקום.

---

## מפת מצב נוכחי vs. יעד

| רכיב | מצב נוכחי (ידני/מפוצל) | מצב במערכת (מה בנוי) | יעד (מה חסר) |
|------|------------------------|---------------------|-------------|
| קליטה | טפסים ידניים, Excel | ✅ אשף 6 שאלות + חישוב אוטומטי | אימות קליני, אשף דינמי |
| הערכה תפקודית | מתאמת מעריכה ידנית | ✅ ICF אוטומטי מ-self-report | אימות מתאמת, בדיקה קלינית |
| הקצאת שירותים | מתאמת בוחרת מרשימה | ✅ מנוע המלצות 4-factor | feedback loop, A/B testing |
| חישוב עלות | ידני / קבוע | ✅ סבסוד דינמי 5 טיירים + בוסטרים | אימות מול מדיניות רשמית |
| ניטור | שיחות טלפון תקופתיות | ✅ CRM פרואקטיבי 6 סוגי פעולות | escalation, health monitor |
| דיווח | Excel חודשי | ⚠️ KPI dashboard (mock data) | חיבור לנתונים אמיתיים |
| תקשורת עם אזרח | טלפון בשעות עבודה | ✅ Limor AI בעברית, 3 פרסונות | WhatsApp, voice, זיכרון סמנטי |
| תקשורת עם משפחה | טלפון ידני | ✅ מודל התראות (alerts table) | חיבור אמיתי, אפליקציית משפחה |
| תשלום לספקים | ידני | ⚠️ מודל (vendor_payments table) | clearing house אמיתי |

---

## נספח: ארכיטקטורה טכנית

```
Frontend (React + TypeScript + Tailwind + shadcn/ui)
├── web-client (port 3000) — ממשק אזרח ותיק
│   ├── Chat.tsx — שיחה עם Limor
│   ├── Marketplace.tsx — קטלוג שירותים
│   ├── ServiceDetails.tsx — פרטי שירות + סבסוד
│   └── Profile.tsx — פרופיל + ארנק
├── case-manager-dashboard (port 3001) — ממשק מתאמת
│   ├── Dashboard.tsx — KPIs + פעולות דחופות
│   ├── Clients.tsx — רשימת לקוחות + Lev profiles
│   ├── ClientDetail.tsx — פרופיל מלא + היסטוריה
│   ├── Actions.tsx — רשימת פעולות CRM
│   └── Alerts.tsx — התראות
├── vendor-portal (port 3002) — ממשק ספק
└── shared-ui — קומפוננטות + mock data + types

Backend (Python + FastAPI + Pydantic + LangGraph)
├── packages/shared — models, constants, auth, database, LLM, voice
├── packages/ai-agent (port 8001)
│   ├── orchestrator.py — LangGraph state machine (classify → emergency → route → respond)
│   ├── limor_agent.py — AI companion (3 personas, emotional support, booking detection)
│   ├── limor_intake.py — standalone intake
│   ├── health_monitor.py — anomaly detection
│   ├── marketplace_coordinator.py — service search + booking
│   └── family_liaison.py — family notifications
├── packages/marketplace (port 8002)
│   ├── recommendation/engine.py — 4-factor scoring + persona boost
│   ├── subsidy/engine.py — dynamic subsidy calculation
│   ├── crm/engine.py — proactive action generation
│   └── wallet/service.py — unit management
└── packages/integration (port 8000)
    └── gateway — API routing, auth, webhooks

Infrastructure
├── PostgreSQL 16 (3 schemas: shared, ai_agent, marketplace)
├── Redis 7 (sessions, cache)
└── Docker Compose
```

</div>

---

<div dir="rtl">

## 8. שיפורים שנוספו (אפריל 2026)

### 8.1 שכבת API Client — חיבור Frontend ↔ Backend
- נוצר `shared-ui/src/lib/api.ts` — wrapper לכל ה-API calls
- תומך ב-fallback ל-mock data כשהבקאנד לא זמין
- endpoints: intake, recommendations, subsidy, bookings, CRM, feedback, persona verification, ICF verification

### 8.2 CRM Escalation — הסלמה אוטומטית (72 שעות / שבוע)
- פעולות URGENT שלא טופלו תוך **72 שעות** → הסלמה אוטומטית למנהל רשות
- פעולות HIGH שלא טופלו תוך **שבוע** → הסלמה אוטומטית למנהל רשות
- `EscalationBadge` component מציג אזהרה כשמתקרבים לסף
- `CRMEngine.check_escalations()` — לוגיקת הסלמה בבקאנד
- KPI חדש: `escalated_this_week`, `approaching_escalation`

### 8.3 אימות פרסונה ע"י מתאמת
- `PersonaVerification` component — מוצג בפרופיל לקוח
- מתאמת יכולה: לאשר פרסונה ✅ / לשנות פרסונה ✏️ / להוסיף הערות
- API endpoint: `POST /api/v1/lev/persona/{user_id}/verify`
- שדות חדשים ב-`LevProfile`: `persona_verified`, `persona_override`, `persona_verification_notes`

### 8.4 Feedback Loop — משוב אחרי שירות
- `ServiceFeedbackModal` — מוצג אחרי השלמת שירות
- דירוג 1-5 כוכבים + תגובה חופשית + "היית ממליץ?"
- שמירה מקומית כשאין חיבור (offline-first)
- API endpoint: `POST /api/v1/lev/feedback`
- מודל: `ServiceFeedback`, `ServiceFeedbackSummary`
- KPI חדש: `average_service_rating`, `feedback_response_rate`

### 8.5 אימות ICF קליני
- `ICFVerification` component — checkbox + badge
- מתאמת מאמתת שהפרופיל התפקודי (self-reported) מדויק
- API endpoint: `POST /api/v1/lev/icf/{user_id}/verify`
- שדות חדשים: `icf_verified`, `icf_verified_by`, `icf_verified_at`
- KPI חדש: `icf_verification_rate`

### 8.6 WhatsApp Channel
- Webhook endpoints: `GET/POST /api/v1/webhooks/whatsapp/*`
- תמיכה ב-WhatsApp Cloud API (Meta Business)
- פרסור הודעות: text, interactive (buttons/lists), location
- אותו orchestrator כמו web chat — רק ערוץ שונה
- הגדרות: `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`

</div>