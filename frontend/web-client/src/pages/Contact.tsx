import { Button } from '@libi/shared-ui';
import { Mail, MessageCircle, Phone, User } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { Header } from '../components/Header';

export default function Contact() {
  const coordinator = {
    name: 'רחל גבאי',
    role: 'מתאמת שירות',
    phone: '050-1234567',
    email: 'rachel@lev.co.il',
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent('שלום, אני צריך/ה עזרה');
    window.open(`https://wa.me/972${coordinator.phone.replace(/-/g, '').slice(1)}?text=${message}`, '_blank');
  };

  const openPhone = () => {
    window.open(`tel:${coordinator.phone}`, '_self');
  };

  return (
    <div className="page-container">
      <Header title="צור קשר" showBack />

      <main className="content-padding pt-6 pb-28 space-y-6">
        {/* Coordinator Card */}
        <div className="bg-card rounded-2xl p-6 shadow-soft text-center animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary-light mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-1">{coordinator.name}</h2>
          <p className="text-muted-foreground mb-6">{coordinator.role}</p>

          <div className="flex gap-3">
            <Button className="flex-1" onClick={openWhatsApp}>
              <MessageCircle className="w-5 h-5 ml-2" />
              WhatsApp
            </Button>
            <Button variant="outline" className="flex-1" onClick={openPhone}>
              <Phone className="w-5 h-5 ml-2" />
              התקשר
            </Button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up">
          <h3 className="text-xl font-bold mb-4">פרטי התקשרות</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">טלפון</p>
                <p className="font-medium">{coordinator.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">אימייל</p>
                <p className="font-medium">{coordinator.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-card rounded-2xl p-5 shadow-soft animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-xl font-bold mb-4">שעות פעילות</h3>
          <div className="space-y-2 text-muted-foreground">
            <p>ראשון - חמישי: 08:00 - 17:00</p>
            <p>שישי: 08:00 - 13:00</p>
            <p className="text-sm mt-2">* בשבתות וחגים - סגור</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
