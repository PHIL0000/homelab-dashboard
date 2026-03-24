// components/nav/Sidebar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, Button } from "@heroui/react";
import { ChevronDown } from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const [openAI, setOpenAI] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Calendar", path: "/calendar" },
    { label: "Storage", path: "/storage" },
    { label: "Performance", path: "/performance" },
    { label: "Account", path: "/account" },
    { label: "Settings", path: "/settings" },
  ];

  const aiItems = [
    { label: "Chat", path: "/ai/chat" },
    { label: "Image Gen", path: "/ai/image-gen" },
  ];

  return (
    <Card className="w-64 h-screen rounded-none bg-slate-900 border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-primary">Homelab</h1>
        <p className="text-xs text-slate-400">Dashboard</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-2 rounded-lg mb-1 transition-colors ${
              isActive(item.path)
                ? "bg-primary text-white"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.label}
          </Link>
        ))}

        <div className="mt-6 pt-4 border-t border-slate-700">
          <button
            onClick={() => setOpenAI(!openAI)}
            className="w-full flex items-center justify-between px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
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
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <Button

        >
          Profile
        </Button>
      </div>
    </Card>
  );
};

export default Sidebar;
