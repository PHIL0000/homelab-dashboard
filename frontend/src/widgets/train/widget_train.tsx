import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Chip } from "@heroui/react";
import {
  Train,
  ArrowRight,
  Clock,
  AlertTriangle,
  Search,
  X,
  Check,
  Settings,
} from "lucide-react";
import type { WidgetDefinition, WidgetComponentProps } from "../types";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { API_BASE } from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Station {
  name: string;
  evaNo: string;
}

interface TrainEntry {
  id: string;
  category: string;
  trainNo: string;
  line: string;
  plannedDep: string | null;
  actualDep: string | null;
  delayMinutes: number | null;
  platform: string | null;
  destination: string | null;
  origin: string | null;
  path: string[];
  cancelled: boolean;
}

interface TrainConfig {
  stationA: Station | null;
  stationB: Station | null;
}

function parseConfig(raw: Record<string, unknown>): TrainConfig {
  const a = raw.stationA as Station | null | undefined;
  const b = raw.stationB as Station | null | undefined;
  return {
    stationA: a?.name && a?.evaNo ? a : null,
    stationB: b?.name && b?.evaNo ? b : null,
  };
}

// ─── Station Search Input ─────────────────────────────────────────────────────

function StationSearchInput({
  value,
  onChange,
  placeholder,
  token,
}: {
  value: Station | null;
  onChange: (s: Station | null) => void;
  placeholder: string;
  token: string;
}) {
  const [query, setQuery] = useState(value?.name ?? "");
  const [results, setResults] = useState<Station[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const search = useCallback(
    async (q: string) => {
      if (q.trim().length < 2) {
        setResults([]);
        setOpen(false);
        setSearchError(null);
        return;
      }
      setLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(
          `${API_BASE}/db/stations?q=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
        const stations: Station[] = data.stations ?? [];
        setResults(stations.slice(0, 8));
        setOpen(true);
      } catch (e) {
        setSearchError(e instanceof Error ? e.message : "Suchfehler");
        setResults([]);
        setOpen(true); // open dropdown to show the error
      } finally {
        setLoading(false);
      }
    },
    [token],
  );

  const handleInput = (val: string) => {
    setQuery(val);
    if (value) onChange(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 280);
  };

  const select = (s: Station) => {
    onChange(s);
    setQuery(s.name);
    setOpen(false);
    setResults([]);
    setSearchError(null);
  };

  const clear = () => {
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
    setSearchError(null);
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5 rounded-xl border border-default-200 bg-default-50 px-3 py-2 focus-within:border-primary transition-colors">
        {value ? (
          <Check size={14} className="text-success shrink-0" />
        ) : (
          <Search size={14} className="text-default-400 shrink-0" />
        )}
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-default-400 min-w-0"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => (results.length > 0 || searchError) && setOpen(true)}
        />
        {loading && (
          <span className="text-default-300 text-xs animate-pulse">…</span>
        )}
        {(query || value) && (
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              clear();
            }}
            className="text-default-300 hover:text-default-500 transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-xl border border-default-200 bg-background shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {searchError ? (
            <div className="px-3 py-2 text-xs text-red-500">{searchError}</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-default-400">
              Keine Bahnhöfe gefunden
            </div>
          ) : (
            results.map((s) => (
              <button
                key={s.evaNo}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  select(s);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors border-b border-default-100 last:border-0"
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-default-400 text-xs ml-2">{s.evaNo}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Config Panel ─────────────────────────────────────────────────────────────

function ConfigPanel({
  current,
  token,
  onSave,
  onCancel,
}: {
  current: TrainConfig;
  token: string;
  onSave: (c: TrainConfig) => void;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const [stationA, setStationA] = useState<Station | null>(current.stationA);
  const [stationB, setStationB] = useState<Station | null>(current.stationB);

  return (
    <div
      className="flex flex-col gap-2 p-3 h-full"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-1.5">
        <Train size={14} className="text-primary" />
        <span className="text-xs font-semibold">
          {t("widget.train.configure")}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-default-500">
          {t("widget.train.from")}
        </label>
        <StationSearchInput
          value={stationA}
          onChange={setStationA}
          placeholder="z.B. Stuttgart Hbf"
          token={token}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-default-500">
          {t("widget.train.to")}
        </label>
        <StationSearchInput
          value={stationB}
          onChange={setStationB}
          placeholder="z.B. München Hbf"
          token={token}
        />
        <p className="text-xs text-default-400 leading-tight">
          {t("widget.train.toHint")}
        </p>
      </div>

      <div className="flex gap-2 mt-auto">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-xs py-1.5 rounded-lg border border-default-200 text-default-500 hover:bg-default-100 transition-colors"
        >
          {t("common.cancel")}
        </button>
        <button
          type="button"
          disabled={!stationA}
          onClick={() => stationA && onSave({ stationA, stationB })}
          onMouseDown={(e) => e.stopPropagation()}
          className="flex-1 text-xs py-1.5 rounded-xl font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--color-primary)",
            boxShadow:
              "0 0 0 2px color-mix(in srgb, var(--color-primary) 35%, transparent), 0 0 12px color-mix(in srgb, var(--color-primary) 30%, transparent)",
          }}
        >
          {t("settings.save")}
        </button>
      </div>
    </div>
  );
}

// ─── Delay Badge ──────────────────────────────────────────────────────────────

function DelayBadge({ minutes }: { minutes: number | null }) {
  if (minutes === null || minutes <= 0) return null;
  const color = minutes >= 10 ? "text-red-500" : "text-orange-400";
  return <span className={`text-xs font-bold ${color}`}>+{minutes}'</span>;
}

// ─── Train Row ────────────────────────────────────────────────────────────────
function TrainRow({ train }: { train: TrainEntry }) {
  const isDelayed = (train.delayMinutes ?? 0) > 0;
  const label = `${train.category} ${train.line || train.trainNo}`.trim();
  return (
    <tr
      className={`border-b border-default-100 last:border-0 ${
        train.cancelled ? "opacity-40" : ""
      }`}
    >
      {/* Zugnummer */}
      <td className="py-0.5 px-1.5">
        <span className="text-xs font-bold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary whitespace-nowrap">
          {label || "—"}
        </span>
      </td>
      {/* Abfahrt */}
      <td className="py-0.5 px-1.5 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <span className={`text-xs tabular-nums font-semibold ${isDelayed ? "text-default-400 line-through" : ""}`}>
            {train.plannedDep ?? "—"}
          </span>
          {isDelayed && (
            <span className="text-xs tabular-nums font-semibold text-orange-400">
              {train.actualDep}
            </span>
          )}
          <DelayBadge minutes={train.delayMinutes} />
        </div>
      </td>
      {/* Ziel */}
      <td className="py-0.5 px-1.5 max-w-[120px]">
        <div className="flex items-center gap-1">
          <ArrowRight size={10} className="text-default-300 shrink-0" />
          <span className="text-xs text-default-500 truncate">
            {train.destination ?? "—"}
          </span>
        </div>
      </td>
      {/* Gleis */}
      <td className="py-0.5 px-1.5 whitespace-nowrap">
        <span className="text-xs text-default-400">
          {train.platform ? `Gl.${train.platform}` : "—"}
        </span>
      </td>
    </tr>
  );
}

// ─── Main Widget ──────────────────────────────────────────────────────────────

function TrainWidget({
  widgetId,
  config: initialConfig,
  isEditing,
}: WidgetComponentProps) {
  const { token } = useAuth();
  const [config, setConfig] = useState<TrainConfig>(() =>
    parseConfig(initialConfig),
  );
  const [showConfig, setShowConfig] = useState(false);
  const [trains, setTrains] = useState<TrainEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Keep local config in sync if parent rerenders (e.g. after hot reload)
  const configRef = useRef(config);
  configRef.current = config;

  const saveConfig = useCallback(
    async (newConfig: TrainConfig) => {
      setConfig(newConfig);
      setShowConfig(false);
      if (!token) return;
      await fetch(`${API_BASE}/dashboard/widgets/${widgetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ config: newConfig }),
      });
    },
    [token, widgetId],
  );

  const fetchTimetable = useCallback(async () => {
    const cfg = configRef.current;
    if (!token || !cfg.stationA) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ evaNo: cfg.stationA.evaNo });
      if (cfg.stationB) params.set("destName", cfg.stationB.name);

      const res = await fetch(`${API_BASE}/db/timetable?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ error: "Unbekannter Fehler" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      setTrains(data.trains ?? []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (!config.stationA) return;
    fetchTimetable();
    const interval = setInterval(fetchTimetable, 60_000);
    return () => clearInterval(interval);
  }, [fetchTimetable, config.stationA]);

  // Show config panel when not configured or when clicking gear icon in edit mode
  if (showConfig || (!config.stationA && !isEditing)) {
    return (
      <Card className="h-full overflow-hidden">
        <ConfigPanel
          current={config}
          token={token ?? ""}
          onSave={saveConfig}
          onCancel={() => setShowConfig(false)}
        />
      </Card>
    );
  }

  if (!config.stationA) {
    return (
      <Card className="h-full p-4 flex flex-col items-center justify-center gap-3">
        <Train size={32} className="text-default-300" />
        <p className="text-sm text-default-400 text-center">
          Kein Bahnhof konfiguriert
        </p>
        <button
          type="button"
          onClick={() => setShowConfig(true)}
          className="text-xs px-3 py-1.5 rounded-lg border border-default-200 text-default-500 hover:bg-default-100 transition-colors"
        >
          Konfigurieren
        </button>
      </Card>
    );
  }

  const routeLabel = config.stationB
    ? `${config.stationA.name} → ${config.stationB.name}`
    : config.stationA.name;

  const fmtUpdated = lastUpdated
    ? `${String(lastUpdated.getHours()).padStart(2, "0")}:${String(lastUpdated.getMinutes()).padStart(2, "0")}`
    : null;

  return (
    <Card className="h-full flex flex-col overflow-hidden relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top left, var(--color-primary) 0%, transparent 60%)",
          opacity: 0.05,
        }}
      />

      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-1.5 pb-1 border-b border-default-100">
        <Train size={14} className="text-primary shrink-0" />
        <span
          className="text-sm font-semibold truncate flex-1"
          title={routeLabel}
        >
          {routeLabel}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {fmtUpdated && (
            <span className="text-xs text-default-300 flex items-center gap-0.5">
              <Clock size={10} />
              {fmtUpdated}
            </span>
          )}
          {isEditing && (
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => setShowConfig(true)}
              className="ml-1 text-default-400 hover:text-primary transition-colors"
              title="Bahnhof ändern"
            >
              <Settings size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col px-3 pt-0.5 pb-0 overflow-hidden">
        {loading && trains.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-default-300 text-xs animate-pulse">
              Wird geladen…
            </span>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <AlertTriangle size={20} className="text-orange-400" />
            <p className="text-xs text-default-400 text-center">{error}</p>
            <button
              type="button"
              onClick={fetchTimetable}
              className="text-xs text-primary hover:underline"
            >
              Erneut versuchen
            </button>
          </div>
        ) : trains.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-default-400 text-center">
              Keine Züge in den nächsten Stunden
            </p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-default-200">
                <th className="pb-0.5 px-1.5 text-xs font-medium text-default-400 whitespace-nowrap">Zug</th>
                <th className="pb-0.5 px-1.5 text-xs font-medium text-default-400 whitespace-nowrap">Abfahrt</th>
                <th className="pb-0.5 px-1.5 text-xs font-medium text-default-400 whitespace-nowrap">Ziel</th>
                <th className="pb-0.5 px-1.5 text-xs font-medium text-default-400 whitespace-nowrap">Gleis</th>
              </tr>
            </thead>
            <tbody>
              {trains.map((t) => (
                <TrainRow key={t.id} train={t} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cancelled indicator */}
      {trains.some((t) => t.cancelled) && (
        <div className="px-4 pb-2 flex items-center gap-1">
          <Chip size="sm" color="danger" variant="soft" className="text-xs">
            Ausfall
          </Chip>
        </div>
      )}
    </Card>
  );
}

// ─── Widget Definition ────────────────────────────────────────────────────────

export const widgetDef: WidgetDefinition = {
  key: "transport.db-timetable",
  name: "DB Fahrplan",
  description:
    "Zeigt die nächsten 5 Abfahrten an einem Bahnhof oder auf einer Strecke, inkl. Verspätungen.",
  icon: "Train",
  defaultW: 4,
  defaultH: 4,
  minW: 3,
  minH: 3,
  defaultConfig: { stationA: null, stationB: null },
  component: TrainWidget,
};
