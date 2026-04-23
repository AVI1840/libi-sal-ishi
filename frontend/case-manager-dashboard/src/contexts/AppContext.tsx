import { Booking, Client, clients } from "@libi/shared-ui/data/mockData";
import {
  type ScenarioDay,
  getScenarioState,
  SARAH_BASE,
  type ScenarioAlert,
} from "@libi/shared-ui/data/scenario";
import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface Alert {
  id: string;
  clientId: string;
  type: "health" | "loneliness" | "cognitive" | "emergency" | "booking_confirmed" | "service_completed" | "kpi_update" | "balance_update";
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  createdAt: Date;
  isRead: boolean;
  isResolved: boolean;
}

interface AppContextType {
  currentDay: ScenarioDay;
  setCurrentDay: (day: ScenarioDay) => void;
  clients: Client[];
  bookings: Booking[];
  alerts: Alert[];
  selectedClient: Client | null;
  setSelectedClient: (client: Client | null) => void;
  markAlertAsRead: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  createBooking: (booking: Omit<Booking, "id">) => void;
  updateBookingStatus: (bookingId: string, status: Booking["status"]) => void;
  unreadAlertsCount: number;
  pendingBookingsCount: number;
  changelog: string[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function scenarioAlertsToAlerts(scenarioAlerts: ScenarioAlert[]): Alert[] {
  return scenarioAlerts.map(a => ({
    id: a.id,
    clientId: 'sarah-cohen',
    type: a.type as Alert['type'],
    severity: a.severity === 'success' ? 'info' : a.severity as Alert['severity'],
    title: a.title,
    description: a.description,
    createdAt: new Date(a.timestamp),
    isRead: !a.isNew,
    isResolved: false,
  }));
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentDay, setCurrentDay] = useState<ScenarioDay>(1);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set());
  const [resolvedAlerts, setResolvedAlerts] = useState<Set<string>>(new Set());

  const scenario = getScenarioState(currentDay);

  // Merge Sarah into the client list (replace first client)
  const allClients = useMemo(() => {
    const sarahInList = [scenario.sarah, ...clients.filter(c => c.id !== 'sarah-cohen').slice(0, 74)];
    return sarahInList;
  }, [scenario.sarah]);

  // Scenario bookings as Booking[]
  const allBookings: Booking[] = scenario.bookings.map(b => ({
    ...b,
    scheduledDate: b.scheduledDate || new Date().toISOString(),
  }));

  // Alerts from scenario + some static ones
  const alerts: Alert[] = useMemo(() => {
    const fromScenario = scenarioAlertsToAlerts(scenario.alerts);
    return fromScenario.map(a => ({
      ...a,
      isRead: readAlerts.has(a.id) || a.isRead,
      isResolved: resolvedAlerts.has(a.id),
    }));
  }, [scenario.alerts, readAlerts, resolvedAlerts]);

  const markAlertAsRead = (alertId: string) => {
    setReadAlerts(prev => new Set(prev).add(alertId));
  };

  const resolveAlert = (alertId: string) => {
    setResolvedAlerts(prev => new Set(prev).add(alertId));
    setReadAlerts(prev => new Set(prev).add(alertId));
  };

  const createBooking = (_booking: Omit<Booking, "id">) => {
    // In scenario mode, bookings are driven by timeline
  };

  const updateBookingStatus = (_bookingId: string, _status: Booking["status"]) => {
    // In scenario mode, statuses are driven by timeline
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead && !a.isResolved).length;
  const pendingBookingsCount = allBookings.filter(b => b.status === "pending").length;

  return (
    <AppContext.Provider
      value={{
        currentDay,
        setCurrentDay,
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
        changelog: scenario.changelog,
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
