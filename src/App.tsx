import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "./components/AppShell";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Bundle from "./pages/Blunde";
import Impacto from "./pages/Impacto";
import AlertasIA from "./pages/AlertasIA";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/bundle" element={<Bundle />} />
        <Route path="/impacto" element={<Impacto />} />
        <Route path="/alertas" element={<AlertasIA />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}