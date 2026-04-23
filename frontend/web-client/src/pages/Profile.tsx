import { MEANING_TAG_LABELS, PERSONA_LABELS, RISK_FLAG_LABELS } from '@libi/shared-ui';
import { Calendar, Heart, Shield, Sparkles, Target, User, Wallet } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { useApp } from '../contexts/AppContext';

export default function Profile() {
  const { currentClient, bookings } = useApp();
  const lev = currentClient.levProfile;

  const balance = currentClient.walletBalance;
  const used = currentClient.walletUsed;
  const total = currentClient.walletTotal;
  const usagePercent = total > 0 ? Math.round((used / total) * 100) : 0;

  return (
    <div className="page-container bg-gray-50">
      <Header title="הפרופיל שלי" showBack />

      <main className="content-padding pt-5 pb-28 space-y-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{currentClient.name}</h1>
              <p className="text-sm text-gray-500">{currentClient.age} · {currentClient.city} · רמת סיעוד {currentClient.nursingLevel}</p>
              {lev?.persona && (
                <div className="flex items-center gap-1.5 mt-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">
                    {PERSONA_LABELS[lev.persona] || lev.persona}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-900">הארנק שלי</h2>
          </div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">יתרה זמינה</p>
              <p className="text-2xl font-bold text-gray-900">₪{(balance * 120).toLocaleString()}</p>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-500">ניצלת</p>
              <p className="text-lg font-semibold text-blue-600">{usagePercent}%</p>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1.5 text-center">
            {used} מתוך {total} יחידות נוצלו
          </p>
        </div>

        {/* Meaning Tags */}
        {lev && lev.meaningTags.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-red-400" />
              <h2 className="text-base font-semibold text-gray-900">מה חשוב לי</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {lev.meaningTags.map((tag) => (
                <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  {MEANING_TAG_LABELS[tag] || tag}
                </span>
              ))}
            </div>
            {lev.coreDream && (
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="text-xs text-amber-600 font-medium mb-0.5">💫 החלום שלי</p>
                <p className="text-sm text-amber-900">{lev.coreDream}</p>
              </div>
            )}
          </div>
        )}

        {/* Risk Flags */}
        {lev && lev.riskFlags.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-semibold text-gray-900">מה המערכת מזהה</h2>
            </div>
            <div className="space-y-2">
              {lev.riskFlags.map((flag) => (
                <div key={flag} className="flex items-center gap-2 p-2.5 bg-amber-50 rounded-lg border border-amber-100">
                  <span className="text-amber-500">⚠️</span>
                  <span className="text-sm text-amber-800">{RISK_FLAG_LABELS[flag] || flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Goals */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-green-500" />
            <h2 className="text-base font-semibold text-gray-900">המטרות שלי</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentClient.goals.map((goal, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                {goal}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-500" />
              <h2 className="text-base font-semibold text-gray-900">הזמנות אחרונות</h2>
            </div>
            <div className="space-y-2">
              {bookings.slice(-5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{booking.serviceName}</p>
                    <p className="text-xs text-gray-500">{booking.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {booking.status === 'confirmed' ? '✅ מאושר' : booking.status === 'pending' ? '⏳ ממתין' : booking.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Emergency Contact */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-2">איש קשר לחירום</h2>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
            <div>
              <p className="text-sm font-medium text-gray-900">{currentClient.emergencyContact.name}</p>
              <p className="text-xs text-gray-500">{currentClient.emergencyContact.relation}</p>
            </div>
            <a
              href={`tel:${currentClient.emergencyContact.phone}`}
              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium"
            >
              📞 {currentClient.emergencyContact.phone}
            </a>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
