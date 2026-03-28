import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { Pokedex } from "./pages/Pokedex";
import { Habitatdex } from "./pages/Habitatdex";
import { ZoneDashboard } from "./pages/ZoneDashboard";
import { TodoPage } from "./pages/TodoPage";

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="h-screen flex overflow-hidden">
        <Navbar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/pokedex" element={<Pokedex />} />
              <Route path="/habitats" element={<Habitatdex />} />
              <Route path="/zones" element={<ZoneDashboard />} />
              <Route path="/todo" element={<TodoPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </BrowserRouter>
  );
}
