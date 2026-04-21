import { Button, calculateFitScore, cn, getRecommendations, services } from '@libi/shared-ui';
import {
    MapPin,
    Send,
    Settings,
    Sparkles,
    Star,
    Volume2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { useApp } from '../contexts/AppContext';

// Persona types
type PersonaType = 'warm_grandchild' | 'efficient_assistant' | 'motivational_coach';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: typeof services;
  emotionalState?: {
    emotion: string;
    showSupport: boolean;
  };
  actions?: { type: string; label: string }[];
}

// Persona configurations
const PERSONA_CONFIG: Record<PersonaType, {
  name: string;
  avatar: string;
  gradient: string;
  greeting: (name: string) => string;
  style: string;
  useEmojis: boolean;
}> = {
  warm_grandchild: {
    name: 'לימור',
    avatar: '💙',
    gradient: 'from-blue-500 to-cyan-400',
    greeting: (name) => `שלום ${name} יקיר/ה! 😊\n\nאני לימור, כאן בשבילך.\nאיך אני יכולה לעזור לך היום?`,
    style: 'חם ואכפתי',
    useEmojis: true,
  },
  efficient_assistant: {
    name: 'לימור',
    avatar: '📋',
    gradient: 'from-slate-600 to-slate-400',
    greeting: (name) => `שלום ${name}.\n\nאני לימור, העוזרת האישית שלך.\nבמה אוכל לעזור?`,
    style: 'יעיל ותמציתי',
    useEmojis: false,
  },
  motivational_coach: {
    name: 'לימור',
    avatar: '💪',
    gradient: 'from-orange-500 to-amber-400',
    greeting: (name) => `היי ${name}! 🌟\n\nאני לימור - ויחד נעשה דברים מדהימים!\nמה בתוכנית להיום?`,
    style: 'מעודד ואנרגטי',
    useEmojis: true,
  },
};

// Loneliness keywords (Hebrew)
const LONELINESS_KEYWORDS = ['לבד', 'בודד', 'אף אחד', 'משעמם', 'עצוב'];

// Emergency keywords
const EMERGENCY_KEYWORDS = ['כאב בחזה', 'לא יכול לנשום', 'נפלתי', 'עזרה'];

// Suggested questions per persona
const SUGGESTED_QUESTIONS: Record<PersonaType, string[]> = {
  warm_grandchild: [
    'מה שלומך היום?',
    'ספר/י לי מה חדש',
    'אני מחפש/ת פעילות נחמדה',
    'מתי הפגישה הבאה שלי?',
  ],
  efficient_assistant: [
    'הצג את התורים שלי',
    'חפש פעילות גופנית',
    'מה היתרה בארנק?',
    'הזמן שירות',
  ],
  motivational_coach: [
    'מה הכי מומלץ לי היום?',
    'אני רוצה לעשות משהו חדש!',
    'איך אני יכול/ה להתקדם?',
    'תמריץ אותי! 💪',
  ],
};

export default function Chat() {
  const { currentClient } = useApp();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<PersonaType>('warm_grandchild');
  const [showSettings, setShowSettings] = useState(false);

  const firstName = currentClient.name.split(' ')[0];
  const config = PERSONA_CONFIG[persona];
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: config.greeting(firstName),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset greeting when persona changes
  useEffect(() => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: PERSONA_CONFIG[persona].greeting(firstName),
    }]);
  }, [persona, firstName]);

  // Detect emotional state
  const detectEmotionalState = (message: string): { emotion: string; showSupport: boolean } => {
    const lowerMsg = message.toLowerCase();

    // Check for loneliness
    if (LONELINESS_KEYWORDS.some(kw => lowerMsg.includes(kw))) {
      return { emotion: 'lonely', showSupport: true };
    }

    // Check for distress
    if (['רע', 'נורא', 'לא טוב'].some(kw => lowerMsg.includes(kw))) {
      return { emotion: 'sad', showSupport: true };
    }

    // Positive
    if (['שמח', 'טוב', 'מצוין', 'נהדר'].some(kw => lowerMsg.includes(kw))) {
      return { emotion: 'happy', showSupport: false };
    }

    return { emotion: 'neutral', showSupport: false };
  };

  const generateResponse = (query: string) => {
    const lowerQuery = query.toLowerCase();
    const cfg = PERSONA_CONFIG[persona];
    let responseText = '';
    let recs = getRecommendations(currentClient, 3);
    let emotionalState = detectEmotionalState(query);
    let actions: { type: string; label: string }[] = [];

    // Emergency check
    if (EMERGENCY_KEYWORDS.some(kw => lowerQuery.includes(kw))) {
      return {
        text: `🚨 אני מזהה שאתה לא מרגיש טוב.\n\nאני כאן איתך. אנא:\n1. שב במקום בטוח\n2. נשום לאט ועמוק\n3. אם זה מצב חירום - חייג 101\n\nאני שולח התראה למשפחה שלך.`,
        recommendations: [],
        emotionalState: { emotion: 'emergency', showSupport: true },
        actions: [
          { type: 'call_emergency', label: '📞 חייג 101' },
          { type: 'call_family', label: '👨‍👩‍👧 התקשר למשפחה' },
        ],
      };
    }

    // Loneliness support
    if (emotionalState.emotion === 'lonely') {
      const prefix = cfg.useEmojis ? '💙 ' : '';
      responseText = `${prefix}אני שומע/ת שקצת בודד לך. זה בסדר להרגיש ככה.\n\n`;

      if (persona === 'warm_grandchild') {
        responseText += `מתי דיברת לאחרונה עם המשפחה? אולי נתקשר ביחד?\n\nבינתיים, הנה כמה פעילויות חברתיות שיכולות להתאים לך:`;
      } else if (persona === 'motivational_coach') {
        responseText += `אבל יש פתרון! 💪 בוא נמצא משהו מגניב לעשות.\n\nהנה כמה אפשרויות:`;
      } else {
        responseText += `יש כמה אפשרויות שאולי יעזרו:`;
      }

      recs = services
        .filter(s => s.category === 'social')
        .map(s => ({ ...s, ...calculateFitScore(currentClient, s) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) as any;

      actions = [
        { type: 'call_family', label: '📞 להתקשר למשפחה' },
        { type: 'find_activity', label: '🎯 חיפוש פעילות חברתית' },
      ];

      return { text: responseText, recommendations: recs, emotionalState, actions };
    }

    // Service search responses
    if (lowerQuery.includes('גופני') || lowerQuery.includes('כושר') || lowerQuery.includes('ספורט')) {
      recs = services
        .filter(s => s.category === 'fitness')
        .map(s => ({ ...s, ...calculateFitScore(currentClient, s) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) as any;

      if (persona === 'warm_grandchild') {
        responseText = 'מצאתי לך כמה פעילויות גופניות שיכולות להתאים לך 😊\nהנה ההמלצות שלי:';
      } else if (persona === 'motivational_coach') {
        responseText = 'יאללה, בוא נזיז את הגוף! 💪🔥\nהנה אפשרויות מעולות:';
      } else {
        responseText = 'מצאתי את הפעילויות הגופניות הבאות:';
      }
    } else if (lowerQuery.includes('חברתי') || lowerQuery.includes('חברים') || lowerQuery.includes('אנשים')) {
      recs = services
        .filter(s => s.category === 'social')
        .map(s => ({ ...s, ...calculateFitScore(currentClient, s) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) as any;

      if (persona === 'warm_grandchild') {
        responseText = 'כיף שאתה רוצה לפגוש אנשים! 🤝\nהנה פעילויות חברתיות שיכולות להתאים:';
      } else if (persona === 'motivational_coach') {
        responseText = 'מעולה! חיים חברתיים = חיים בריאים! 🌟\nהנה מה שמצאתי:';
      } else {
        responseText = 'הנה פעילויות חברתיות מתאימות:';
      }
    } else if (lowerQuery.includes('חינם') || lowerQuery.includes('סל')) {
      recs = services
        .filter(s => s.price === 0 || s.fundingSource === 'סל')
        .map(s => ({ ...s, ...calculateFitScore(currentClient, s) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3) as any;

      responseText = cfg.useEmojis
        ? '💰 הנה שירותים חינמיים או מכוסים מהסל:'
        : 'הנה שירותים חינמיים או מכוסים מהסל:';
    } else if (lowerQuery.includes('יתרה') || lowerQuery.includes('ארנק') || lowerQuery.includes('כסף')) {
      const balance = currentClient.walletBalance;
      const used = currentClient.walletUsed;
      const total = currentClient.walletTotal;

      if (persona === 'warm_grandchild') {
        responseText = `💰 יקיר/ה, יש לך ₪${balance.toLocaleString()} זמינים בארנק.\n\nעד עכשיו השתמשת ב-₪${used.toLocaleString()} מתוך ₪${total.toLocaleString()}.\n\nיש משהו שהיית רוצה לעשות? 😊`;
      } else if (persona === 'motivational_coach') {
        responseText = `💪 יש לך ₪${balance.toLocaleString()} להשקיע בעצמך!\n\nכבר ניצלת ₪${used.toLocaleString()} - יופי!\n\nבוא נמצא את הפעילות הבאה שלך! 🎯`;
      } else {
        responseText = `יתרה זמינה: ₪${balance.toLocaleString()}\nנוצל: ₪${used.toLocaleString()} מתוך ₪${total.toLocaleString()}`;
      }
      return { text: responseText, recommendations: [], emotionalState, actions };
    } else if (lowerQuery.includes('תור') || lowerQuery.includes('פגישה') || lowerQuery.includes('לוח')) {
      if (persona === 'warm_grandchild') {
        responseText = `📅 הנה מה שיש לך בקרוב:\n\n• היום 10:00 - התעמלות בוקר בפארק\n• מחר 16:00 - מפגש חברתי במתנ"ס\n\nרוצה שאזכיר לך לפני? 😊`;
      } else {
        responseText = `לוח הפגישות:\n\n• היום 10:00 - התעמלות בוקר בפארק\n• מחר 16:00 - מפגש חברתי במתנ"ס`;
      }
      return { text: responseText, recommendations: [], emotionalState, actions };
    } else if (lowerQuery.includes('שלום') || lowerQuery.includes('היי') || lowerQuery.includes('מה נשמע')) {
      if (persona === 'warm_grandchild') {
        responseText = `היי יקיר/ה! 😊 שמחה לשמוע ממך!\n\nמה שלומך היום? יש משהו מיוחד שהיית רוצה לעשות?`;
      } else if (persona === 'motivational_coach') {
        responseText = `היי! 🌟 מה קורה? מוכן/ה ליום מדהים?\n\nמה בתוכנית?`;
      } else {
        responseText = `שלום! במה אוכל לעזור?`;
      }
      return { text: responseText, recommendations: [], emotionalState, actions };
    } else {
      if (persona === 'warm_grandchild') {
        responseText = `בהתבסס על מה שאני יודע/ת עליך, הנה מה שאני חושב/ת שיתאים לך היום 😊`;
      } else if (persona === 'motivational_coach') {
        responseText = `הנה המלצות שיעזרו לך להמשיך קדימה! 🚀`;
      } else {
        responseText = `הנה ההמלצות המתאימות לך:`;
      }
    }

    return { text: responseText, recommendations: recs, emotionalState, actions };
  };

  const handleSend = (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const { text, recommendations, emotionalState, actions } = generateResponse(messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        recommendations: recommendations as any,
        emotionalState,
        actions,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 800 + Math.random() * 400);
  };

  return (
    <div className="page-container flex flex-col bg-gradient-to-b from-primary/5 to-background">
      <Header title="לימור - העוזרת שלך" showBack />

      <main className="flex-1 flex flex-col pb-20">
        {/* Persona Indicator */}
        <div className="content-padding py-3 flex items-center justify-between border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-xl shadow-md",
              config.gradient
            )}>
              {config.avatar}
            </div>
            <div>
              <h3 className="font-bold">{config.name}</h3>
              <p className="text-xs text-muted-foreground">סגנון: {config.style}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
              showSettings ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"
            )}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Persona Selector */}
        {showSettings && (
          <div className="content-padding py-3 bg-card border-b border-border animate-slide-up">
            <p className="text-sm font-medium mb-3">בחר/י את הסגנון המועדף:</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PERSONA_CONFIG) as [PersonaType, typeof config][]).map(([key, cfg]) => (
                <button
                  key={key}
                  onClick={() => {
                    setPersona(key);
                    setShowSettings(false);
                  }}
                  className={cn(
                    "p-3 rounded-xl border-2 transition-all text-center",
                    persona === key
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <span className="text-2xl block mb-1">{cfg.avatar}</span>
                  <span className="text-xs">{cfg.style}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto content-padding py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in">
              {/* Message Bubble */}
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 shadow-soft",
                message.role === 'user'
                  ? "bg-primary text-white mr-auto rounded-br-md"
                  : "bg-card border border-border/50 ml-auto rounded-bl-md"
              )}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
                    <span className="text-lg">{config.avatar}</span>
                    <span className="font-medium text-sm">{config.name}</span>
                  </div>
                )}
                <p className="whitespace-pre-line leading-relaxed">{message.content}</p>
              </div>

              {/* Action Buttons */}
              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 mr-auto max-w-[85%]">
                  {message.actions.map((action, idx) => (
                    <button
                      key={idx}
                      className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/30 rounded-full text-sm font-medium hover:bg-secondary hover:text-white transition-colors"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-3 space-y-3 mr-auto max-w-[90%]">
                  {message.recommendations.map((service: any) => (
                    <div
                      key={service.id}
                      className="bg-card rounded-2xl p-4 shadow-soft cursor-pointer hover:shadow-card transition-all hover:scale-[1.01] border border-border/50"
                      onClick={() => navigate(`/service/${service.id}`)}
                    >
                      <div className="flex gap-3">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-20 h-20 rounded-xl object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold truncate">{service.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">{service.shortDesc}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-warning fill-warning" />
                              {service.rating}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {service.distanceMinutes} דק׳
                            </span>
                          </div>
                          {service.fitScore && (
                            <div className="mt-2 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-primary" />
                              <span className="text-xs text-primary font-medium">
                                {service.fitScore}% התאמה
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-left shrink-0">
                          <p className="font-bold text-primary text-lg">
                            {service.price === 0 ? 'חינם' : `₪${service.price}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="max-w-[85%] bg-card rounded-2xl rounded-bl-md p-4 shadow-soft border border-border/50 ml-auto animate-pulse-soft">
              <div className="flex items-center gap-2">
                <span className="text-lg">{config.avatar}</span>
                <span className="text-muted-foreground">מקליד/ה...</span>
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 2 && (
          <div className="content-padding pb-3">
            <p className="text-xs text-muted-foreground mb-2">הצעות:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS[persona].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="content-padding pb-4 border-t border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center gap-3 pt-4">
            <button className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Volume2 className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="כתוב/י הודעה..."
              className="flex-1 h-11 px-4 rounded-xl bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary text-right"
              dir="rtl"
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
