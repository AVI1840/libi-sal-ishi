import { Calendar, Heart, Target, User } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';
import { useApp } from '../contexts/AppContext';

export default function Profile() {
  const { currentClient, bookings } = useApp();

  return (
    <div className="page-container">
      <Header title="הפרופיל שלי" showBack />

      <main className="content-padding pt-6 pb-28 space-y-6">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl p-6 shadow-soft text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-primary-light mx-auto mb-4 flex items-center justify-center">
            <User className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{currentClient.name}</h1>
          <p className="text-muted-foreground">גיל {currentClient.age} • {currentClient.city}</p>
        </div>

        {/* Goals */}
        <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="text-xl font-bold">המטרות שלי</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentClient.goals.map((goal, idx) => (
              <span key={idx} className="px-4 py-2 bg-secondary/10 text-secondary rounded-full text-sm font-medium">
                {goal}
              </span>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold">ההעדפות שלי</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentClient.preferences.map((pref, idx) => (
              <span key={idx} className="px-4 py-2 bg-primary-light text-primary rounded-full text-sm font-medium">
                {pref}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        {bookings.length > 0 && (
          <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center">
                <Calendar className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-xl font-bold">הזמנות אחרונות</h2>
            </div>
            <div className="space-y-3">
              {bookings.slice(-3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                  <div>
                    <p className="font-medium">{booking.serviceName}</p>
                    <p className="text-sm text-muted-foreground">{booking.date}</p>
                  </div>
                  <span className="text-success font-medium">אושר ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
