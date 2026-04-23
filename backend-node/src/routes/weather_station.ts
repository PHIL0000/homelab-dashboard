import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from './auth';

const router = Router();
const prisma: any = new PrismaClient();

const DWD_STATION_LIST_URL = 'https://www.dwd.de/DE/leistungen/klimadatendeutschland/statliste/statlex_rich.txt?view=nasPublication&nn=16102';
const WEATHER_STATION_DEBUG = process.env.WEATHER_STATION_DEBUG === 'true';

const countReplacementChars = (value: string): number => (value.match(/�/g) ?? []).length;
const countRegexMatches = (value: string, pattern: RegExp): number => (value.match(pattern) ?? []).length;

const MOJIBAKE_PATTERNS: RegExp[] = [
  /Ã¤/g,
  /Ã¶/g,
  /Ã¼/g,
  /Ã„/g,
  /Ã–/g,
  /Ãœ/g,
  /ÃŸ/g,
  /Â/g,
  /â€“/g,
  /â€”/g,
  /â€ž/g,
  /â€œ/g,
  /â€/g
];

const decodeWithCharset = (bytes: Uint8Array, charset: string): string => {
  return new TextDecoder(charset, { fatal: false }).decode(bytes);
};

const scoreDecodedText = (value: string): number => {
  const replacementPenalty = countReplacementChars(value) * 100;
  const mojibakePenalty = MOJIBAKE_PATTERNS.reduce((acc, pattern) => acc + countRegexMatches(value, pattern), 0) * 15;
  return replacementPenalty + mojibakePenalty;
};

const decodeDwdResponseText = (bytes: Uint8Array, contentTypeHeader: string | null): { text: string; charset: string; score: number } => {
  const contentType = contentTypeHeader ?? '';
  const charsetMatch = contentType.match(/charset=([^;\s]+)/i);
  const headerCharset = charsetMatch?.[1]?.trim().toLowerCase();

  const candidates: Array<{ text: string; charset: string; score: number }> = [];

  const tryAddCandidate = (charset: string) => {
    try {
      const text = decodeWithCharset(bytes, charset);
      candidates.push({ text, charset, score: scoreDecodedText(text) });
    } catch {
      // Ignore unsupported/invalid charsets.
    }
  };

  if (headerCharset) {
    tryAddCandidate(headerCharset);
  }

  tryAddCandidate('utf-8');
  tryAddCandidate('windows-1252');
  tryAddCandidate('latin1');

  if (candidates.length === 0) {
    const fallbackText = new TextDecoder().decode(bytes);
    return { text: fallbackText, charset: 'default', score: scoreDecodedText(fallbackText) };
  }

  candidates.sort((a, b) => a.score - b.score);
  return candidates[0];
};

const logDecodingPreview = (raw: string, charset: string, score: number, stationCount: number) => {
  if (!WEATHER_STATION_DEBUG) return;

  const lines = raw.split(/\r?\n/);
  const suspiciousLines = lines
    .filter((line) => line.includes('Köln') || line.includes('Koeln') || line.includes('KÃ¶ln') || line.includes('�') || /Ã[a-zA-Z]/.test(line))
    .slice(0, 8);

  console.log('[weather-station] DWD decode debug:', {
    charset,
    score,
    totalLines: lines.length,
    stationCount,
    suspiciousLines
  });
};

type DwdStation = {
  name: string;
  internalId: string;
  type: string;
  stationId: string;
  latitude: number;
  longitude: number;
};

const parseDecimal = (value: string): number => Number(value.replace(',', '.'));

const normalizeStationId = (value: string): string => {
  const numeric = value.trim().replace(/\D/g, '');
  return numeric.replace(/^0+(?=\d)/, '');
};

const parseLineWithRegex = (line: string): DwdStation | null => {
  const match = line.match(/^(.*?)\s+(\d+)\s+([A-Z]{2,3})\s+(\d{3,5})\s+(-?\d+(?:[.,]\d+)?)\s+(-?\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  const [, name, internalId, type, stationId, latRaw, lonRaw] = match;
  const latitude = parseDecimal(latRaw);
  const longitude = parseDecimal(lonRaw);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    name: name.trim(),
    internalId,
    type,
    stationId,
    latitude,
    longitude
  };
};

const parseLineWithTokens = (line: string): DwdStation | null => {
  const parts = line.trim().split(/\s{2,}|\t+/).filter(Boolean);
  if (parts.length < 6) return null;

  const [name, internalId, type, stationIdRaw, latRaw, lonRaw] = parts;
  if (!/^\d+$/.test(internalId)) return null;
  if (!/^[A-Z]{2,3}$/.test(type)) return null;
  if (!/^\d{3,5}$/.test(stationIdRaw)) return null;

  const latitude = parseDecimal(latRaw);
  const longitude = parseDecimal(lonRaw);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  return {
    name: name.trim(),
    internalId,
    type,
    stationId: stationIdRaw,
    latitude,
    longitude
  };
};

const parseDwdStationList = (raw: string): DwdStation[] => {
  const lines = raw.split(/\r?\n/);
  const stations: DwdStation[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parsed = parseLineWithRegex(line) ?? parseLineWithTokens(line);
    if (!parsed) continue;

    stations.push(parsed);
  }

  return stations;
};

const getDwdStations = async (): Promise<DwdStation[]> => {
  const response = await fetch(DWD_STATION_LIST_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch DWD station list (${response.status})`);
  }

  const rawBytes = new Uint8Array(await response.arrayBuffer());
  const decoded = decodeDwdResponseText(rawBytes, response.headers.get('content-type'));
  const raw = decoded.text;
  const stations = parseDwdStationList(raw);

  logDecodingPreview(raw, decoded.charset, decoded.score, stations.length);

  if (stations.length === 0) {
    throw new Error('DWD station list parsing returned no stations');
  }

  return stations;
};

const haversineDistanceKm = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number
): number => {
  const toRadians = (value: number) => (value * Math.PI) / 180;

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(latitudeB - latitudeA);
  const deltaLon = toRadians(longitudeB - longitudeA);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(latitudeA)) * Math.cos(toRadians(latitudeB)) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const normalizeStationPayload = (body: any) => {
  const city = typeof body.city === 'string' && body.city.trim() ? body.city.trim() : undefined;
  const stationId = typeof body.stationId === 'string' && body.stationId.trim() ? body.stationId.trim() : undefined;

  const latitude = body.latitude === undefined || body.latitude === null || body.latitude === ''
    ? undefined
    : Number(body.latitude);
  const longitude = body.longitude === undefined || body.longitude === null || body.longitude === ''
    ? undefined
    : Number(body.longitude);

  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  return {
    city,
    stationId,
    latitude: hasCoordinates ? latitude : undefined,
    longitude: hasCoordinates ? longitude : undefined
  };
};

const normalizeCityText = (value: string): string => {
  return value
    .trim()
    .toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const buildCitySearchVariants = (value: string): string[] => {
  const normalized = normalizeCityText(value);
  if (!normalized) return [];

  const simplified = normalized
    .replace(/ae/g, 'a')
    .replace(/oe/g, 'o')
    .replace(/ue/g, 'u');

  return Array.from(new Set([normalized, simplified]));
};

const findMatchingStation = (stations: DwdStation[], payload: { city?: string; stationId?: string; latitude?: number; longitude?: number }) => {
  if (payload.stationId) {
    const normalizedInput = normalizeStationId(payload.stationId);
    const byStationId = stations.find((station) => {
      if (station.stationId === payload.stationId?.trim()) return true;
      return normalizeStationId(station.stationId) === normalizedInput;
    });

    if (!byStationId) {
      throw Object.assign(new Error('No DWD station found for provided stationId'), { statusCode: 404 });
    }
    return byStationId;
  }

  if (payload.latitude !== undefined && payload.longitude !== undefined) {
    const exactCoordinateMatch = stations.find(
      (station) =>
        Math.abs(station.latitude - payload.latitude!) <= 0.0005 &&
        Math.abs(station.longitude - payload.longitude!) <= 0.0005
    );

    if (exactCoordinateMatch) {
      return exactCoordinateMatch;
    }

    let nearest = stations[0];
    let minDistance = haversineDistanceKm(payload.latitude, payload.longitude, nearest.latitude, nearest.longitude);

    for (const station of stations.slice(1)) {
      const distance = haversineDistanceKm(payload.latitude, payload.longitude, station.latitude, station.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = station;
      }
    }

    return nearest;
  }

  if (payload.city) {
    const needleVariants = buildCitySearchVariants(payload.city);
    const byExactCity = stations.find((station) => {
      const hayVariants = buildCitySearchVariants(station.name);
      return hayVariants.some((hay) => needleVariants.includes(hay));
    });

    if (byExactCity) {
      return byExactCity;
    }

    const byCity = stations.find((station) => {
      const hayVariants = buildCitySearchVariants(station.name);
      return hayVariants.some((hay) => needleVariants.some((needle) => hay.includes(needle) || needle.includes(hay)));
    });

    if (!byCity) {
      throw Object.assign(new Error('No DWD station found for provided city'), { statusCode: 404 });
    }
    return byCity;
  }

  throw Object.assign(
    new Error('Provide at least one of stationId, latitude+longitude, or city'),
    { statusCode: 400 }
  );
};

const toWeatherStationResponse = (station: DwdStation) => ({
  city: station.name,
  latitude: station.latitude,
  longitude: station.longitude,
  stationId: station.stationId
});

// GET /api/settings/weather-station
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const weatherStation = await prisma.weatherStation.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        city: true,
        latitude: true,
        longitude: true,
        stationId: true
      }
    });

    if (!weatherStation) {
      return res.json({ city: '', latitude: null, longitude: null, stationId: '' });
    }

    return res.json(weatherStation);
  } catch (error) {
    console.error('Error fetching weather station:', error);
    return res.status(500).json({ error: 'Failed to fetch weather station' });
  }
});

// POST /api/settings/weather-station/resolve
router.post('/resolve', authenticate, async (req: any, res: any) => {
  try {
    const payload = normalizeStationPayload(req.body);
    const stations = await getDwdStations();
    const matchedStation = findMatchingStation(stations, payload);
    return res.json(toWeatherStationResponse(matchedStation));
  } catch (error: any) {
    const statusCode = Number(error?.statusCode) || 500;
    const errorMessage = statusCode >= 500 ? 'Failed to resolve weather station' : error.message;
    console.error('Error resolving weather station:', error);
    return res.status(statusCode).json({ error: errorMessage });
  }
});

// POST /api/settings/weather-station
router.post('/', authenticate, async (req: any, res: any) => {
  try {
    const payload = normalizeStationPayload(req.body);
    const stations = await getDwdStations();
    const matchedStation = findMatchingStation(stations, payload);

    const resolvedStation = toWeatherStationResponse(matchedStation);

    const saved = await prisma.weatherStation.upsert({
      where: { stationId: matchedStation.stationId },
      update: {
        city: resolvedStation.city,
        latitude: resolvedStation.latitude,
        longitude: resolvedStation.longitude
      },
      create: {
        stationId: resolvedStation.stationId,
        city: resolvedStation.city,
        latitude: resolvedStation.latitude,
        longitude: resolvedStation.longitude
      },
      select: {
        city: true,
        latitude: true,
        longitude: true,
        stationId: true
      }
    });

    await prisma.weatherStation.deleteMany({
      where: { stationId: { not: matchedStation.stationId } }
    });

    return res.json(saved);
  } catch (error: any) {
    const statusCode = Number(error?.statusCode) || 500;
    const errorMessage = statusCode >= 500 ? 'Failed to resolve and save weather station' : error.message;
    console.error('Error upserting weather station:', error);
    return res.status(statusCode).json({ error: errorMessage });
  }
});

export default router;
