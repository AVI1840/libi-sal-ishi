import { bookings as initialBookings, services as initialServices, vendors } from "@libi/shared-ui/data/mockData";
import { createContext, ReactNode, useContext, useState } from "react";

// Local types for vendor portal (adapted from shared types)
interface VendorService {
  id: string;
  title: string;
  description: string;
  category: string;
  unitCost: number;
  durationMinutes?: number;
  minNursingLevel?: number;
  maxNursingLevel?: number;
  isOptimalAging?: boolean;
  isActive: boolean;
  vendorId?: string;
  vendorName?: string;
}

interface VendorBooking {
  id: string;
  serviceId: string;
  serviceName: string;
  clientId: string;
  scheduledDate: string;
  unitsCost: number;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
}

interface CurrentVendor {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  logo?: string;
  rating: number;
  isVerified: boolean;
  serviceAreas: string[];
  licenseNumber?: string;
}

interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  platformFee: number;
  netAmount: number;
  status: "pending" | "processing" | "paid";
  paidAt?: Date;
  createdAt: Date;
}

interface AppContextType {
  vendor: CurrentVendor;
  services: VendorService[];
  bookings: VendorBooking[];
  payments: Payment[];
  addService: (service: Omit<VendorService, "id">) => void;
  updateService: (serviceId: string, updates: Partial<VendorService>) => void;
  deleteService: (serviceId: string) => void;
  updateBookingStatus: (bookingId: string, status: VendorBooking["status"]) => void;
  totalEarnings: number;
  pendingEarnings: number;
  completedBookingsCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Transform shared data to vendor portal format
const transformService = (s: any): VendorService => ({
  id: s.id,
  title: s.name || s.title,
  description: s.shortDesc || s.description || "",
  category: s.category,
  unitCost: Math.ceil(s.price / 120) || 2,
  durationMinutes: 60,
  minNursingLevel: 1,
  maxNursingLevel: 6,
  isOptimalAging: s.category === "social" || s.category === "culture",
  isActive: true,
  vendorId: s.vendorId,
  vendorName: s.vendorName,
});

const transformBooking = (b: any): VendorBooking => ({
  id: b.id,
  serviceId: b.serviceId,
  serviceName: b.serviceName,
  clientId: b.clientId,
  scheduledDate: b.date ? `${b.date}T${b.time || "10:00"}` : new Date().toISOString(),
  unitsCost: Math.ceil(b.price / 120) || 2,
  status: b.status,
});

// Generate mock payments from completed bookings
const generatePayments = (bookings: VendorBooking[]): Payment[] => {
  return bookings
    .filter((b) => b.status === "completed")
    .map((booking) => {
      const amount = booking.unitsCost * 120;
      const platformFee = amount * 0.07;
      return {
        id: `payment-${booking.id}`,
        bookingId: booking.id,
        amount,
        platformFee,
        netAmount: amount - platformFee,
        status: Math.random() > 0.3 ? "paid" : "pending" as const,
        paidAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
        createdAt: new Date(booking.scheduledDate),
      };
    });
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Get the first vendor as the current vendor
  const rawVendor = vendors[0];
  const currentVendor: CurrentVendor = {
    id: rawVendor.id,
    name: rawVendor.businessName,
    contactName: rawVendor.contactName,
    email: rawVendor.email,
    phone: rawVendor.phone,
    rating: rawVendor.rating,
    isVerified: rawVendor.isVerified,
    serviceAreas: rawVendor.serviceAreas,
  };

  // Transform and filter services for this vendor
  const [vendorServices, setVendorServices] = useState<VendorService[]>(
    initialServices.slice(0, 5).map(transformService)
  );

  // Transform bookings
  const [vendorBookings, setVendorBookings] = useState<VendorBooking[]>(
    initialBookings.map(transformBooking)
  );

  const [payments] = useState<Payment[]>(generatePayments(vendorBookings));

  const addService = (service: Omit<VendorService, "id">) => {
    const newService: VendorService = {
      ...service,
      id: `service-${Date.now()}`,
    };
    setVendorServices((prev) => [...prev, newService]);
  };

  const updateService = (serviceId: string, updates: Partial<VendorService>) => {
    setVendorServices((prev) =>
      prev.map((service) =>
        service.id === serviceId ? { ...service, ...updates } : service
      )
    );
  };

  const deleteService = (serviceId: string) => {
    setVendorServices((prev) => prev.filter((s) => s.id !== serviceId));
  };

  const updateBookingStatus = (bookingId: string, status: VendorBooking["status"]) => {
    setVendorBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId ? { ...booking, status } : booking
      )
    );
  };

  const completedBookings = vendorBookings.filter((b) => b.status === "completed");
  const totalEarnings = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.netAmount, 0);
  const pendingEarnings = payments
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.netAmount, 0);

  return (
    <AppContext.Provider
      value={{
        vendor: currentVendor,
        services: vendorServices,
        bookings: vendorBookings,
        payments,
        addService,
        updateService,
        deleteService,
        updateBookingStatus,
        totalEarnings,
        pendingEarnings,
        completedBookingsCount: completedBookings.length,
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
