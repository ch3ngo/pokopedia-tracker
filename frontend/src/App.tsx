import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { HomePage } from "./pages/HomePage";
import { Pokedex } from "./pages/Pokedex";
import { Habitatdex } from "./pages/Habitatdex";
import { ZoneDashboard } from "./pages/ZoneDashboard";
import { TodoPage } from "./pages/TodoPage";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/habitats" element={<Habitatdex />} />
            <Route path="/zones" element={<ZoneDashboard />} />
            <Route path="/todo" element={<TodoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
