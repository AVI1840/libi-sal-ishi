/**
 * Post-Service Feedback Modal
 *
 * Shown after a service is completed. Collects:
 * - Rating (1-5 stars)
 * - Free text comment
 * - Would recommend (yes/no)
 *
 * This feeds into the recommendation engine's learning loop.
 * Stores feedback locally when offline and syncs when backend is available.
 */

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { submitFeedback } from '../lib/api';

interface ServiceFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  bookingId: string;
  serviceName: string;
  userId: string;
  onSubmit?: (data: { rating: number; comment: string; would_recommend: boolean }) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: 'לא טוב',
  2: 'לא כל כך',
  3: 'בסדר',
  4: 'טוב מאוד',
  5: 'מצוין!',
};

const STORAGE_KEY = 'libi-pending-feedback';

export function ServiceFeedbackModal({
  open,
  onClose,
  bookingId,
  serviceName,
  userId,
  onSubmit,
}: ServiceFeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastStatus, setLastStatus] = useState<'' | 'ok' | 'offline'>('');

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setRating(0);
      setHoverRating(0);
      setComment('');
      setWouldRecommend(null);
      setSubmitted(false);
      setSending(false);
      setLastStatus('');
    }
  }, [open]);

  // Try to sync pending feedback when modal opens
  useEffect(() => {
    if (!open) return;
    const pending = localStorage.getItem(STORAGE_KEY);
    if (!pending) return;
    const items = JSON.parse(pending) as Array<Record<string, unknown>>;
    if (items.length === 0) return;

    Promise.all(
      items.map((item) =>
        submitFeedback(item as Parameters<typeof submitFeedback>[0]).then((res) => !!res)
      )
    ).then((results) => {
      const remaining = items.filter((_, i) => !results[i]);
      if (remaining.length < items.length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
      }
    });
  }, [open]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setSending(true);
    setLastStatus('');

    const data = {
      booking_id: bookingId,
      user_id: userId,
      rating,
      comment: comment.trim() || undefined,
      would_recommend: wouldRecommend ?? true,
    };

    const result = await submitFeedback(data);

    if (!result) {
      // Offline — store locally
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      stored.push({ ...data, timestamp: new Date().toISOString() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      setLastStatus('offline');
    } else {
      setLastStatus('ok');
    }

    onSubmit?.({ rating, comment, would_recommend: wouldRecommend ?? true });
    setSending(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm text-center" dir="rtl">
          <div className="py-8 space-y-3">
            <div className="text-4xl">🙏</div>
            <p className="text-lg font-medium">תודה על המשוב!</p>
            <p className="text-sm text-muted-foreground">המשוב שלך עוזר לנו לשפר את השירותים</p>
            {lastStatus === 'offline' && (
              <p className="text-xs text-orange-500">📱 נשמר מקומית — יישלח כשיהיה חיבור</p>
            )}
            <Button onClick={onClose} className="mt-4 text-white" style={{ backgroundColor: '#1B3A5C' }}>
              סגור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-lg">⭐ איך היה?</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <p className="text-sm text-muted-foreground text-right">
            ספר/י לנו על החוויה ב<span className="font-medium text-foreground">{serviceName}</span>
          </p>

          {/* Star Rating */}
          <div>
            <p className="text-sm font-medium mb-3 text-right">דירוג</p>
            <div className="flex gap-2 justify-center" dir="ltr">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3A5C] rounded"
                  aria-label={`${star} כוכבים — ${RATING_LABELS[star]}`}
                >
                  {star <= (hoverRating || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground mt-1 text-center">{RATING_LABELS[rating]}</p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="feedback-comment" className="text-sm font-medium mb-2 text-right block">
              רוצה לספר עוד? (לא חובה)
            </label>
            <textarea
              id="feedback-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="מה אהבת? מה אפשר לשפר?"
              maxLength={500}
              className="w-full min-h-[60px] rounded-lg border border-gray-300 p-3 text-sm text-right resize-none focus:outline-none focus:ring-2 focus:ring-[#1B3A5C]/30"
              dir="rtl"
            />
            {comment.length > 400 && (
              <p className="text-xs text-muted-foreground text-left mt-1">{comment.length}/500</p>
            )}
          </div>

          {/* Would Recommend */}
          <fieldset>
            <legend className="text-sm font-medium mb-2 text-right">היית ממליץ/ה לחבר/ה?</legend>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setWouldRecommend(true)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  wouldRecommend === true
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-green-400'
                }`}
                aria-pressed={wouldRecommend === true}
              >
                👍 כן
              </button>
              <button
                type="button"
                onClick={() => setWouldRecommend(false)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  wouldRecommend === false
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-red-400'
                }`}
                aria-pressed={wouldRecommend === false}
              >
                👎 לא
              </button>
            </div>
          </fieldset>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || sending}
            className="w-full text-white"
            style={{ backgroundColor: '#1B3A5C' }}
          >
            {sending ? 'שולח...' : 'שלח משוב'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
