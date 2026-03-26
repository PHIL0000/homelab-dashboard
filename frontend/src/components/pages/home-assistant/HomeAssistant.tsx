import { useState, useEffect } from "react";
import { ExternalLink, AlertTriangle, Settings } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeAssistant() {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Holt die URL aus dem LocalStorage
  const HOME_ASSISTANT_URL = localStorage.getItem('haDomain') || "";
  const isValidUrl = HOME_ASSISTANT_URL.startsWith('http://') || HOME_ASSISTANT_URL.startsWith('https://');

  useEffect(() => {
    // Nach kurzem Warten setzen wir isLoading auf false.
    // Ein iframe löst leider kein echtes "onerror" aus, wenn die CSP (X-Frame-Options) der Zielseite blockiert.
    // Wir können nur den onload abfangen.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col p-4 md:p-8">
      <div className="mb-4 flex-shrink-0">
        <a 
          href={isValidUrl ? HOME_ASSISTANT_URL : undefined}
          target={isValidUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="flex items-center gap-3 cursor-pointer group w-fit"
          title={isValidUrl ? "In neuem Tab öffnen" : "Keine gültige URL hinterlegt"}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-text group-hover:text-primary transition-colors">
            Home Assistant
          </h1>
          {isValidUrl && (
            <ExternalLink className="text-text-secondary group-hover:text-primary transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-200" size={24} />
          )}
        </a>
      </div>

      <div className="flex-1 w-full rounded-xl overflow-hidden border border-border bg-content shadow-lg relative min-h-0">
        
        {/* Ladebalken / Hintergrund der sich an Theme anpasst */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background text-text-secondary z-0">
          {(!isValidUrl || iframeError) ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md z-10 relative">
              <AlertTriangle size={48} className="text-red-500 opacity-80" />
              <h3 className="text-xl font-semibold text-text">Verbindung fehlgeschlagen</h3>
              <p className="text-sm text-text-secondary">
                {isValidUrl 
                  ? "Das Dashboard konnte nicht geladen werden. Möglicherweise blockiert Home Assistant die Einbettung (X-Frame-Options) oder die URL ist falsch konfiguriert." 
                  : "Es wurde keine gültige Home Assistant URL konfiguriert. Bitte hinterlege eine gültige Domain in den Einstellungen."}
              </p>
              
              <div className="mt-4 w-full flex flex-col gap-3">
                <div className="p-4 border border-border bg-content rounded-lg text-sm font-mono break-all text-text">
                  {HOME_ASSISTANT_URL || "Keine URL gesetzt"}
                </div>
                
                <Link 
                  to="/settings" 
                  className="flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-primary text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] transition-all"
                >
                  <Settings size={18} />
                  <span>Zu den Einstellungen</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Lade Home Assistant...</p>
            </div>
          )}
        </div>

        {isValidUrl && !iframeError && (
          <iframe
            src={`${HOME_ASSISTANT_URL}?kiosk`}
            className={`w-full h-full border-none absolute inset-0 transition-opacity duration-300 z-10 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
            title="Home Assistant Dashboard"
            allowFullScreen
            onLoad={() => setIsLoading(false)}
            onError={() => setIframeError(true)}
          ></iframe>
        )}
      </div>
    </div>
  )
}
