import { Button, cn, services } from '@libi/shared-ui';
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

type PersonaType = 'warm_grandchild' | 'efficient_assistant' | 'motivational_coach';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: typeof services;
  actions?: { type: string; label: string }[];
}

const PERSONA_CONFIG: Record<PersonaType, {
  name: string; avatar: string; gradient: string;
  greeting: (name: string) => string; style: string;
}> = {
  warm_grandchild: {
    name: 'לימור', avatar: '💙', gradient: 'from-blue-500 to-cyan-400',
    greeting: (name) => `שלום ${name} יקיר/ה! 😊\n\nאני לימור, כאן בשבילך.\nאיך אני יכולה לעזור לך היום?`,
    style: 'חם ואכפתי',
  },
  efficient_assistant: {
    name: 'לימור', avatar: '📋', gradient: 'from-slate-600 to-slate-400',
    greeting: (name) => `שלום ${name}.\n\nאני לימור, העוזרת האישית שלך.\nבמה אוכל לעזור?`,
    style: 'יעיל ותמציתי',
  },
  motivational_coach: {
    name: 'לימור', avatar: '💪', gradient: 'from-orange-500 to-amber-400',
    greeting: (name) => `היי ${name}! 🌟\n\nאני לימור - ויחד נעשה דברים מדהימים!\nמה בתוכנית להיום?`,
    style: 'מעודד ואנרגטי',
  },
};

const LONELINESS_KEYWORDS = ['לבד', 'בודד', 'אף אחד', 'משעמם', 'עצוב'];
const EMERGENCY_KEYWORDS = ['כאב בחזה', 'לא יכול לנשום', 'נפלתי', 'עזרה'];

const SUGGESTED_QUESTIONS: Record<PersonaType, string[]> = {
  warm_grandchild: ['מה שלומך היום?', 'אני מחפש/ת פעילות', 'מה היתרה שלי?', 'אני מרגיש/ה לבד'],
  efficient_assistant: ['הצג שירותים מומלצים', 'מה היתרה בארנק?', 'חפש פעילות חברתית', 'הזמן שירות'],
  motivational_coach: ['מה הכי מומלץ לי?', 'אני רוצה לעשות משהו חדש!', 'תמריץ אותי! 💪', 'מה היתרה שלי?'],
};

export default function Chat() {
  const { currentClient, recommendations } = useApp();
  const navigate = useNavigate();
  const [persona, setPersona] = useState<PersonaType>('warm_grandchild');
  const [showSettings, setShowSettings] = useState(false);

  const firstName = currentClient.name.split(' ')[0];
  const config = PERSONA_CONFIG[persona];
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'assistant', content: config.greeting(firstName) },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    setMessages([{ id: '1', role: 'assistant', content: PERSONA_CONFIG[persona].greeting(firstName) }]);
  }, [persona, firstName]);

  // Use scenario recommendations (already scored with explanations)
  const visibleRecs = recommendations.filter(s => !s.filteredOut);

  const generateResponse = (query: string) => {
    const lower = query.toLowerCase();
    const isWarm = persona === 'warm_grandchild';
    const isCoach = persona === 'motivational_coach';

    // Emergency
    if (EMERGENCY_KEYWORDS.some(kw => lower.includes(kw))) {
      return {
        text: '🚨 אני מזהה שאתה לא מרגיש טוב.\n\nאני כאן איתך. אנא:\n1. שב במקום בטוח\n2. נשום לאט ועמוק\n3. אם זה מצב חירום - חייג 101\n\nאני שולח התראה למשפחה שלך.',
        recs: [], actions: [{ type: 'call', label: '📞 חייג 101' }, { type: 'family', label: '👨‍👩‍👧 התקשר למשפחה' }],
      };
    }

    // Loneliness
    if (LONELINESS_KEYWORDS.some(kw => lower.includes(kw))) {
      const socialRecs = visibleRecs.filter(s => s.isGroupActivity).slice(0, 3);
      const prefix = isWarm ? '💙 אני שומע/ת שקצת בודד לך. זה בסדר להרגיש ככה.\n\n' :
                     isCoach ? '💪 אבל יש פתרון! בוא נמצא משהו מגניב.\n\n' :
                     '';
      return {
        text: prefix + 'הנה פעילויות חברתיות שיכולות להתאים לך — כולן חינם:',
        recs: socialRecs,
        actions: [{ type: 'family', label: '📞 להתקשר למשפחה' }, { type: 'activity', label: '🎯 חיפוש פעילות' }],
      };
    }

    // Balance
    if (lower.includes('יתרה') || lower.includes('ארנק') || lower.includes('כסף')) {
      const bal = currentClient.walletBalance * 120;
      const txt = isWarm
        ? `💰 יקיר/ה, יש לך ₪${bal.toLocaleString()} זמינים בארנק.\n\nיש משהו שהיית רוצה לעשות? 😊`
        : isCoach
        ? `💪 יש לך ₪${bal.toLocaleString()} להשקיע בעצמך!\n\nבוא נמצא את הפעילות הבאה! 🎯`
        : `יתרה זמינה: ₪${bal.toLocaleString()}`;
      return { text: txt, recs: [], actions: [] };
    }

    // Service search
    if (lower.includes('גופני') || lower.includes('כושר') || lower.includes('ספורט')) {
      const recs = visibleRecs.filter(s => s.category === 'fitness').slice(0, 3);
      const txt = isWarm ? 'מצאתי לך כמה פעילויות גופניות 😊' : isCoach ? 'יאללה, בוא נזיז את הגוף! 💪🔥' : 'פעילויות גופניות מתאימות:';
      return { text: txt, recs, actions: [] };
    }
    if (lower.includes('חברתי') || lower.includes('חברים') || lower.includes('אנשים')) {
      const recs = visibleRecs.filter(s => s.category === 'social' || s.isGroupActivity).slice(0, 3);
      const txt = isWarm ? 'כיף שאתה רוצה לפגוש אנשים! 🤝' : isCoach ? 'מעולה! חיים חברתיים = חיים בריאים! 🌟' : 'פעילויות חברתיות:';
      return { text: txt, recs, actions: [] };
    }
    if (lower.includes('שלום') || lower.includes('היי') || lower.includes('מה נשמע')) {
      const txt = isWarm ? `היי יקיר/ה! 😊 שמחה לשמוע ממך!\nמה שלומך היום?` : isCoach ? `היי! 🌟 מוכן/ה ליום מדהים?` : `שלום! במה אוכל לעזור?`;
      return { text: txt, recs: [], actions: [] };
    }

    // Default — show top recommendations
    const txt = isWarm ? 'הנה מה שאני חושבת שיתאים לך היום 😊' : isCoach ? 'הנה המלצות שיעזרו לך! 🚀' : 'ההמלצות המתאימות לך:';
    return { text: txt, recs: visibleRecs.slice(0, 3), actions: [] };
  };

  const handleSend = (text?: string) => {
    const msg = text || input.trim();
    if (!msg) return;
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: msg }]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      const { text: t, recs, actions } = generateResponse(msg);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: t, recommendations: recs as any, actions }]);
      setIsTyping(false);
    }, 700 + Math.random() * 400);
  };

  return (
    <div className="page-container flex flex-col bg-gray-50">
      <Header title="לימור — העוזרת שלך" showBack />

      <main className="flex-1 flex flex-col pb-20">
        {/* Persona bar */}
        <div className="content-padding py-2.5 flex items-center justify-between border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2.5">
            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-base shadow-sm", config.gradient)}>
              {config.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{config.name}</h3>
              <p className="text-[10px] text-gray-400">{config.style}</p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-colors", showSettings ? "bg-blue-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-500")}
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>

        {showSettings && (
          <div className="content-padding py-3 bg-white border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">סגנון שיחה:</p>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(PERSONA_CONFIG) as [PersonaType, typeof config][]).map(([key, cfg]) => (
                <button key={key} onClick={() => { setPersona(key); setShowSettings(false); }}
                  className={cn("p-2.5 rounded-xl border-2 transition-all text-center", persona === key ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-gray-300")}>
                  <span className="text-xl block mb-0.5">{cfg.avatar}</span>
                  <span className="text-[10px] text-gray-600">{cfg.style}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto content-padding py-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={cn(
                "max-w-[85%] rounded-2xl p-3.5",
                message.role === 'user'
                  ? "bg-blue-600 text-white mr-auto rounded-br-md"
                  : "bg-white border border-gray-100 ml-auto rounded-bl-md shadow-sm"
              )}>
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1.5 border-b border-gray-50">
                    <span className="text-sm">{config.avatar}</span>
                    <span className="font-medium text-xs text-gray-700">{config.name}</span>
                  </div>
                )}
                <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
              </div>

              {message.actions && message.actions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 mr-auto max-w-[85%]">
                  {message.actions.map((action, idx) => (
                    <button key={idx} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors">
                      {action.label}
                    </button>
                  ))}
                </div>
              )}

              {message.recommendations && message.recommendations.length > 0 && (
                <div className="mt-2 space-y-2 mr-auto max-w-[90%]">
                  {message.recommendations.map((service: any) => (
                    <div key={service.id} className="bg-white rounded-xl p-3 shadow-sm cursor-pointer hover:shadow-md transition-all border border-gray-100"
                      onClick={() => navigate(`/service/${service.id}`)}>
                      <div className="flex gap-3">
                        <img src={service.imageUrl} alt={service.name} className="w-16 h-16 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{service.name}</h3>
                          <p className="text-xs text-gray-500 line-clamp-1">{service.shortDesc}</p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-400">
                            <span className="flex items-center gap-0.5"><Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />{service.rating}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{service.distanceMinutes} דק׳</span>
                            {service.fitScore > 0 && (
                              <span className="flex items-center gap-0.5 text-blue-600"><Sparkles className="w-2.5 h-2.5" />{service.fitScore}%</span>
                            )}
                          </div>
                        </div>
                        <div className="text-left shrink-0">
                          <p className="font-bold text-blue-700 text-sm">
                            {service.explanation?.subsidyBreakdown?.finalPrice === 0 ? 'חינם' : `₪${service.explanation?.subsidyBreakdown?.finalPrice || service.price}`}
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
            <div className="max-w-[85%] bg-white rounded-2xl rounded-bl-md p-3.5 shadow-sm border border-gray-100 ml-auto">
              <div className="flex items-center gap-2">
                <span className="text-sm">{config.avatar}</span>
                <span className="text-xs text-gray-400">מקליד/ה...</span>
                <div className="flex gap-1">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 2 && (
          <div className="content-padding pb-2">
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS[persona].map((q, idx) => (
                <button key={idx} onClick={() => handleSend(q)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="content-padding pb-3 pt-2 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <Volume2 className="w-4 h-4" />
            </button>
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="כתוב/י הודעה..." dir="rtl"
              className="flex-1 h-10 px-3 rounded-xl bg-gray-100 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-right" />
            <Button size="icon" onClick={() => handleSend()} disabled={!input.trim()} className="w-10 h-10 rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
