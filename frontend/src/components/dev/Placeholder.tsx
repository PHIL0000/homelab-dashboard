import React from "react";
import { Card } from "@heroui/react";

const PlaceholderPage: React.FC = () => {
  const path = window.location.pathname;
  const pageName = path.split("/").pop()?.replace("-", " ") || "Page";

  return (
    <div className="h-full w-full p-6">
      <Card className="h-full bg-slate-800 shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-400 capitalize mb-2">{pageName}</h1>
          <p className="text-slate-400 text-sm mb-6">
            This is a placeholder page for your Homelab Dashboard.
          </p>

          <div className="border-t border-slate-700 pt-6">
            <p className="text-slate-300 mb-4">
              Route: <code className="text-slate-200 bg-slate-700 px-2 py-0.5 rounded">{path}</code>
            </p>
            <p className="text-slate-300">
              Here you can later embed Home Assistant, Nextcloud, Uptime graphs, AI tools, etc.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;
