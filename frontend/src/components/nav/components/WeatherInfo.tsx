import React, { useCallback, useEffect, useState } from "react";
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
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// ─── Typen ────────────────────────────────────────────────────────────────────

interface SidebarWeatherInfo {
  city: string;
  icon: string | null;
  condition: string | null;
  temperature: number | null;
}

interface WeatherInfoProps {
  token: string | null;
  isCollapsed?: boolean;
}

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

const parseNumericValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const getWeatherPresentation = (
  t: (key: string) => string,
  icon?: string | null,
  condition?: string | null,
) => {
  const normalizedIcon = (icon || "").toLowerCase();
  const normalizedCondition = (condition || "").toLowerCase();
  const combined = `${normalizedIcon} ${normalizedCondition}`;

  if (combined.includes("thunder"))
    return { label: t("weather.thunder"), Icon: CloudLightning };
  if (combined.includes("snow") || combined.includes("sleet"))
    return { label: t("weather.snow"), Icon: CloudSnow };
  if (combined.includes("drizzle"))
    return { label: t("weather.drizzle"), Icon: CloudDrizzle };
  if (
    combined.includes("rain") ||
    combined.includes("hail") ||
    combined.includes("shower")
  )
    return { label: t("weather.rain"), Icon: CloudRain };
  if (combined.includes("fog") || combined.includes("mist"))
    return { label: t("weather.fog"), Icon: CloudFog };
  if (combined.includes("partly") || combined.includes("cloud-sun"))
    return { label: t("weather.partly"), Icon: CloudSun };
  if (combined.includes("cloud") || combined.includes("overcast"))
    return { label: t("weather.cloud"), Icon: Cloud };
  if (combined.includes("night") || normalizedIcon.includes("moon"))
    return { label: t("weather.clear"), Icon: CloudMoon };
  return { label: t("weather.sun"), Icon: Sun };
};

// ─── Konstanten ───────────────────────────────────────────────────────────────

/** Wie oft das Wetter automatisch neu geladen wird (Standard: 30 Minuten) */
const WEATHER_REFRESH_INTERVAL_MS = 30 * 60 * 1000;

/** Custom-Event-Name, der von GeneralTab nach dem Speichern gefeuert wird */
const WEATHER_UPDATED_EVENT = "weather-station-updated";

// ─── Komponente ───────────────────────────────────────────────────────────────

const WeatherInfo: React.FC<WeatherInfoProps> = ({ token, isCollapsed }) => {
  const { t } = useLanguage();
  const [weatherInfo, setWeatherInfo] = useState<SidebarWeatherInfo | null>(
    null,
  );
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);

  /**
   * loadWeather als stabile Referenz mit useCallback,
   * damit sie sowohl im Interval als auch im Event-Listener genutzt werden kann.
   */
  const loadWeather = useCallback(async () => {
    if (!token) {
      setWeatherInfo(null);
      return;
    }

    setIsWeatherLoading(true);

    try {
      // 1. Stationsdaten (Stadt + Koordinaten) aus der DB holen
      const stationResponse = await fetch(
        "http://localhost:3001/api/settings/weather-station",
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!stationResponse.ok)
        throw new Error("Weather station settings unavailable");

      const stationData = await stationResponse.json();
      const latitude = parseNumericValue(stationData?.latitude);
      const longitude = parseNumericValue(stationData?.longitude);

      if (latitude === null || longitude === null) {
        setWeatherInfo(null);
        return;
      }

      // 2. Aktuelles Wetter über die Koordinaten abrufen
      const currentWeatherResponse = await fetch(
        `https://api.brightsky.dev/current_weather?lat=${latitude}&lon=${longitude}`,
      );
      if (!currentWeatherResponse.ok)
        throw new Error("Current weather unavailable");

      const currentWeatherData = await currentWeatherResponse.json();
      const current = currentWeatherData?.weather ?? {};

      setWeatherInfo({
        city: String(stationData?.city || ""),
        icon:
          typeof current.icon === "string" && current.icon.trim().length > 0
            ? current.icon
            : null,
        condition:
          typeof current.condition === "string" &&
          current.condition.trim().length > 0
            ? current.condition
            : null,
        temperature: parseNumericValue(current.temperature),
      });
    } catch (error) {
      console.error("Failed to load sidebar weather", error);
      setWeatherInfo(null);
    } finally {
      setIsWeatherLoading(false);
    }
  }, [token]);

  // ── Automatischer Reload alle 30 Minuten + initialer Load ──────────────────
  useEffect(() => {
    if (!token) {
      setWeatherInfo(null);
      return;
    }

    loadWeather();
    const refreshTimer = window.setInterval(
      loadWeather,
      WEATHER_REFRESH_INTERVAL_MS,
    );

    return () => window.clearInterval(refreshTimer);
  }, [token, loadWeather]);

  // ── Sofortiger Reload, wenn Settings gespeichert wurden ────────────────────
  // GeneralTab feuert: window.dispatchEvent(new Event("weather-station-updated"))
  useEffect(() => {
    const handler = () => loadWeather();
    window.addEventListener(WEATHER_UPDATED_EVENT, handler);
    return () => window.removeEventListener(WEATHER_UPDATED_EVENT, handler);
  }, [loadWeather]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const weatherPresentation = getWeatherPresentation(
    t as (key: string) => string,
    weatherInfo?.icon,
    weatherInfo?.condition,
  );
  const weatherDisplay = weatherInfo
    ? weatherPresentation
    : { label: t("weather.unknown"), Icon: Cloud };
  const WeatherIcon = weatherDisplay.Icon;
  const weatherTemperatureLabel =
    weatherInfo?.temperature !== null && weatherInfo?.temperature !== undefined
      ? `${Math.round(weatherInfo.temperature)}°C`
      : "--°C";

  return (
    <div
      className={`flex min-w-0 ${
        isCollapsed ? "flex-col items-center gap-1" : "items-center gap-2"
      }`}
    >
      {/* Icon + Label */}
      <div className="flex flex-col items-center shrink-0">
        <WeatherIcon size={16} className="text-[var(--color-primary)]" />
        <p className="text-[10px] text-[var(--color-text)] font-medium text-center break-words max-w-[60px]">
          {isWeatherLoading ? t("weather.loading") : weatherDisplay.label}
        </p>
      </div>

      {/* Temp + City */}
      <div
        className={`flex flex-col min-w-0 ${isCollapsed ? "items-center" : "items-end"}`}
      >
        <p className="text-sm font-semibold text-[var(--color-text)] truncate">
          {isWeatherLoading ? "..." : weatherTemperatureLabel}
        </p>
        <p className="text-[10px] text-[var(--color-textSecondary)] break-all max-w-[70px]">
          {weatherInfo?.city?.trim() || t("weather.cityUnknown")}
        </p>
      </div>
    </div>
  );
};

export default WeatherInfo;
