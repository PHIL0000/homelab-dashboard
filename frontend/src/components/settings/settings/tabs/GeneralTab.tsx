import { useEffect, useState } from 'react';
import { Button, Input, Select, ListBox } from '@heroui/react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from "@/context/LanguageContext";
import type { Language } from "@/i18n/translations";
import { useAuth } from '@/context/AuthContext';

const TIMEZONE_OPTIONS = [
  'Europe/Berlin',
  'UTC',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Tokyo'
];

const DATE_FORMAT_OPTIONS = ['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY'] as const;
const TIME_FORMAT_OPTIONS = ['24h', '12h'] as const;

type WeatherLookupField = 'stationId' | 'city' | 'coordinates';

export default function GeneralTab() {
  const { t, language, setLanguage } = useLanguage();
  const { user, token, updateUser } = useAuth();
  const [dashboardName, setDashboardName] = useState('Homelab');
  const [timezone, setTimezone] = useState('Europe/Berlin');
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('24h');
  const [dateFormat, setDateFormat] = useState<'DD-MM-YYYY' | 'MM-DD-YYYY' | 'YYYY-MM-DD' | 'DD.MM.YYYY'>('DD-MM-YYYY');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [weatherLocation, setWeatherLocation] = useState("");
  const [weatherLat, setWeatherLat] = useState("");
  const [weatherLon, setWeatherLon] = useState("");
  const [weatherStationId, setWeatherStationId] = useState("");
  const [lastEditedWeatherField, setLastEditedWeatherField] = useState<WeatherLookupField | null>(null);
  const [isResolvingWeather, setIsResolvingWeather] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDashboardName(user.dashboardName || 'Homelab');
    setTimezone(user.timezone || 'Europe/Berlin');
    setTimeFormat(user.timeFormat === '12h' ? '12h' : '24h');

    const nextDateFormat = user.dateFormat;
    if (nextDateFormat === 'MM-DD-YYYY' || nextDateFormat === 'YYYY-MM-DD' || nextDateFormat === 'DD.MM.YYYY' || nextDateFormat === 'DD-MM-YYYY') {
      setDateFormat(nextDateFormat);
    } else {
      setDateFormat('DD-MM-YYYY');
    }

    // Fetch weather station settings from backend
    const fetchWeatherSettings = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/settings/weather-station', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data) {
          setWeatherStationId(data.stationId || "");
          setWeatherLocation(data.city || "");
          setWeatherLat(data.latitude !== null && data.latitude !== undefined ? String(data.latitude) : "");
          setWeatherLon(data.longitude !== null && data.longitude !== undefined ? String(data.longitude) : "");
        }
      } catch (e) {
        // ignore
      }
    };
    fetchWeatherSettings();
  }, [user, token]);

  const buildWeatherLookupPayload = (field: WeatherLookupField): Record<string, unknown> | null => {
    const stationIdInput = weatherStationId.trim();
    const cityInput = weatherLocation.trim();
    const latInput = weatherLat.trim();
    const lonInput = weatherLon.trim();

    const parsedLat = latInput ? Number(latInput) : undefined;
    const parsedLon = lonInput ? Number(lonInput) : undefined;
    const hasValidCoordinates = Number.isFinite(parsedLat) && Number.isFinite(parsedLon);

    if (field === 'stationId') {
      return stationIdInput ? { stationId: stationIdInput } : null;
    }

    if (field === 'city') {
      return cityInput ? { city: cityInput } : null;
    }

    if (field === 'coordinates') {
      return hasValidCoordinates ? { latitude: parsedLat, longitude: parsedLon } : null;
    }

    return null;
  };

  const resolveWeatherStation = async (payload: Record<string, unknown>, abortSignal?: AbortSignal) => {
    if (!token) {
      throw new Error(t('settings.saveError'));
    }

    const response = await fetch('http://localhost:3001/api/settings/weather-station/resolve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      signal: abortSignal
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t('settings.saveError'));
    }

    return data;
  };

  useEffect(() => {
    if (!token || !lastEditedWeatherField) return;

    const payload = buildWeatherLookupPayload(lastEditedWeatherField);
    if (!payload) return;

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsResolvingWeather(true);
        const resolved = await resolveWeatherStation(payload, controller.signal);
        setWeatherStationId(resolved.stationId || '');
        setWeatherLocation(resolved.city || '');
        setWeatherLat(resolved.latitude !== null && resolved.latitude !== undefined ? String(resolved.latitude) : '');
        setWeatherLon(resolved.longitude !== null && resolved.longitude !== undefined ? String(resolved.longitude) : '');
        setLastEditedWeatherField(null);
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
      } finally {
        setIsResolvingWeather(false);
      }
    }, 350);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [lastEditedWeatherField, token, weatherStationId, weatherLocation, weatherLat, weatherLon]);

  const handleLanguageChange = (value: string) => {
    if (value === "en" || value === "de") {
      setLanguage(value as Language);
    }
  };

  const handleSave = async () => {
    if (!user || !token) return;

    setIsSaving(true);
    setMessage(null);

    try {
      // Save user settings
      const response = await fetch(`http://localhost:3001/api/user-settings/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          dashboardName: dashboardName.trim() || 'Homelab',
          timezone,
          timeFormat,
          dateFormat
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t('settings.saveError'));
      }

      updateUser(data);

      let nextWeatherData = {
        stationId: weatherStationId.trim(),
        city: weatherLocation.trim(),
        latitude: weatherLat.trim() ? Number(weatherLat.trim()) : undefined,
        longitude: weatherLon.trim() ? Number(weatherLon.trim()) : undefined
      };

      if (lastEditedWeatherField) {
        const livePayload = buildWeatherLookupPayload(lastEditedWeatherField);
        if (!livePayload) {
          throw new Error(t('settings.weather.info'));
        }

        const resolved = await resolveWeatherStation(livePayload);
        nextWeatherData = {
          stationId: resolved.stationId || '',
          city: resolved.city || '',
          latitude: resolved.latitude,
          longitude: resolved.longitude
        };
        setLastEditedWeatherField(null);
      }

      const weatherLookupPayload: Record<string, unknown> = nextWeatherData.stationId
        ? { stationId: nextWeatherData.stationId }
        : (Number.isFinite(nextWeatherData.latitude) && Number.isFinite(nextWeatherData.longitude))
          ? { latitude: nextWeatherData.latitude, longitude: nextWeatherData.longitude }
          : nextWeatherData.city
            ? { city: nextWeatherData.city }
            : {};

      if (Object.keys(weatherLookupPayload).length === 0) {
        throw new Error(t('settings.weather.info'));
      }

      const weatherResponse = await fetch('http://localhost:3001/api/settings/weather-station', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(weatherLookupPayload)
      });

      const weatherData = await weatherResponse.json();
      if (!weatherResponse.ok) {
        throw new Error(weatherData.error || t('settings.saveError'));
      }

      setWeatherStationId(weatherData.stationId || '');
      setWeatherLocation(weatherData.city || '');
      setWeatherLat(weatherData.latitude !== null && weatherData.latitude !== undefined ? String(weatherData.latitude) : '');
      setWeatherLon(weatherData.longitude !== null && weatherData.longitude !== undefined ? String(weatherData.longitude) : '');

      setMessage({ type: 'success', text: t('settings.saveSuccess') });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('settings.saveError') });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="doc-theme-form grid grid-cols-1 gap-6 max-w-3xl">
      {/* Dashboard Info & Language */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-4 text-slate-100">{t('settings.dashboardInfo')}</h2>
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}>
            {message.text}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.dashboardName')}</label>
            <Input
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.language')}</label>
            <Select selectedKey={language} onChange={(key) => { if (key != null) handleLanguageChange(String(key)); }} className="w-full">
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  <ListBox.Item id="en" className="pl-2">English</ListBox.Item>
                  <ListBox.Item id="de" className="pl-2">Deutsch</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
        </div>
      </div>

      {/* Timezone, Date & Time Format */}
      <div className="p-6 rounded-lg border border-slate-700/50 bg-slate-900/50">
        <h2 className="text-xl font-semibold mb-2 text-slate-100">{t('settings.timezoneDate')}</h2>
        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.timezone')}</label>
            <Select selectedKey={timezone} onChange={(key) => { if (key != null) setTimezone(String(key)); }} className="w-full">
              <Select.Trigger className="w-full px-3 flex items-center justify-between">
                <Select.Value />
                <ChevronDown size={16} className="text-slate-400" />
              </Select.Trigger>
              <Select.Popover className="w-[var(--trigger-width)]">
                <ListBox>
                  {TIMEZONE_OPTIONS.map((zone) => (
                    <ListBox.Item key={zone} id={zone} className="pl-2">{zone}</ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Time Format</label>
              <Select selectedKey={timeFormat} onChange={(key) => { if (key != null) setTimeFormat(String(key) === '12h' ? '12h' : '24h'); }} className="w-full">
                <Select.Trigger className="w-full px-3 flex items-center justify-between">
                  <Select.Value />
                  <ChevronDown size={16} className="text-slate-400" />
                </Select.Trigger>
                <Select.Popover className="w-[var(--trigger-width)]">
                  <ListBox>
                    {TIME_FORMAT_OPTIONS.map((format) => (
                      <ListBox.Item key={format} id={format} className="pl-2">{format}</ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Date Format</label>
              <Select selectedKey={dateFormat} onChange={(key) => {
                if (key == null) return;
                const value = String(key);
                if (value === 'MM-DD-YYYY' || value === 'YYYY-MM-DD' || value === 'DD.MM.YYYY' || value === 'DD-MM-YYYY') {
                  setDateFormat(value);
                }
              }} className="w-full">
                <Select.Trigger className="w-full px-3 flex items-center justify-between">
                  <Select.Value />
                  <ChevronDown size={16} className="text-slate-400" />
                </Select.Trigger>
                <Select.Popover className="w-[var(--trigger-width)]">
                  <ListBox>
                    {DATE_FORMAT_OPTIONS.map((format) => (
                      <ListBox.Item key={format} id={format} className="pl-2">{format}</ListBox.Item>
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
        <h2 className="text-xl font-semibold mb-2 text-slate-100">{t('settings.weather')}</h2>
        <p className="text-slate-400 mb-4">{t('settings.weather.desc')}</p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.weather.stationId')}</label>
            <Input
              type="text"
              value={weatherStationId}
              onChange={(e) => {
                setWeatherStationId(e.target.value);
                setLastEditedWeatherField('stationId');
              }}
              placeholder="e.g. G543"
              className="w-full"
            />
            <p className="text-xs text-slate-500 mt-2">
              {t('settings.weather.stationLookupHint')}{' '}
              <a
                href="https://www.dwd.de/DE/leistungen/klimadatendeutschland/stationsliste.html"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:text-blue-300 underline"
              >
                {t('settings.weather.stationLookupLink')}
              </a>
              .
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.weather.location')}</label>
            <Input
              type="text"
              value={weatherLocation}
              onChange={(e) => {
                setWeatherLocation(e.target.value);
                setLastEditedWeatherField('city');
              }}
              placeholder={t('settings.weather.placeholder.location')}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.weather.gps')} (Lat)</label>
              <Input
                type="text"
                value={weatherLat}
                onChange={(e) => {
                  setWeatherLat(e.target.value);
                  setLastEditedWeatherField('coordinates');
                }}
                placeholder="52.5200"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">{t('settings.weather.gps')} (Lon)</label>
              <Input
                type="text"
                value={weatherLon}
                onChange={(e) => {
                  setWeatherLon(e.target.value);
                  setLastEditedWeatherField('coordinates');
                }}
                placeholder="13.4050"
                className="w-full"
              />
            </div>
          </div>
          {isResolvingWeather && (
            <p className="text-xs text-blue-400 mt-1">Resolving weather station…</p>
          )}
        </div>
      </div>

      {/* Save Button at the end */}
      <div className="flex justify-end">
        <Button
          type="button"
          isDisabled={isSaving}
          onClick={handleSave}
          className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:shadow-[0_0_15px_color-mix(in_srgb,var(--color-glow)_50%,transparent)] transition-all disabled:opacity-50"
        >
          {isSaving ? `${t('settings.save')}...` : t('settings.save')}
        </Button>
      </div>
    </div>
  );
}
