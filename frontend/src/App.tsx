// App.tsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/nav/Sidebar";
import DashboardPage from "./components/pages/dashboard/Dashboard";
import CalendarPage from "./components/pages/calendar/Calendar";
import HomeAssistantPage from "./components/pages/home-assistant/HomeAssistant";
//import AiChatPage from "./components/pages/ai/Chat/AiChat";
//import AiImageGenPage from "./components/pages/ai/ImageGen/AiImageGen";
import PerformancePage from "./components/pages/performance/Performance";
import AccountPage from "./components/pages/account/Account";
import SettingsPage from "./components/pages/settings/Settings";
import PlaceholderPage from "./components/dev/Placeholder";

const App: React.FC = () => {
  const [activeModal, setActiveModal] = useState<"settings" | "account" | null>(null);

  return (
    <div className="flex h-screen bg-background text-text">
      <Sidebar onOpenModal={setActiveModal} />

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
              <Route path="/documentation/overview" element={<PlaceholderPage />} />
              <Route path="/documentation/hardware" element={<PlaceholderPage />} />
              <Route path="/documentation/services" element={<PlaceholderPage />} />
              <Route path="/performance" element={<PlaceholderPage />} />

              {/* Placeholder für alle Seiten zuerst */}
              <Route path="*" element={<PlaceholderPage />} />
            </Routes>
          </div>
        </main>
        
        {/* Modals */}
        {activeModal === "account" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] flex flex-col">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:text-primary transition-colors text-text-secondary z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
              <div className="p-2 flex-grow">
                <AccountPage />
              </div>
            </div>
          </div>
        )}

        {activeModal === "settings" && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-background rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] flex flex-col">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] hover:text-primary transition-colors text-text-secondary z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
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
