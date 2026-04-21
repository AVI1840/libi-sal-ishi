import { Calendar, MapPin, Users } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';

const communityEvents = [
  {
    id: 1,
    title: 'מפגש בוקר - קפה וחברים',
    date: 'מחר, 09:00',
    location: 'מתנ"ס השכונה',
    participants: 12,
  },
  {
    id: 2,
    title: 'הליכה בפארק',
    date: 'יום רביעי, 07:00',
    location: 'פארק הירקון',
    participants: 8,
  },
  {
    id: 3,
    title: 'סדנת בישול בריא',
    date: 'יום חמישי, 10:00',
    location: 'מרכז הקהילה',
    participants: 15,
  },
];

export default function Community() {
  return (
    <div className="page-container">
      <Header title="הקהילה שלנו" showBack />

      <main className="content-padding pt-6 pb-28 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-in">
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-primary">234</p>
            <p className="text-sm text-muted-foreground">חברי קהילה</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-secondary">18</p>
            <p className="text-sm text-muted-foreground">אירועים החודש</p>
          </div>
          <div className="bg-card rounded-2xl p-4 shadow-soft text-center">
            <p className="text-2xl font-bold text-success">156</p>
            <p className="text-sm text-muted-foreground">שירותים פעילים</p>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="animate-slide-up">
          <h2 className="section-title">אירועים קרובים</h2>
          <div className="space-y-3">
            {communityEvents.map((event) => (
              <div key={event.id} className="bg-card rounded-2xl p-4 shadow-soft">
                <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {event.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.participants} משתתפים
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
