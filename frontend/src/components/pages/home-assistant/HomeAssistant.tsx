import { useState, useEffect } from "react";
import { ExternalLink, AlertTriangle, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { API_BASE } from '@/lib/api';

export default function HomeAssistant() {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [haDomain, setHaDomain] = useState<string>("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/settings`);
        if (res.ok) {
          const data = await res.json();
          setHaDomain(data.haDomain || "");
        }
      } catch (error) {
        console.error("Failed to load HA domain", error);
      }
    };
    fetchSettings();
  }, []);

  const HOME_ASSISTANT_URL = haDomain;
  const isValidUrl = HOME_ASSISTANT_URL.startsWith('http://') || HOME_ASSISTANT_URL.startsWith('https://');

  useEffect(() => {
    // Wait slightly to show loading spinner initially. 
    // And also wait if the iframe blocks via CSP.
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="page-shell">
      <div className="page-header">
        <a 
          href={isValidUrl ? HOME_ASSISTANT_URL : undefined}
          target={isValidUrl ? "_blank" : undefined}
          rel="noopener noreferrer"
          className="flex items-center gap-3 cursor-pointer group w-fit"
          title={isValidUrl ? "Open in new tab" : "No valid URL provided"}
        >
          <h1 className="page-title group-hover:opacity-90 transition-opacity">
            Home Assistant
          </h1>
          {isValidUrl && (
            <ExternalLink className="text-slate-400 group-hover:text-purple-400 transition-all opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 duration-200" size={24} />
          )}
        </a>
      </div>

      <div className="page-content-scroll">
      <div className="h-full w-full rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/50/40 relative min-h-0">
        
        {/* Loading bar / Background that adapts to theme */}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 text-slate-400 z-0">
          {(!isValidUrl || iframeError) ? (
            <div className="flex flex-col items-center gap-4 p-8 text-center max-w-md z-10 relative">
              <AlertTriangle size={48} className="text-red-500 opacity-80" />
              <h3 className="text-xl font-semibold text-slate-100">Connection Failed</h3>
              <p className="text-sm text-slate-400">
                {isValidUrl 
                  ? "The dashboard could not be loaded. This might be due to Home Assistant blocking embedding via X-Frame-Options, or an invalid URL configuration." 
                  : "No valid Home Assistant URL has been configured. Please specify a valid domain in the settings."}
              </p>
              
              <div className="mt-4 w-full flex flex-col gap-3">
                <div className="p-4 border border-slate-700/50 bg-slate-900/50 rounded-lg text-sm font-mono break-all text-slate-100">
                  {HOME_ASSISTANT_URL || "No URL set"}
                </div>
                
                <Link 
                  to="/settings" 
                  className="flex items-center justify-center gap-2 px-4 py-2 mt-2 bg-purple-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(168, 85, 247, 0.5)] transition-all"
                >
                  <Settings size={18} />
                  <span>Go to settings</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-pulse flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm">Loading Home Assistant...</p>
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
    </div>
  )
}
