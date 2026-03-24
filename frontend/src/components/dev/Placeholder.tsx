import React from "react";

const PlaceholderPage: React.FC = () => {
  const path = window.location.pathname;
  const pageName = path.split("/").pop()?.replace("-", " ") || "Page";

  return (
    <div className="h-full w-full p-6 md:p-8">
      <div className="h-full rounded-lg shadow-lg p-6 bg-content border border-border">
        <h1 className="text-2xl font-bold capitalize mb-2 text-primary">{pageName}</h1>
        <p className="text-sm mb-6 text-text-secondary">
          This is a placeholder page for your Homelab Dashboard.
        </p>

        <div className="pt-6 border-t border-border">
          <p className="mb-4 text-text">
            Route:{" "}
            <code className="px-2 py-0.5 rounded bg-sidebar text-text">{path}</code>
          </p>
          <p className="text-text">
            Here you can later embed Home Assistant, Nextcloud, Uptime graphs, AI tools, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderPage;
