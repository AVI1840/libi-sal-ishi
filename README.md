<div align="center">

# LIBI — סל אישי For You

### מערכת הפעלה לזכויות ושירותים לאזרח הוותיק

**Strategic Demo · Government & Public Sector**

[![Python 3.11+](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Status-Strategic%20Demo-orange.svg)]()

**🔗 [דף נחיתה](https://libi-landing.vercel.app) · [ממשק אזרח](https://libi-sal-ishi.vercel.app) · [לוח בקרה למתאמת](https://libi-case-manager.vercel.app) · [פורטל ספקים](https://libi-vendor-portal.vercel.app)**

</div>

---

## במשפט אחד

LIBI היא מערכת AI שמזהה אוטומטית לאיזה שירותים ותמיכות זכאי האזרח הוותיק, מתאימה לו את הסל האישי שלו, ומבצעת הזמנות בשמו — בלי שיצטרך לנווט בירוקרטיה.

---

## הבעיה היום

בישראל חיים כ-1.2 מיליון אזרחים ותיקים. רובם זכאים לשירותים ממשלתיים — פיזיותרפיה, פעילות חברתית, ציוד מסייע, ועוד — אך **לא מממשים את הזכויות שלהם**.

הסיבות:
- **מורכבות בירוקרטית** — קשה להבין מה מגיע ומה לא
- **פיצול מידע** — הזכויות מפוזרות בין משרדים, קופות חולים, ביטוח לאומי
- **חסמי נגישות** — קשיי שמיעה, ראייה, ניידות, ואוריינות דיגיטלית
- **בדידות** — אין מי שיסייע לנווט את המערכת

התוצאה: **מיליארדי שקלים של זכויות לא מנוצלות** מדי שנה, ואזרחים שמקבלים פחות ממה שמגיע להם.

---

## מה LIBI עושה

LIBI היא **מערכת הפעלה לזכויות** — שכבת AI שיושבת מעל מערכות קיימות ומחברת בין האזרח לשירות.

```
האזרח מדבר עם LIBI בעברית פשוטה
        ↓
LIBI מזהה צרכים, זכויות, ומצב תפקודי
        ↓
LIBI בונה סל שירותים מותאם אישית
        ↓
LIBI מבצעת הזמנות, שולחת תזכורות, מעדכנת משפחה
        ↓
מתאמת השירות רואה הכל בלוח בקרה אחד
```

### שלושה ממשקים, שלוש נקודות מבט

| ממשק | למי | מה הוא עושה |
|------|-----|-------------|
| **Web Client** | האזרח הוותיק | שיחה עם AI, גלישה בשירותים, הזמנה |
| **Case Manager Dashboard** | מתאמת שירות | ניטור 75+ לקוחות, התראות, פעולות CRM |
| **Vendor Portal** | ספק שירות | ניהול שירותים, הזמנות, תשלומים |

---

## ערך למערכת הציבורית

### חיסכון כספי
- **ניצול זכויות קיימות** — כל שקל שהוקצה אך לא נוצל הוא כישלון מדיניות
- **מניעה > טיפול** — שירותי מניעה (100% סבסוד) מפחיתים אשפוזים יקרים
- **יעילות תפעולית** — מתאמת שירות מנהלת 75 לקוחות במקום 30

### שיפור שירות
- **זמינות 24/7** — AI זמין גם בשעות שאין מתאמת
- **עברית טבעית** — ללא צורך באוריינות דיגיטלית
- **מעקב רציף** — זיהוי מוקדם של ירידה תפקודית או בדידות

### מדידה ושקיפות
- **KPIs בזמן אמת** — אחוז ניצול, שיעור מניעה, שביעות רצון
- **Audit log מלא** — כל פעולה מתועדת לצורכי ביקורת
- **דוחות אוטומטיים** — לרשות, למשרד, לביטוח לאומי

---

## תרחישי דמו

### תרחיש 1 — קליטת אזרח חדש (5 דקות)

> **שרה, 78, רמת גן. רמת סיעוד 3. גרה לבד.**

1. מתאמת השירות פותחת **Case Manager Dashboard**
2. לוחצת "לקוח חדש" → אשף קליטה מודרך
3. LIBI מנתחת: ניידות, חושים, אוריינות דיגיטלית, תחומי עניין
4. המערכת מייצרת **פרופיל לב** — פרסונה, דגלי סיכון, המלצות
5. **סל מותאם אישית** נוצר אוטומטית: 96 יחידות, 5 שירותים מומלצים
6. שרה מקבלת SMS עם קישור לממשק האישי שלה

**מה רואים:** פרופיל מלא תוך 5 דקות, ללא טפסים ידניים.

---

### תרחיש 2 — המלצת זכאות ושיבוץ שירות (3 דקות)

> **שרה פותחת את ה-Web Client ומדברת עם LIBI**

```
שרה:  "הגב כואב לי כבר כמה ימים"

LIBI: "אני מצטערת לשמוע 💙 האם זה כאב חדש?
       רואה שיש לך 32 יחידות בארנק.
       רוצה שאמצא פיזיותרפיסט שיבוא הביתה?"

שרה:  "כן, בבקשה"

LIBI: "✅ קבעתי תור ליום שלישי 10:00.
       עלות: 2 יחידות. שלחתי תזכורת לטלפון
       ועדכנתי את דני (הבן שלך)."
```

**מה רואים:** מ-כאב → הזמנה מאושרת תוך 90 שניות, ללא שיחות טלפון.

---

### תרחיש 3 — ניהול CRM ומניעת בדידות (2 דקות)

> **מתאמת השירות פותחת את לוח הבקרה בבוקר**

1. **3 התראות דחופות** מחכות: יוסף לא פעיל 21 יום, שרה — ציון בדידות נמוך, משה — 15 יחידות עומדות לפוג
2. לוחצת על "שרה" → רואה פרופיל מלא + המלצת פעולה: "להציע מועדון צהריים חברתי"
3. לוחצת "בצע" → LIBI שולחת הצעה לשרה ומתאמת הרשמה
4. **KPI dashboard**: 62% שירותי מניעה, 78% ניצול ארנק, 4.7 דירוג ספקים

**מה רואים:** מתאמת אחת מנהלת 75 לקוחות ביעילות, עם עדיפויות ברורות.

---

## ארכיטקטורה

```
┌─────────────────────────────────────────────────────────┐
│                    LIBI — Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Web Client  │  │Case Manager  │  │Vendor Portal │  │
│  │  (אזרח)     │  │  Dashboard   │  │  (ספקים)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼─────────────────┼─────────────────┼───────────┘
          │                 │                 │
          └─────────────────▼─────────────────┘
                            │
                 ┌──────────▼──────────┐
                 │  Integration Gateway │  :8000
                 │  (API Gateway + Auth)│
                 └──────┬──────────────┘
                        │
          ┌─────────────┼─────────────┐
          │             │             │
   ┌──────▼──────┐      │      ┌──────▼──────┐
   │  AI Agent   │      │      │ Marketplace │
   │   :8001     │      │      │   :8002     │
   │             │      │      │             │
   │ • שיחה      │      │      │ • ארנק      │
   │ • בריאות    │      │      │ • שירותים   │
   │ • זיכרון    │      │      │ • הזמנות    │
   │ • התראות    │      │      │ • ספקים     │
   └──────┬──────┘      │      └──────┬──────┘
          │             │             │
          └─────────────▼─────────────┘
                        │
          ┌─────────────┼─────────────┐
          │                           │
   ┌──────▼──────┐             ┌──────▼──────┐
   │ PostgreSQL  │             │    Redis    │
   │  (נתונים)  │             │  (sessions) │
   └─────────────┘             └─────────────┘
```

### מחסנית טכנולוגית

**Backend:** Python 3.11 · FastAPI · LangChain/LangGraph · PostgreSQL · Redis  
**Frontend:** React 18 · TypeScript · Vite · Tailwind CSS · shadcn/ui  
**AI:** Anthropic Claude / OpenAI GPT-4 / Google Gemini (ניתן להחלפה)  
**Infrastructure:** Docker Compose · JWT Auth · RBAC · Audit Logging

---

## התחלה מהירה

### דרישות מקדימות
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) מותקן ופועל
- מפתח API של Anthropic, OpenAI, או Google (לפחות אחד)

### הרצה ב-5 דקות

```bash
# 1. שכפל את הריפו
git clone https://github.com/your-org/libi-sal-ishi.git
cd libi-sal-ishi

# 2. הגדר משתני סביבה
cp .env.example .env
# ערוך את .env והוסף לפחות מפתח LLM אחד

# 3. הפעל את כל המערכת
docker compose -f infrastructure/docker/docker-compose.yml up -d

# 4. בדוק שהכל עובד
curl http://localhost:8000/health
curl http://localhost:8001/health
curl http://localhost:8002/health
```

### ממשקי Frontend (הרצה מקומית)

```bash
cd frontend

# התקן תלויות
npm install

# Web Client (ממשק האזרח) — http://localhost:3000
npm run dev:web-client

# Case Manager Dashboard — http://localhost:3001
npm run dev:case-manager

# Vendor Portal — http://localhost:3002
npm run dev:vendor-portal
```

### נקודות גישה

| שירות | כתובת | תיאור |
|-------|--------|--------|
| Integration Gateway | http://localhost:8000 | API Gateway מרכזי |
| AI Agent | http://localhost:8001 | סוכן AI + שיחה |
| Marketplace | http://localhost:8002 | שוק שירותים |
| API Docs (AI) | http://localhost:8001/docs | Swagger UI |
| API Docs (Marketplace) | http://localhost:8002/docs | Swagger UI |

---

## API — נקודות קצה מרכזיות

### AI Agent (8001)

```
POST /api/v1/conversations/              יצירת שיחה חדשה
POST /api/v1/conversations/{id}/messages שליחת הודעה
GET  /api/v1/demo/scenarios              תרחישי דמו זמינים
POST /api/v1/demo/scenarios/{id}/stream  הרצת תרחיש דמו (SSE)
GET  /api/v1/demo/users                  משתמשי דמו
GET  /api/v1/health/alerts               התראות בריאות
```

### Marketplace (8002)

```
GET  /api/v1/wallets/me                  ארנק המשתמש
GET  /api/v1/services/                   רשימת שירותים
GET  /api/v1/services/optimal-aging      שירותי הזדקנות מיטבית
POST /api/v1/bookings/                   יצירת הזמנה
GET  /api/v1/lev/intake/questions        שאלות אשף הקליטה
POST /api/v1/lev/intake/submit           שליחת פרופיל
GET  /api/v1/lev/recommendations/{id}    המלצות אישיות
GET  /api/v1/lev/crm/actions             פעולות CRM למתאמת
GET  /api/v1/lev/crm/dashboard           KPI dashboard
POST /api/v1/lev/subsidy/calculate       חישוב סבסוד דינמי
```

---

## מבנה הריפו

```
libi-sal-ishi/
├── packages/
│   ├── shared/          # מודלים, auth, קבועים משותפים
│   ├── ai-agent/        # שירות AI — שיחה, בריאות, זיכרון
│   ├── marketplace/     # שוק שירותים, ארנק, הזמנות
│   └── integration/     # API Gateway ו-webhooks
├── frontend/
│   ├── web-client/      # ממשק האזרח הוותיק
│   ├── case-manager-dashboard/  # לוח בקרה למתאמת
│   ├── vendor-portal/   # פורטל ספקים
│   └── shared-ui/       # ספריית קומפוננטות משותפת
├── infrastructure/
│   └── docker/          # Docker Compose + Dockerfiles + DB init
├── docs/
│   ├── demo-script.md   # סקריפט הדגמה מלא
│   └── architecture.md  # תיעוד ארכיטקטורה
├── .env.example         # תבנית משתני סביבה
├── LICENSE              # MIT
└── CONTRIBUTING.md      # הנחיות תרומה
```

---

## הגדרות סביבה עיקריות

ראה [.env.example](.env.example) לרשימה מלאה. המינימום להרצת דמו:

```env
# LLM — חובה לפחות אחד
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=your-key-here

# Database (ברירת מחדל עובדת עם Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/libi_db

# JWT
JWT_SECRET_KEY=replace-with-random-secret-min-32-chars
```

---

## אבטחה ופרטיות

- כל נתוני הדמו הם **פיקטיביים לחלוטין** — אין מידע אישי אמיתי
- JWT authentication + RBAC עם 8 תפקידים
- הצפנת PII (AES-256) בסביבת ייצור
- Audit log מלא לכל פעולה
- Rate limiting על כל ה-endpoints

> ⚠️ **זהו דמו אסטרטגי.** אין להשתמש בו בסביבת ייצור ללא התאמות אבטחה נוספות.

---

## רישיון

[MIT License](LICENSE) — ראה קובץ LICENSE לפרטים.

---

<div align="center">

**LIBI — כי כל אזרח ותיק ראוי לקבל את מה שמגיע לו**

*Built with ❤️ for Israel's aging population*

</div>
