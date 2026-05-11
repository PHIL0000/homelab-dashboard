import { useCallback, useEffect, useRef, useState } from "react";
import { showSuccess, showError } from "../../../../toast";
import { Input, Select, ListBox } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/lib/api";

const TIMEZONE_OPTIONS = [
  "Europe/Berlin",
  "UTC",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
];

const DATE_FORMAT_OPTIONS = [
  "DD-MM-YYYY",
  "MM-DD-YYYY",
  "YYYY-MM-DD",
  "DD.MM.YYYY",
] as const;
const TIME_FORMAT_OPTIONS = ["24h", "12h"] as const;

type WeatherLookupField = "city" | "coordinates";

type GeneralTabProps = {
  saveFnRef?: React.RefObject<(() => Promise<void>) | null>;
};

export default function GeneralTab({ saveFnRef }: GeneralTabProps) {
  const { t, language, setLanguage } = useLanguage();
  const { user, token, updateUser } = useAuth();
  const [pendingLanguage, setPendingLanguage] = useState<Language>(language);
  const [dashboardName, setDashboardName] = useState("Homelab");
  const [timezone, setTimezone] = useState("Europe/Berlin");
  const [timeFormat, setTimeFormat] = useState<"12h" | "24h">("24h");
  const [dateFormat, setDateFormat] = useState<
    "DD-MM-YYYY" | "MM-DD-YYYY" | "YYYY-MM-DD" | "DD.MM.YYYY"
  >("DD-MM-YYYY");
  const [weatherLocation, setWeatherLocation] = useState("");
  const [weatherLat, setWeatherLat] = useState("");
  const [weatherLon, setWeatherLon] = useState("");
  const [lastEditedWeatherField, setLastEditedWeatherField] =
    useState<WeatherLookupField | null>(null);
  const [isResolvingWeather, setIsResolvingWeather] = useState(false);

  // *** NEU: fetchWeatherSettings als useCallback, damit handleSave sie im Fehlerfall aufrufen kann ***
  const fetchWeatherSettings = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${API_BASE}/settings/weather-station`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data) {
        setWeatherLocation(data.city || "");
        setWeatherLat(
          data.latitude !== null && data.latitude !== undefined
            ? String(data.latitude)
            : "",
        );
        setWeatherLon(
          data.longitude !== null && data.longitude !== undefined
            ? String(data.longitude)
            : "",
        );
      }
    } catch (e) {
      // ignore
    }
  }, [token]);

  useEffect(() => {
    if (!user) return;
    setDashboardName(user.dashboardName || "Homelab");
    setTimezone(user.timezone || "Europe/Berlin");
    setTimeFormat(user.timeFormat === "12h" ? "12h" : "24h");

    const nextDateFormat = user.dateFormat;
    if (
      nextDateFormat === "MM-DD-YYYY" ||
      nextDateFormat === "YYYY-MM-DD" ||
      nextDateFormat === "DD.MM.YYYY" ||
      nextDateFormat === "DD-MM-YYYY"
    ) {
      setDateFormat(nextDateFormat);
    } else {
      setDateFormat("DD-MM-YYYY");
    }

    fetchWeatherSettings();
  }, [user, token, fetchWeatherSettings]);

  // Nominatim lookup helpers
  const nominatimForward = async (city: string) => {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to resolve city");
    const data = await res.json();
    if (!data || !data[0]) throw new Error("No result for city");
    return {
      lat: data[0].lat,
      lon: data[0].lon,
      display_name: data[0].display_name,
    };
  };

  const nominatimReverse = async (lat: string, lon: string) => {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to resolve coordinates");
    const data = await res.json();
    if (!data || !data.address) throw new Error("No result for coordinates");
    const city =
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.display_name ||
      "";
    return { city };
  };

  // Live lookup effect (Debounce beim Tippen)
  useEffect(() => {
    if (!lastEditedWeatherField) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsResolvingWeather(true);
        if (lastEditedWeatherField === "city" && weatherLocation.trim()) {
          const result = await nominatimForward(weatherLocation.trim());
          setWeatherLat(result.lat);
          setWeatherLon(result.lon);
        } else if (
          lastEditedWeatherField === "coordinates" &&
          weatherLat.trim() &&
          weatherLon.trim()
        ) {
          const result = await nominatimReverse(
            weatherLat.trim(),
            weatherLon.trim(),
          );
          setWeatherLocation(result.city);
        }
      } catch (error: any) {
        // ignore – Fehler werden erst beim Save behandelt
      } finally {
        setIsResolvingWeather(false);
        setLastEditedWeatherField(null);
      }
    }, 350);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [lastEditedWeatherField, weatherLocation, weatherLat, weatherLon]);

  const handleLanguageChange = (value: string) => {
    if (value === "en" || value === "de") {
      setPendingLanguage(value as Language);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;

    try {
      const response = await fetch(
        `${API_BASE}/user-settings/${user.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dashboardName: dashboardName.trim() || "Homelab",
            timezone,
            timeFormat,
            dateFormat,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("settings.saveError"));
      updateUser(data);

      const city = weatherLocation.trim();
      if (!city) {
        showError("Please enter a city name.");
        return;
      }

      let resolvedLat: number;
      let resolvedLon: number;
      try {
        const geoResult = await nominatimForward(city);
        resolvedLat = Number(geoResult.lat);
        resolvedLon = Number(geoResult.lon);
        if (!Number.isFinite(resolvedLat) || !Number.isFinite(resolvedLon)) {
          throw new Error("Invalid coordinates");
        }
      } catch {
        showError(`City "${city}" could not be found. Please check the name and try again.`);
        await fetchWeatherSettings();
        return;
      }

      setWeatherLat(String(resolvedLat));
      setWeatherLon(String(resolvedLon));

      const weatherResponse = await fetch(
        `${API_BASE}/settings/weather-station`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            city,
            latitude: resolvedLat,
            longitude: resolvedLon,
          }),
        },
      );
      const weatherData = await weatherResponse.json();
      if (!weatherResponse.ok)
        throw new Error(weatherData.error || t("settings.saveError"));

      setWeatherLocation(weatherData.city || "");
      setWeatherLat(
        weatherData.latitude !== null && weatherData.latitude !== undefined
          ? String(weatherData.latitude)
          : "",
      );
      setWeatherLon(
        weatherData.longitude !== null && weatherData.longitude !== undefined
          ? String(weatherData.longitude)
          : "",
      );

      setLanguage(pendingLanguage);
      showSuccess(t("settings.saveSuccess"));
      window.dispatchEvent(new Event("weather-station-updated"));
    } catch (error: any) {
      showError(error.message || t("settings.saveError"));
    }
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;

  useEffect(() => {
    if (saveFnRef) {
      saveFnRef.current = () => handleSaveRef.current();
      return () => {
        saveFnRef.current = null;
      };
    }
  }, [saveFnRef]);

  return (
    <div className="doc-theme-form grid grid-cols-1 gap-6 max-w-3xl">
      {/* Dashboard Info & Language */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">
          {t("settings.dashboardInfo")}
        </h2>

        {/* Toasts werden global angezeigt */}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {t("settings.dashboardName")}
            </label>
            <Input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {t("settings.language")}
            </label>
            <Select
              selectedKey={pendingLanguage}
              onSelectionChange={(key) => {
                if (key != null) handleLanguageChange(String(key));
              }}
              className="w-full"
            >
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  <ListBox.Item id="en" className="pl-2">
                    English
                  </ListBox.Item>
                  <ListBox.Item id="de" className="pl-2">
                    Deutsch
                  </ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      </div>

      {/* Timezone, Date & Time Format */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("settings.timezoneDate")}
        </h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {t("settings.timezone")}
            </label>
            <Select
              selectedKey={timezone}
              onSelectionChange={(key) => {
                if (key != null) setTimezone(String(key));
              }}
              className="w-full"
            >
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  {TIMEZONE_OPTIONS.map((zone) => (
                    <ListBox.Item key={zone} id={zone} className="pl-2">
                      {zone}
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Time Format
              </label>
              <Select
                selectedKey={timeFormat}
                onSelectionChange={(key) => {
                  if (key != null)
                    setTimeFormat(String(key) === "12h" ? "12h" : "24h");
                }}
                className="w-full"
              >
                <Select.Trigger className="w-full px-3 flex items-center justify-between">
                  <Select.Value />
                  <ChevronDown size={16} className="text-slate-400" />
                </Select.Trigger>
                <Select.Popover className="w-[var(--trigger-width)]">
                  <ListBox>
                    {TIME_FORMAT_OPTIONS.map((format) => (
                      <ListBox.Item key={format} id={format} className="pl-2">
                        {format}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Date Format
              </label>
              <Select
                selectedKey={dateFormat}
                onSelectionChange={(key) => {
                  if (key == null) return;
                  const value = String(key);
                  if (
                    value === "MM-DD-YYYY" ||
                    value === "YYYY-MM-DD" ||
                    value === "DD.MM.YYYY" ||
                    value === "DD-MM-YYYY"
                  ) {
                    setDateFormat(value);
                  }
                }}
                className="w-full"
              >
                <Select.Trigger className="w-full px-3 flex items-center justify-between">
                  <Select.Value />
                  <ChevronDown size={16} className="text-slate-400" />
                </Select.Trigger>
                <Select.Popover className="w-[var(--trigger-width)]">
                  <ListBox>
                    {DATE_FORMAT_OPTIONS.map((format) => (
                      <ListBox.Item key={format} id={format} className="pl-2">
                        {format}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Weather Settings */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">
          {t("settings.weather")}
        </h2>
        <p className="text-slate-400 mb-4">{t("settings.weather.desc")}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              {t("settings.weather.location")}
            </label>
            <Input
              type="text"
              value={weatherLocation}
              onChange={(e) => {
                setWeatherLocation(e.target.value);
                setLastEditedWeatherField("city");
              }}
              placeholder={t("settings.weather.placeholder.location")}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {t("settings.weather.gps")} (Lat)
              </label>
              <Input
                type="text"
                value={weatherLat}
                onChange={(e) => {
                  setWeatherLat(e.target.value);
                  setLastEditedWeatherField("coordinates");
                }}
                placeholder="52.5200"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                {t("settings.weather.gps")} (Lon)
              </label>
              <Input
                type="text"
                value={weatherLon}
                onChange={(e) => {
                  setWeatherLon(e.target.value);
                  setLastEditedWeatherField("coordinates");
                }}
                placeholder="13.4050"
                className="w-full"
              />
            </div>
          </div>

          {isResolvingWeather && (
            <p className="text-xs text-blue-400 mt-1">Resolving location…</p>
          )}
        </div>
      </div>

    </div>
  );
}
