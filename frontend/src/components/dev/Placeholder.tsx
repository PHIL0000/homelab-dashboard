import React from "react";

const PlaceholderPage: React.FC = () => {
  const path = window.location.pathname;
  const pageName = path.split("/").pop()?.replace("-", " ") || "Page";

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <h1 className="page-title capitalize">{pageName}</h1>
          <p className="page-subtitle">This is a placeholder page for your Homelab Dashboard.</p>
        </div>
      </div>

      <div className="page-content-scroll">
        <div className="pt-2">
          <p className="mb-4 text-slate-100">
            Route:{" "}
            <code className="px-2 py-0.5 rounded bg-slate-900/50 text-slate-100">{path}</code>
          </p>
          <p className="text-slate-100">
            Here you can later embed Home Assistant, Nextcloud, Uptime graphs, AI tools, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
