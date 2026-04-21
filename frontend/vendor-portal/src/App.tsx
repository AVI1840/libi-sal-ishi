import { BrowserRouter, Route, Routes } from "react-router-dom";
import { DemoNav } from "./components/DemoNav";
import Layout from "./components/Layout";
import { AppProvider } from "./contexts/AppContext";
import Bookings from "./pages/Bookings";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Payments from "./pages/Payments";
import ServiceEdit from "./pages/ServiceEdit";
import Services from "./pages/Services";
import Settings from "./pages/Settings";

function App() {
  return (
    <AppProvider>
      <DemoNav current="vendor" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="services" element={<Services />} />
            <Route path="services/new" element={<ServiceEdit />} />
            <Route path="services/:serviceId/edit" element={<ServiceEdit />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
