import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MessageCircle } from "lucide-react";
import { DemoNav } from "./components/DemoNav";
import { AppProvider } from "./contexts/AppContext";
import { FeedbackModal } from "./components/FeedbackModal";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import ClientDetail from "./pages/ClientDetail";
import Actions from "./pages/Actions";
import Alerts from "./pages/Alerts";
import Bookings from "./pages/Bookings";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          <DemoNav current="manager" />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/actions" element={<Actions />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-white text-sm font-medium transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: "#1B3A5C" }}
            aria-label="משוב פיילוט"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">משוב פיילוט</span>
          </button>
          <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
