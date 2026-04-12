// App.tsx
import React, { useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Button } from "@heroui/react";
import Sidebar from "./components/nav/Sidebar";
//import DashboardPage from "./components/pages/dashboard/Dashboard";
//import CalendarPage from "./components/pages/calendar/Calendar";
import HomeAssistantPage from "./components/pages/home-assistant/HomeAssistant";
//import AiChatPage from "./components/pages/ai/Chat/AiChat";
//import AiImageGenPage from "./components/pages/ai/ImageGen/AiImageGen";
//import PerformancePage from "./components/pages/performance/Performance";
import AccountPage from "./components/pages/account/Account";
import SettingsPage from "./components/pages/settings/Settings";
import PlaceholderPage from "./components/dev/Placeholder";
import LoginPage from "./components/auth/Login";
import SetupPage from "./components/auth/Setup";
import DocsOverview from "./components/pages/documentation/Overview";
import Hardware from "./components/pages/documentation/Hardware";
import Services from "./components/pages/documentation/Services";
import StorageItems from "./components/pages/documentation/StorageItems";
import MarkdownDocs from "./components/pages/documentation/MarkdownDocs";
import DocumentationMap from "./components/pages/documentation/Map";

import { useAuth } from "./context/AuthContext";

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<"settings" | "account" | null>(null);
  const location = useLocation();
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background text-text">Loading...</div>;
  }

  // Check if we are on an auth screen
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/setup";

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
      </Routes>
    );
  }

  // If not authenticated and not explicitly on an auth route, don't render dashboard
  if (!user && !isAuthRoute) {
    return null; // The AuthContext useEffect will eventually navigate to login/setup
  }

  return (
    <div className="flex h-screen bg-background text-text">
      <Sidebar onOpenModal={(modal) => setActiveModal(modal)} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-content">
          <div className="max-w-[2000px] mx-auto h-full">
            <Routes>
              <Route path="/" element={<PlaceholderPage />} />
              <Route path="/dashboard" element={<PlaceholderPage />} />
              <Route path="/calendar" element={<PlaceholderPage />} />
              <Route path="/home-assistant" element={<HomeAssistantPage />} />
              <Route path="/storage/nas" element={<PlaceholderPage />} />
              <Route path="/storage/nextcloud" element={<PlaceholderPage />} />
              <Route path="/storage/gitlab" element={<PlaceholderPage />} />
              <Route path="/ai/chat" element={<PlaceholderPage />} />
              <Route path="/ai/image-gen" element={<PlaceholderPage />} />
              <Route path="/documentation/overview" element={<DocsOverview />} />
              <Route path="/documentation/hardware" element={<Hardware />} />
              <Route path="/documentation/services" element={<Services />} />
              <Route path="/documentation/storage" element={<StorageItems />} />
              <Route path="/documentation/docs" element={<MarkdownDocs />} />
              <Route path="/documentation/map" element={<DocumentationMap />} />
              <Route path="/performance" element={<PlaceholderPage />} />
              
              {/* Placeholder für alle Seiten zuerst */}
              <Route path="*" element={<PlaceholderPage />} />
            </Routes>
          </div>
        </main>

        {activeModal === "account" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] flex flex-col">
              <Button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:text-primary transition-colors text-text-secondary z-10"
                isIconOnly
                variant="ghost"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
              <div className="p-2 flex-grow">
                <AccountPage />
              </div>
            </div>
          </div>
        )}

        {activeModal === "settings" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] flex flex-col">
              <Button
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:text-primary transition-colors text-text-secondary z-10"
                isIconOnly
                variant="ghost"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </Button>
              <div className="p-2 flex-grow">
                <SettingsPage />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default App;