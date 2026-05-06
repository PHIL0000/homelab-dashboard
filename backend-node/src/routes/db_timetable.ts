import { Router } from 'express';
import { authenticate } from './auth';
import { parseStringPromise } from 'xml2js';

const router = Router();

const TIMETABLE_URL = 'https://apis.deutschebahn.com/db-api-marketplace/apis/timetables/v1';
const STADA_URL = 'https://apis.deutschebahn.com/db-api-marketplace/apis/station-data/v2/stations';

function dbHeaders(): Record<string, string> {
  return {
    'DB-Client-Id': process.env.DB_CLIENT_ID?.trim() || '',
    'DB-Api-Key':   process.env.DB_CLIENT_SECRET?.trim() || '',
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Parse DB compact time format: YYMMDDhhmm → Date (local time)
function parseDbTime(s: string): Date | null {
  if (!s || s.length !== 10) return null;
  const year  = 2000 + parseInt(s.slice(0, 2), 10);
  const month = parseInt(s.slice(2, 4), 10) - 1;
  const day   = parseInt(s.slice(4, 6), 10);
  const hour  = parseInt(s.slice(6, 8), 10);
  const min   = parseInt(s.slice(8, 10), 10);
  return new Date(year, month, day, hour, min);
}

function fmtTime(dbTime: string | null): string | null {
  const d = parseDbTime(dbTime || '');
  if (!d) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Format Date → YYMMDD for the plan endpoint
function fmtDate(d: Date): string {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

function hourSlot(base: Date, offsetHours: number): { date: string; hour: string } {
  const d = new Date(base);
  d.setHours(d.getHours() + offsetHours);
  return { date: fmtDate(d), hour: String(d.getHours()).padStart(2, '0') };
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

async function fetchPlanXml(evaNo: string, date: string, hour: string): Promise<any> {
  const url = `${TIMETABLE_URL}/plan/${evaNo}/${date}/${hour}`;
  const res = await fetch(url, { headers: { ...dbHeaders(), Accept: 'application/xml' } });
  if (!res.ok) return null;
  return parseStringPromise(await res.text(), { explicitArray: false, mergeAttrs: true });
}

async function fetchChanges(evaNo: string): Promise<Map<string, any>> {
  const url = `${TIMETABLE_URL}/fchg/${evaNo}`;
  const res = await fetch(url, { headers: { ...dbHeaders(), Accept: 'application/xml' } });
  const map = new Map<string, any>();
  if (!res.ok) return map;
  const parsed = await parseStringPromise(await res.text(), { explicitArray: false, mergeAttrs: true });
  for (const s of toArray(parsed?.timetable?.s)) {
    map.set(s.id, s);
  }
  return map;
}

// ─── Route: Station search ───────────────────────────────────────────────────
// Uses the subscribed StaDa API. searchstring requires wildcard syntax: *query*

router.get('/stations', authenticate, async (req: any, res: any) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (q.length < 2) return res.json({ stations: [] });

  try {
    const apiRes = await fetch(
      `${STADA_URL}?searchstring=*${encodeURIComponent(q)}*`,
      { headers: dbHeaders() },
    );
    if (!apiRes.ok) throw new Error(`StaDa API: HTTP ${apiRes.status}`);

    const data = await apiRes.json() as any;
    const stations = toArray(data?.result)
      .map((s: any) => {
        const mainEva = toArray(s.evaNumbers).find((e: any) => e.isMain) ?? toArray(s.evaNumbers)[0];
        if (!mainEva?.number) return null;
        return { name: s.name as string, evaNo: String(mainEva.number) };
      })
      .filter(Boolean)
      .slice(0, 10);

    res.json({ stations });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Route: Timetable ────────────────────────────────────────────────────────
// GET /api/db/timetable?evaNo=8000096&destName=Mannheim%20Hbf

router.get('/timetable', authenticate, async (req: any, res: any) => {
  const evaNo    = typeof req.query.evaNo    === 'string' ? req.query.evaNo.trim() : '';
  const destName = typeof req.query.destName === 'string' ? req.query.destName.trim().toLowerCase() : '';

  if (!evaNo) return res.status(400).json({ error: 'evaNo is required' });

  const clientId = process.env.DB_CLIENT_ID?.trim();
  if (!clientId) return res.status(503).json({ error: 'DB_CLIENT_ID ist nicht in .env gesetzt' });

  try {
    const now   = new Date();
    const slots = [hourSlot(now, 0), hourSlot(now, 1), hourSlot(now, 2)];

    const [p0, p1, p2] = await Promise.all(
      slots.map(({ date, hour }) => fetchPlanXml(evaNo, date, hour)),
    );
    const changes = await fetchChanges(evaNo);

    const rawStops: any[] = [];
    let stationName = '';
    for (const plan of [p0, p1, p2]) {
      if (!plan?.timetable) continue;
      if (!stationName) stationName = plan.timetable.station || '';
      rawStops.push(...toArray(plan.timetable.s));
    }

    const trains: any[] = [];

    for (const stop of rawStops) {
      const dp = stop.dp;
      if (!dp) continue; // departures only

      const tl    = stop.tl || {};
      const chDp  = (changes.get(stop.id) || {}).dp || {};

      const plannedTime = dp.pt   || null;
      const changedTime = chDp.ct || null;
      const actualTime  = changedTime || plannedTime;
      const actualDate  = parseDbTime(actualTime || '');

      // Skip trains that departed more than 1 minute ago
      if (actualDate && actualDate.getTime() < Date.now() - 60_000) continue;

      // Delay in minutes
      let delayMinutes: number | null = null;
      if (plannedTime && changedTime) {
        const pt = parseDbTime(plannedTime);
        const ct = parseDbTime(changedTime);
        if (pt && ct) delayMinutes = Math.round((ct.getTime() - pt.getTime()) / 60_000);
      }

      // Future stops path
      const pathStr = chDp.cpth || dp.ppth || '';
      const path: string[] = pathStr ? pathStr.split('|').map((s: string) => s.trim()) : [];
      const finalDest      = path.length > 0 ? path[path.length - 1] : null;

      // Origin (first stop from arrival path)
      const arPath: string[] = (stop.ar?.ppth || '').split('|').filter(Boolean).map((s: string) => s.trim());
      const origin           = arPath.length > 0 ? arPath[0] : null;

      // Filter by destination when A→B mode
      if (destName) {
        const matches = path.some(
          (p) => p.toLowerCase().includes(destName) || destName.includes(p.toLowerCase()),
        );
        if (!matches) continue;
      }

      const destLabel = destName
        ? (path.find((p) => p.toLowerCase().includes(destName) || destName.includes(p.toLowerCase())) ?? finalDest)
        : finalDest;

      trains.push({
        id:          stop.id,
        category:    tl.c || '',
        trainNo:     tl.n || '',
        line:        dp.l || tl.n || '',
        plannedDep:  fmtTime(plannedTime),
        actualDep:   fmtTime(actualTime),
        delayMinutes,
        platform:    chDp.cp || dp.pp || null,
        destination: destLabel,
        origin,
        path,
        cancelled:   chDp.cs === 'c' || chDp.clt != null,
      });
    }

    // Sort by planned departure, return first 5
    trains.sort((a, b) => {
      const ta = parseDbTime(rawStops.find((s: any) => s.id === a.id)?.dp?.pt || '')?.getTime() ?? 0;
      const tb = parseDbTime(rawStops.find((s: any) => s.id === b.id)?.dp?.pt || '')?.getTime() ?? 0;
      return ta - tb;
    });

    res.json({ stationName, trains: trains.slice(0, 5) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
