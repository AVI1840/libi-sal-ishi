import { TooltipProvider } from "@libi/shared-ui";
import { ScenarioTimeline } from "@libi/shared-ui/components/ScenarioTimeline";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { DemoNav } from "./components/DemoNav";
import { AppProvider, useApp } from "./contexts/AppContext";
import Chat from "./pages/Chat";
import Community from "./pages/Community";
import Contact from "./pages/Contact";
import Index from "./pages/Index";
import Marketplace from "./pages/Marketplace";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ServiceDetails from "./pages/ServiceDetails";

const queryClient = new QueryClient();

function TimelineBar() {
  const { currentDay, setCurrentDay } = useApp();
  return <ScenarioTimeline currentDay={currentDay} onDayChange={setCurrentDay} />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <DemoNav current="client" />
        <TimelineBar />
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/service/:id" element={<ServiceDetails />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community" element={<Community />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
