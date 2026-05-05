import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from './auth';

const router = Router();
const prisma: any = new PrismaClient();



// GET /api/settings/weather-station
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    const weatherStation = await prisma.weatherStation.findFirst({
      orderBy: { updatedAt: 'desc' },
      select: {
        city: true,
        latitude: true,
        longitude: true
      }
    });
    if (!weatherStation) {
      return res.json({ city: '', latitude: null, longitude: null });
    }
    return res.json(weatherStation);
  } catch (error) {
    console.error('Error fetching weather station:', error);
    return res.status(500).json({ error: 'Failed to fetch weather station' });
  }
});



// POST /api/settings/weather-station
router.post('/', authenticate, async (req: any, res: any) => {
  try {
    const { city, latitude, longitude } = req.body;
    if (!city || typeof city !== 'string' || !city.trim() ||
        typeof latitude !== 'number' || typeof longitude !== 'number' ||
        !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return res.status(400).json({ error: 'Invalid city, latitude, or longitude' });
    }
    // Only one row allowed: if exists, update; else, create
    const existing = await prisma.weatherStation.findFirst({ select: { id: true } });
    let saved;
    if (existing) {
      saved = await prisma.weatherStation.update({
        where: { id: existing.id },
        data: { city: city.trim(), latitude, longitude },
        select: { city: true, latitude: true, longitude: true }
      });
    } else {
      saved = await prisma.weatherStation.create({
        data: { city: city.trim(), latitude, longitude },
        select: { city: true, latitude: true, longitude: true }
      });
    }
    // Optionally delete all but the latest row
    if (saved && saved.id) {
      await prisma.weatherStation.deleteMany({ where: { id: { not: saved.id } } });
    }
    return res.json(saved);
  } catch (error: any) {
    console.error('Error upserting weather station:', error);
    return res.status(500).json({ error: 'Failed to save weather station' });
  }
});

export default router;
