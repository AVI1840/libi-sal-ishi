import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DemoNav } from "./components/DemoNav";
import Layout from "./components/Layout";
import { AppProvider } from "./contexts/AppContext";
import Actions from "./pages/Actions";
import Alerts from "./pages/Alerts";
import Bookings from "./pages/Bookings";
import ClientDetail from "./pages/ClientDetail";
import Clients from "./pages/Clients";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { ScenarioTimeline } from "@libi/shared-ui/components/ScenarioTimeline";
import { useApp } from "./contexts/AppContext";

function TimelineBar() {
  const { currentDay, setCurrentDay } = useApp();
  return <ScenarioTimeline currentDay={currentDay} onDayChange={setCurrentDay} />;
}

function App() {
  return (
    <AppProvider>
      <DemoNav current="manager" />
      <TimelineBar />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="actions" element={<Actions />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:clientId" element={<ClientDetail />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
