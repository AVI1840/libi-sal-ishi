import { Booking, Client, clients, bookings as initialBookings } from "@libi/shared-ui/data/mockData";
import { createContext, ReactNode, useContext, useState } from "react";

interface Alert {
  id: string;
  clientId: string;
  type: "health" | "loneliness" | "cognitive" | "emergency";
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  isResolved: boolean;
}

interface AppContextType {
  clients: Client[];
  bookings: Booking[];
  alerts: Alert[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  markAlertAsRead: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  createBooking: (booking: Omit<Booking, "id" | "createdAt">) => void;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  unreadAlertsCount: number;
  pendingBookingsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Generate mock alerts
const generateAlerts = (): Alert[] => [
  {
    id: "alert-1",
    clientId: clients[0]?.id || "1",
    type: "health",
    severity: "critical",
    title: "חריגה בלחץ דם",
    description: "לחץ הדם של רחל כהן עלה מעל 180/110",
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
    isResolved: false,
  },
  {
    id: "alert-2",
    clientId: clients[2]?.id || "3",
    type: "loneliness",
    severity: "warning",
    title: "חשד לבדידות",
    description: "שלמה לוי לא יצר קשר 5 ימים",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    isRead: false,
    isResolved: false,
  },
  {
    id: "alert-3",
    clientId: clients[5]?.id || "6",
    type: "cognitive",
    severity: "info",
    title: "שינוי בדפוס שיחה",
    description: "זוהה שינוי קל בדפוס השיחה של משה אברהם",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    isRead: true,
    isResolved: false,
  },
  {
    id: "alert-4",
    clientId: clients[1]?.id || "2",
    type: "health",
    severity: "warning",
    title: "דופק לא סדיר",
    description: "זוהה דופק לא סדיר אצל יעקב לוי",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    isRead: false,
    isResolved: false,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [allClients] = useState<Client[]>(clients);
  const [allBookings, setAllBookings] = useState<Booking[]>(initialBookings);
  const [alerts, setAlerts] = useState<Alert[]>(generateAlerts());
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const markAlertAsRead = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    );
  };

  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, isResolved: true, isRead: true } : alert
      )
    );
  };

  const createBooking = (booking: Omit<Booking, "id">) => {
    const newBooking: Booking = {
      ...booking,
      id: `booking-${Date.now()}`,
    };
    setAllBookings((prev) => [...prev, newBooking]);
  };

  const updateBookingStatus = (bookingId: string, status: Booking["status"]) => {
    setAllBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const unreadAlertsCount = alerts.filter((a) => !a.isRead && !a.isResolved).length;
  const pendingBookingsCount = allBookings.filter((b) => b.status === "pending").length;

  return (
    <AppContext.Provider
      value={{
        clients: allClients,
        bookings: allBookings,
        alerts,
        selectedClient,
        setSelectedClient,
        markAlertAsRead,
        resolveAlert,
        createBooking,
        updateBookingStatus,
        unreadAlertsCount,
        pendingBookingsCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
