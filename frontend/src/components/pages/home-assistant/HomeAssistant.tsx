import { Card } from '@heroui/react'
import { ExternalLink } from "lucide-react";

export default function HomeAssistant() {
  // 🔧 HIER DEINE HOME ASSISTANT URL EINTRAGEN
  const HOME_ASSISTANT_URL = "https://ha.hlphil.de/wall-tablet/home";

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      <div className="mb-4 flex-shrink-0">
        <a 
          href={HOME_ASSISTANT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 cursor-pointer group w-fit"
          title="In neuem Tab öffnen"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text group-hover:text-primary transition-colors">
            Home Assistant
          </h1>
          <ExternalLink className="text-text-secondary group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-200" size={24} />
        </a>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden border border-border bg-content shadow-lg relative min-h-0">
        {/* Fallback Text, falls das Iframe nicht lädt / blockiert wird */}
        <div className="absolute inset-0 flex items-center justify-center -z-10 text-text-secondary">
          Iframe lädt URL: {HOME_ASSISTANT_URL}...
        </div>

        <iframe
          src={`${HOME_ASSISTANT_URL}?kiosk`}
          className="w-full h-full border-none absolute inset-0"
          title="Home Assistant Dashboard"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  )
}
