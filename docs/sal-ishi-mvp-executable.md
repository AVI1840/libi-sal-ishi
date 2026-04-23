<div dir="rtl">

# סל אישי — מערכת מינימלית להפעלה

> גרסה מצומצמת, ברוטלית בתעדוף. רק מה שעובד.

---

## 1. תהליך עבודה אחד — הזרימה שמוכיחה הכל

```
קליטה → ציון → המלצה → סבסוד → הזמנה → פעולת מתאמת
```

**למה דווקא הזרימה הזו?** כי היא חוצה את כל השחקנים (אזרח, מערכת, ספק, מתאמת), מפעילה את כל המנועים (recommendation, subsidy, CRM), ומוכיחה את הערך העסקי (הטיית תקציב למניעה).

```
אזרח עונה על 6 שאלות
        ↓
מערכת מחשבת: ICF + פרסונה + דגלי סיכון
        ↓
מנוע המלצות מדרג 18 שירותים (safety filter → scoring → persona boost)
        ↓
מנוע סבסוד מחשב מחיר אישי (עולם תוכן → טייר → בוסטרים)
        ↓
אזרח בוחר שירות → יחידות מוקפאות → הזמנה נוצרת
        ↓
CRM מייצר פעולה למתאמת (מעקב / בדידות / יתרה)
```

---

## 2. עשרה כללי החלטה — מה שמפעיל את המערכת

</div>

```json
{
  "decision_engine": {
    "version": "1.0-mvp",
    "rules_count": 10,
    "conflict_resolution": "priority_order_then_first_match",
    "rules": [
      {
        "id": "R01",
        "name": "emergency_override",
        "priority": 0,
        "condition": "message contains EMERGENCY_KEYWORDS (16 phrases)",
        "decision": "HALT all flows → emergency protocol → alert family + case_manager",
        "output": { "action": "emergency", "block_other_rules": true },
        "source": "safety",
        "note": "Always fires first. Overrides everything."
      },
      {
        "id": "R02",
        "name": "safety_filter",
        "priority": 1,
        "condition": "user.icf < service.icf_requirements",
        "decision": "HIDE service from user (hard gate, no override)",
        "output": { "action": "filter_out", "visible": false },
        "source": "safety",
        "note": "Mobility, hearing, vision, cognitive. Non-negotiable."
      },
      {
        "id": "R03",
        "name": "unit_allocation",
        "priority": 2,
        "condition": "user.nursing_level IN [1,2,3]",
        "decision": "ALLOCATE units: L1=19, L2=32, L3=43 monthly",
        "output": { "action": "allocate", "units": "NURSING_LEVEL_UNITS[level]", "expires_days": 90 },
        "source": "policy (bituach leumi)",
        "note": "Levels 4-6 excluded from MVP — estimates only."
      },
      {
        "id": "R04",
        "name": "subsidy_prevention_free",
        "priority": 3,
        "condition": "service.content_world IN [belonging_meaning, health_function]",
        "decision": "SUBSIDY 100% — service is free",
        "output": { "action": "set_subsidy", "percentage": 1.0 },
        "source": "government decision",
        "note": "Core reform logic: prevention services are free."
      },
      {
        "id": "R05",
        "name": "subsidy_resilience_half",
        "priority": 3,
        "condition": "service.content_world IN [resilience, assistive_tech]",
        "decision": "SUBSIDY 50%",
        "output": { "action": "set_subsidy", "percentage": 0.5 },
        "source": "government decision"
      },
      {
        "id": "R06",
        "name": "subsidy_home_minimal",
        "priority": 3,
        "condition": "service.content_world = home_services",
        "decision": "SUBSIDY 20%",
        "output": { "action": "set_subsidy", "percentage": 0.2 },
        "source": "government decision",
        "note": "Nudge: home services cost 80% — not blocked, just expensive."
      },
      {
        "id": "R07",
        "name": "loneliness_nudge",
        "priority": 4,
        "condition": "user.loneliness_score < 4 AND service.is_group_activity = true",
        "decision": "BOOST subsidy +20% (anti-loneliness nudge)",
        "output": { "action": "boost_subsidy", "add": 0.2, "cap": 1.0 },
        "source": "system design",
        "note": "Behavioral nudge: lonely people get group activities cheaper."
      },
      {
        "id": "R08",
        "name": "recommendation_scoring",
        "priority": 5,
        "condition": "service passes safety_filter (R02)",
        "decision": "SCORE = prevention(40%) + meaning_match(30%) + proximity(20%) + social_proof(10%) × persona_boost",
        "output": { "action": "rank", "formula": "weighted_score × (1 + persona_boost)" },
        "source": "algorithm",
        "note": "Persona boost: security_seeker+tech=×1.5, social+group=×1.3, learner+cognitive=×1.3"
      },
      {
        "id": "R09",
        "name": "silent_user_alert",
        "priority": 6,
        "condition": "days_since_last_activity >= 21",
        "decision": "CREATE CRM action: 'contact user' priority=HIGH",
        "output": { "action": "crm_action", "type": "silent_user", "priority": "high", "due": "today" },
        "source": "KPI threshold",
        "note": "21 days = the system's definition of 'lost' user."
      },
      {
        "id": "R10",
        "name": "expiring_balance_alert",
        "priority": 6,
        "condition": "wallet.days_until_expiry <= 14 AND wallet.available_units > 0",
        "decision": "CREATE CRM action: 'use balance before expiry' priority=URGENT",
        "output": { "action": "crm_action", "type": "expiring_balance", "priority": "urgent", "due": "today" },
        "source": "KPI threshold",
        "note": "Money on the table. Most actionable alert for case managers."
      }
    ],
    "execution_order": [
      "R01 (emergency) — if fires, stop",
      "R02 (safety filter) — per service, filter catalog",
      "R03 (allocation) — once per month",
      "R04-R06 (subsidy tier) — per service, mutually exclusive",
      "R07 (loneliness nudge) — additive on top of R04-R06",
      "R08 (recommendation) — scoring on filtered+subsidized catalog",
      "R09-R10 (CRM) — daily batch job"
    ],
    "conflict_handling": {
      "R04_vs_R05_vs_R06": "Mutually exclusive by content_world. One service = one world = one tier.",
      "R07_on_top_of_R04": "Additive. R04 gives 100%, R07 adds 20%, cap at 100%. Net effect: 100%.",
      "R07_on_top_of_R06": "Additive. R06 gives 20%, R07 adds 20% = 40%. Lonely user pays 60% for home service with group.",
      "R09_vs_R10": "Both can fire for same user. Both create separate CRM actions. No conflict."
    }
  }
}
```

<div dir="rtl">

---

## 3. הגדרת MVP — מה נבנה בשבועיים

### נבנה (must have)

| רכיב | מה בדיוק | זמן |
|------|----------|-----|
| אשף קליטה | 6 שאלות → ICF + פרסונה + דגלי סיכון | 2 ימים |
| מנוע המלצות | safety filter + 4-factor scoring + persona boost | 2 ימים |
| מנוע סבסוד | 5 טיירים + 2 בוסטרים + חישוב מחיר | 1 יום |
| ארנק דיגיטלי | הקצאה + הקפאה + ניכוי + תפוגה | 2 ימים |
| CRM פעולות | 3 סוגים: שקט, בדידות, יתרה פגה | 1 יום |
| ממשק מתאמת | dashboard + רשימת פעולות + פרופיל לקוח | 3 ימים |
| ממשק אזרח | קטלוג שירותים + הזמנה + ארנק | 2 ימים |
| חיבור E2E | Frontend ↔ Backend: intake → recommend → book | 1 יום |

**סה"כ: 14 ימי עבודה**

### לא נבנה (cut)

| רכיב | למה לא | חלופה בדמו |
|------|--------|-----------|
| Limor AI (שיחה חופשית) | דורש LLM, prompt engineering, testing | סקריפט דמו קבוע |
| WhatsApp integration | דורש Business API, אישורים | Web chat בלבד |
| Health monitor | אין מכשירים מחוברים | mock readings |
| Vector memory (Pinecone) | complexity vs. value | session memory בלבד |
| Multi-tenancy | אתר אחד בפיילוט | authority_id=null |
| תשלום אמיתי לספקים | דורש clearing house | mock transactions |
| רמות סיעוד 4-6 | אומדן, לא מדיניות | רמות 1-3 בלבד |
| Feedback loop | דורש data collection | ידני |
| Escalation אוטומטי | דורש workflow engine | מתאמת מנהלת ידנית |

---

## 4. שכבת הדמו — מה אמיתי ומה מדומה

### אמיתי (לוגיקה עובדת)

| רכיב | מה עובד | ראיה |
|------|---------|------|
| אשף קליטה | 6 שאלות → חישוב פרופיל מלא | `lev_profile.py`: `compute_from_intake`, `compute_from_profile` |
| Safety filter | ICF requirements × user profile → hide/show | `recommendation/engine.py`: `_check_safety_filter` |
| Scoring algorithm | 4 factors × weights + persona boost = ranked list | `recommendation/engine.py`: `_score_service` |
| Subsidy calculation | content_world → tier → boosters → final price | `subsidy/engine.py`: `calculate_subsidy` |
| CRM action generation | risk flags + wallet status → prioritized action list | `crm/engine.py`: `generate_actions` |
| Risk flag computation | intake data → loneliness/fall/cognitive/inactive flags | `lev_profile.py`: `RiskFlags.compute_from_intake` |

### מדומה (mock data)

| רכיב | מה מדומה | מה צריך כדי להפוך לאמיתי |
|------|---------|--------------------------|
| 75 לקוחות | generated randomly ב-`mockData.ts` | DB + intake flow |
| 18 שירותים | hardcoded ב-`mockData.ts` | vendor onboarding |
| 3 ספקים | hardcoded | vendor portal + registration |
| ארנק | `WalletService.get_wallet` returns mock dict | PostgreSQL + monthly allocation job |
| הזמנות | mock bookings | booking API + vendor confirmation |
| AI שיחה | `Orchestrator` + `LimorAgent` — LLM calls | API key + testing |
| התראות למשפחה | `LimorAlert` model exists | push notifications / SMS |

---

## 5. תובנות למקבלי החלטות

### שלוש בעיות

**בעיה 1: כסף על השולחן**
אזרחים ותיקים לא מנצלים שעות סיעוד. ברמה 3 (הנפוצה), 21.5 שעות חודשיות שוות ~4,300 ₪. שיעור ניצול ממוצע: ~60%. כלומר ~1,700 ₪ לחודש לאזרח הולכים לאיבוד.

**בעיה 2: הכסף הולך למקום הלא נכון**
כשכן מנצלים — רוב התקציב הולך לשירותי בית (ניקיון, עזרה) ולא לשירותי מניעה (פעילות חברתית, כושר, קוגניציה). שירותי מניעה מפחיתים אשפוזים ב-30-40%.

**בעיה 3: מתאמות לא מסוגלות לגדול**
מתאמת שירות מנהלת 30 לקוחות ידנית. הרפורמה דורשת 75+. בלי כלים — זה בלתי אפשרי.

### שלושה פתרונות

**פתרון 1: ארנק דיגיטלי עם תפוגה**
שעות סיעוד הופכות ליחידות בארנק שפג תוקפן אחרי 90 יום. זה יוצר לחץ חיובי לניצול + שקיפות מלאה.

**פתרון 2: סבסוד דינמי כ-nudge**
שירותי מניעה (פעילות חברתית, כושר) = חינם (100% סבסוד). שירותי בית = 80% מהמחיר (20% סבסוד). לא חוסמים בחירה — מכוונים אותה.

**פתרון 3: CRM מונחה-פעולות**
במקום רשימת 75 לקוחות — המתאמת רואה רשימת פעולות ממוינת: "התקשר ליוסף — שקט 21 יום", "הצע לשרה פעילות קבוצתית — ציון בדידות 3/10", "יתרה של דוד פגה בעוד 12 יום".

### שלוש תוצאות מדידות

| מדד | מצב נוכחי (הערכה) | יעד אחרי 6 חודשי פיילוט | איך מודדים |
|-----|-------------------|-------------------------|-----------|
| **שיעור ניצול ארנק** | ~60% | 85%+ | units_used / units_allocated per month |
| **אחוז שירותי מניעה** | ~20% מהשימוש | 60%+ | bookings in [belonging, health] / total bookings |
| **לקוחות למתאמת** | 30 | 75+ | active_clients / case_managers, with same satisfaction |

---

## 6. תרחיש דמו — 5 דקות

</div>

```
דקה 1: קליטה
─────────────
מתאמת פותחת פרופיל חדש: "שרה כהן, 78, רמת גן, רמת סיעוד 2"
אשף קליטה: שרה עונה על 6 שאלות
→ ניידות: עצמאית עם הליכון
→ שמיעה: לקות שמיעה
→ מה מביא שמחה: מוזיקה, נכדים, בישול
→ בדידות: 3/10 (בודדה)
→ מעדיפה: קבוצתי
→ חלום: "לבשל עם הנכדות"

מערכת מחשבת:
→ פרסונה: family_oriented (secondary: social_butterfly)
→ דגלי סיכון: בדידות ✅, נפילה ❌
→ ארנק: 32 יחידות חודשיות

דקה 2: המלצות
──────────────
מסך שירותים מציג 12 שירותים (6 סוננו ע"י safety filter — דורשים שמיעה תקינה)

Top 3:
1. מועדון צהריים חברתי — ציון 89 — חינם (100% סבסוד + loneliness nudge)
   "פעילות חברתית • מתאים לתחומי העניין: בישול • קרוב לביתך"
2. מקהלת הזהב — ציון 82 — חינם (100% סבסוד)
   "מתאים לתחומי העניין: מוזיקה • פעילות חברתית"
3. סדנת ציור — ציון 74 — חינם (100% סבסוד)

שירות בית (לשם השוואה):
8. שירותי ניקיון — ציון 41 — 96 ₪ (מתוך 120, סבסוד 20%)

דקה 3: הזמנה
─────────────
שרה בוחרת "מועדון צהריים חברתי"
→ מחיר: 0 ₪ (100% סבסוד — belonging_meaning + loneliness boost)
→ יחידות: 1 יחידה מוקפאת מהארנק
→ הזמנה נוצרת: pending → confirmed
→ ספק מקבל הודעה

דקה 4: Dashboard מתאמת
───────────────────────
מתאמת פותחת dashboard:
→ 12 פעולות דחופות היום
→ #1 URGENT: "דוד לוי — 8 יחידות פגות בעוד 11 יום"
→ #2 HIGH: "שרה כהן — ציון בדידות 3/10, להציע פעילות קבוצתית"
   → הקשר: פרסונה family_oriented, טיפ: "להזמין את הבת לשיחה"
   → שירות מומלץ: מועדון צהריים חברתי
→ #3 HIGH: "יוסף מזרחי — שקט 24 יום"

דקה 5: KPIs
────────────
מנהל רשות רואה:
→ שיעור ניצול ארנק: 78% (יעד: 85%)
→ אחוז שירותי מניעה: 54% (יעד: 60%)
→ לקוחות למתאמת: 75 (לפני: 30)
→ ספקים פעילים: 3, דירוג ממוצע: 4.87
```

<div dir="rtl">

---

## סיכום: מה הופך את זה למערכת אמיתית

המערכת הזו היא לא "עוד אפליקציה". היא **מנוע החלטות** שמפעיל 10 כללים בסדר קבוע:

1. **בטיחות קודם** (R01-R02) — חירום וסינון תפקודי
2. **הקצאה אוטומטית** (R03) — שעות → יחידות
3. **סבסוד כ-nudge** (R04-R07) — מניעה חינם, בית ב-80%
4. **המלצה אישית** (R08) — 4 factors + פרסונה
5. **CRM פרואקטיבי** (R09-R10) — פעולות, לא רשימות

**מה שהופך את זה לרפורמה:** לא הטכנולוגיה — אלא שהכסף זורם אחרת. שירותי מניעה חינמיים, שירותי בית יקרים יותר, ומתאמת שרואה פעולות במקום שמות.

</div>
