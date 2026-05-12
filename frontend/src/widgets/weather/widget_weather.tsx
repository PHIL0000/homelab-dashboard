import { useState, useEffect, useCallback } from "react";
import { Card } from "@heroui/react";
import {
  Cloud,
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudSnow,
  CloudLightning,
  CloudFog,
  CloudMoon,
  Wind,
  Droplets,
  MapPin,
} from "lucide-react";
import type { WidgetDefinition, WidgetComponentProps } from "../types";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { API_BASE } from "@/lib/api";

const getWeatherIcon = (icon?: string | null, condition?: string | null) => {
  const combined = `${(icon || "").toLowerCase()} ${(condition || "").toLowerCase()}`;
  if (combined.includes("thunder")) return CloudLightning;
  if (combined.includes("snow") || combined.includes("sleet")) return CloudSnow;
  if (combined.includes("drizzle")) return CloudDrizzle;
  if (
    combined.includes("rain") ||
    combined.includes("hail") ||
    combined.includes("shower")
  )
    return CloudRain;
  if (combined.includes("fog") || combined.includes("mist")) return CloudFog;
  if (combined.includes("partly") || combined.includes("cloud-sun"))
    return CloudSun;
  if (combined.includes("cloud") || combined.includes("overcast")) return Cloud;
  if (
    combined.includes("night") ||
    (icon || "").toLowerCase().includes("moon")
  )
    return CloudMoon;
  return Sun;
};

const parseNum = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

interface WeatherData {
  city: string;
  temperature: number | null;
  condition: string | null;
  icon: string | null;
  windSpeed: number | null;
  humidity: number | null;
}

function WeatherWidget(_props: WidgetComponentProps) {
  const { token } = useAuth();
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const stationRes = await fetch(`${API_BASE}/settings/weather-station`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!stationRes.ok) throw new Error("No weather station configured");

      const station = await stationRes.json();
      const lat = parseNum(station?.latitude);
      const lon = parseNum(station?.longitude);
      if (lat === null || lon === null)
        throw new Error("No location configured");

      const weatherRes = await fetch(
        `https://api.brightsky.dev/current_weather?lat=${lat}&lon=${lon}`,
      );
      if (!weatherRes.ok) throw new Error("Weather data unavailable");

      const data = await weatherRes.json();
      const w = data?.weather ?? {};

      setWeather({
        city: String(station?.city || ""),
        temperature: parseNum(w.temperature),
        condition: typeof w.condition === "string" ? w.condition : null,
        icon: typeof w.icon === "string" ? w.icon : null,
        windSpeed: parseNum(w.wind_speed),
        humidity: parseNum(w.relative_humidity),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchWeather]);

  useEffect(() => {
    const handler = () => fetchWeather();
    window.addEventListener("weather-station-updated", handler);
    return () => window.removeEventListener("weather-station-updated", handler);
  }, [fetchWeather]);

  if (loading) {
    return (
      <Card className="h-full p-4 flex items-center justify-center">
        <span className="text-default-400 text-sm animate-pulse">
          {t("weather.loading")}
        </span>
      </Card>
    );
  }

  if (error || !weather) {
    return (
      <Card className="h-full p-4 flex flex-col items-center justify-center gap-2">
        <Cloud size={32} className="text-default-300" />
        <p className="text-default-400 text-sm text-center">
          {error || t("weather.unknown")}
        </p>
        <p className="text-default-300 text-xs text-center">
          {t("widget.weather.configureHint")}
        </p>
      </Card>
    );
  }

  const WeatherIcon = getWeatherIcon(weather.icon, weather.condition);
  const temp =
    weather.temperature !== null
      ? `${Math.round(weather.temperature)}°`
      : "--°";

  return (
    <Card className="h-full p-4 flex flex-col gap-3 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top right, var(--color-primary) 0%, transparent 60%)",
          opacity: 0.06,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin size={12} className="text-default-400 shrink-0" />
          <span className="text-sm font-medium text-default-600 truncate">
            {weather.city || t("weather.cityUnknown")}
          </span>
        </div>
      </div>

      {/* Main: icon + temperature */}
      <div className="flex-1 flex items-center justify-center gap-4">
        <WeatherIcon
          size={52}
          style={{ color: "var(--color-primary)" }}
          className="shrink-0 drop-shadow-lg"
        />
        <div className="flex flex-col">
          <span
            className="text-5xl font-bold tabular-nums leading-none"
            style={{ color: "var(--color-text)" }}
          >
            {temp}
          </span>
          {weather.condition && (
            <span className="text-sm text-default-400 mt-1 capitalize">
              {weather.condition}
            </span>
          )}
        </div>
      </div>

      {/* Footer: wind + humidity */}
      {(weather.windSpeed !== null || weather.humidity !== null) && (
        <div className="flex items-center justify-around border-t border-default-100 pt-2">
          {weather.windSpeed !== null && (
            <div className="flex items-center gap-1.5">
              <Wind size={13} className="text-default-400" />
              <span className="text-xs text-default-500">
                {Math.round(weather.windSpeed)} km/h
              </span>
            </div>
          )}
          {weather.humidity !== null && (
            <div className="flex items-center gap-1.5">
              <Droplets size={13} className="text-default-400" />
              <span className="text-xs text-default-500">
                {Math.round(weather.humidity)}%
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export const widgetDef: WidgetDefinition = {
  key: "weather.current",
  name: "Current Weather",
  description:
    "Shows temperature, weather conditions, wind, and humidity.",
  nameKey: "widget.weather.name",
  descriptionKey: "widget.weather.description",
  icon: "Cloud",
  defaultW: 3,
  defaultH: 3,
  minW: 2,
  minH: 2,
  defaultConfig: {},
  component: WeatherWidget,
};
