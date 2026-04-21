import { Client, Service, clients, defaultClient } from '@libi/shared-ui';
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
  currentClient: Client;
  setCurrentClient: (client: Client) => void;
  clients: Client[];
  updateClientProfile: (profile: Client['functionalProfile']) => void;
  bookService: (service: Service) => void;
  bookings: Booking[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentClient, setCurrentClientState] = useState<Client>(defaultClient);
  const [allClients, setAllClients] = useState<Client[]>(clients);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const setCurrentClient = useCallback((client: Client) => {
    setCurrentClientState(client);
  }, []);

  const updateClientProfile = useCallback((profile: Client['functionalProfile']) => {
    setCurrentClientState(prev => ({
      ...prev,
      functionalProfile: profile,
    }));
    setAllClients(prev =>
      prev.map(c => c.id === currentClient.id ? { ...c, functionalProfile: profile } : c)
    );
  }, [currentClient.id]);

  const bookService = useCallback((service: Service) => {
    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      serviceId: service.id,
      serviceName: service.name,
      date: new Date().toLocaleDateString('he-IL'),
      status: 'confirmed',
      price: service.price,
    };

    setBookings(prev => [...prev, newBooking]);

    // Update wallet balance
    setCurrentClientState(prev => ({
      ...prev,
      walletBalance: prev.walletBalance - service.price,
      walletUsed: prev.walletUsed + service.price,
      status: (prev.walletBalance - service.price) < 500 ? 'red' :
              (prev.walletBalance - service.price) < 1500 ? 'yellow' : 'green',
    }));

    setAllClients(prev =>
      prev.map(c => {
        if (c.id === currentClient.id) {
          return {
            ...c,
            walletBalance: c.walletBalance - service.price,
            walletUsed: c.walletUsed + service.price,
            status: (c.walletBalance - service.price) < 500 ? 'red' :
                    (c.walletBalance - service.price) < 1500 ? 'yellow' : 'green',
          };
        }
        return c;
      })
    );
  }, [currentClient.id]);

  return (
    <AppContext.Provider value={{
      currentClient,
      setCurrentClient,
      clients: allClients,
      updateClientProfile,
      bookService,
      bookings,
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
