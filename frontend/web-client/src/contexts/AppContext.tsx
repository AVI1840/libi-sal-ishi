import { Client, Service } from '@libi/shared-ui';
import {
  type ScenarioDay,
  getScenarioState,
  type RecommendedService,
  type ScenarioAlert,
} from '@libi/shared-ui/data/scenario';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  date: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
}

interface AppContextType {
  currentDay: ScenarioDay;
  setCurrentDay: (day: ScenarioDay) => void;
  currentClient: Client;
  recommendations: RecommendedService[];
  bookings: Booking[];
  alerts: ScenarioAlert[];
  changelog: string[];
  bookService: (service: Service) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentDay, setCurrentDay] = useState<ScenarioDay>(1);

  const scenario = getScenarioState(currentDay);

  const bookService = useCallback((_service: Service) => {
    // In scenario mode, bookings are driven by the timeline
    // Advance to day 3 to show the booking
    setCurrentDay(3);
  }, []);

  const bookings: Booking[] = scenario.bookings.map(b => ({
    id: b.id,
    serviceId: b.serviceId,
    serviceName: b.serviceName,
    date: b.date,
    status: b.status === 'completed' ? 'confirmed' : b.status === 'in_progress' ? 'confirmed' : b.status as 'confirmed' | 'pending' | 'cancelled',
    price: b.price,
  }));

  return (
    <AppContext.Provider value={{
      currentDay,
      setCurrentDay,
      currentClient: scenario.sarah,
      recommendations: scenario.recommendations,
      bookings,
      alerts: scenario.alerts,
      changelog: scenario.changelog,
      bookService,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
