// App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/nav/Sidebar";
import DashboardPage from "./components/pages/dashboard/Dashboard";
import CalendarPage from "./components/pages/calendar/Calendar";
import StoragePage from "./components/pages/storage/Storage";
//import AiChatPage from "./components/pages/ai/Chat/AiChat";
//import AiImageGenPage from "./components/pages/ai/ImageGen/AiImageGen";
import PerformancePage from "./components/pages/performance/Performance";
import AccountPage from "./components/pages/account/Account";
import SettingsPage from "./components/pages/settings/Settings";
import PlaceholderPage from "./components/dev/Placeholder";

const App: React.FC = () => {
  return (
    <div className="flex h-screen bg-background text-text">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-content">
          <div className="max-w-[2000px] mx-auto px-6 py-6 h-full">
            <Routes>
              <Route path="/" element={<PlaceholderPage />} />
              <Route path="/dashboard" element={<PlaceholderPage />} />
              <Route path="/calendar" element={<PlaceholderPage />} />
              <Route path="/storage" element={<PlaceholderPage />} />
              <Route path="/ai" element={<PlaceholderPage />}>
                <Route path="chat" element={<PlaceholderPage />} />
                <Route path="image-gen" element={<PlaceholderPage />} />
              </Route>
              <Route path="/ai/chat" element={<PlaceholderPage />} />
              <Route path="/ai/image-gen" element={<PlaceholderPage />} />
              <Route path="/performance" element={<PlaceholderPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/settings" element={<SettingsPage />} />

              {/* Placeholder für alle Seiten zuerst */}
              <Route path="*" element={<PlaceholderPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
