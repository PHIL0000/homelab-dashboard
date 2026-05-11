import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Modal, Spinner, useOverlayState } from "@heroui/react";
import Sidebar from "./components/nav/Sidebar";
import DashboardPage from "./components/pages/dashboard/Dashboard";
//import CalendarPage from "./components/pages/calendar/Calendar";
import HomeAssistantPage from "./components/pages/home-assistant/HomeAssistant";
//import AiChatPage from "./components/pages/ai/Chat/AiChat";
//import AiImageGenPage from "./components/pages/ai/ImageGen/AiImageGen";
//import PerformancePage from "./components/pages/performance/Performance";
import AccountPage from "./components/settings/account/Account";
import SettingsPage from "./components/settings/settings/Settings";
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

type ActiveModal = "settings" | "account" | null;

function App() {
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading, user } = useAuth();

  const isAuthRoute =
    location.pathname === "/login" || location.pathname === "/setup";

  useEffect(() => {
    if (!isLoading && !user && !isAuthRoute) {
      navigate("/login");
    }
  }, [isLoading, user, isAuthRoute, navigate]);

  const accountModalState = useOverlayState({
    isOpen: activeModal === "account",
    onOpenChange: (open) => !open && setActiveModal(null),
  });
  const settingsModalState = useOverlayState({
    isOpen: activeModal === "settings",
    onOpenChange: (open) => !open && setActiveModal(null),
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text">
        <Spinner size="lg" color="accent" />
      </div>
    );
  }

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={<SetupPage />} />
      </Routes>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" color="accent" />
          <span className="text-text-secondary">Redirecting…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-text">
      <Sidebar onOpenModal={(modal) => setActiveModal(modal)} />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-content">
          <div className="max-w-[2000px] mx-auto h-full">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
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
              <Route path="*" element={<PlaceholderPage />} />
            </Routes>
          </div>
        </main>

        <Modal state={accountModalState}>
          <Modal.Backdrop className="bg-black/60 backdrop-blur-sm">
            <Modal.Container placement="center">
              <Modal.Dialog className="!max-w-4xl !w-[calc(100vw-2rem)] bg-background rounded-3xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
                <Modal.CloseTrigger className="absolute top-6 right-6 z-10" />
                <Modal.Body className="p-2">
                  <AccountPage />
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        <Modal state={settingsModalState}>
          <Modal.Backdrop className="bg-black/60 backdrop-blur-sm">
            <Modal.Container placement="center">
              <Modal.Dialog className="!max-w-4xl !w-[calc(100vw-2rem)] bg-background rounded-3xl border border-[color-mix(in_srgb,var(--color-primary)_20%,transparent)] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
                <Modal.CloseTrigger className="absolute top-6 right-6 z-10" />
                <Modal.Body className="p-2">
                  <SettingsPage />
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
      </div>
    </div>
  );
}

export default App;
