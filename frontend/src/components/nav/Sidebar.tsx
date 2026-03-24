// components/nav/Sidebar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Settings } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openAI, setOpenAI] = useState(false);
  const [openStorage, setOpenStorage] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Calendar", path: "/calendar" },
    { label: "Performance", path: "/performance" },
  ];

  const aiItems = [
    { label: "Chat", path: "/ai/chat" },
    { label: "Image Gen", path: "/ai/image-gen" },
  ];

  const storageItems = [
    { label: "NAS", path: "/storage/nas" },
    { label: "Nextcloud", path: "/storage/nextcloud" },
    { label: "GitLab", path: "/storage/gitlab" },
  ];

  return (
    <div className="w-64 h-screen rounded-none border-r border-border flex flex-col bg-sidebar">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Homelab</h1>
        <p className="text-xs mt-1 text-text-secondary">Dashboard</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded-lg mb-1 transition-colors ${
              isActive(item.path)
                ? "bg-primary text-white"
                : "text-text hover:opacity-80"
            }`}
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={() => setOpenStorage(!openStorage)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-text"
          >
            <span>Storage</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${openStorage ? "rotate-180" : ""}`}
            />
          </button>

          {openStorage && (
            <div className="ml-2 mt-2 space-y-1">
              {storageItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:opacity-80"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={() => setOpenAI(!openAI)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-text"
          >
            <span>AI</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${openAI ? "rotate-180" : ""}`}
            />
          </button>

          {openAI && (
            <div className="ml-2 mt-2 space-y-1">
              {aiItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:opacity-80"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 flex items-center gap-2 border-t border-border">
        <Link
          to="/account"
          className="flex-1 flex items-center gap-3 px-3 py-2 rounded-lg h-14 transition-colors hover:opacity-80 bg-content"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text truncate">User</p>
            <p className="text-xs text-text-secondary truncate">Profile</p>
          </div>
        </Link>

        <Link
          to="/settings"
          className="px-3 py-2 rounded-lg flex-shrink-0 flex items-center justify-center h-14 w-14 transition-colors hover:opacity-80 bg-content"
        >
          <Settings size={18} className="text-text" />
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
