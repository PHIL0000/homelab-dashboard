import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma: any = new PrismaClient();

// GET /api/settings - get settings (create default if missing)
router.get('/', async (req, res) => {
  try {
    let settings = await prisma.instanceSettings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      settings = await prisma.instanceSettings.create({
        data: {
          id: 1,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - update settings
router.put('/', async (req, res) => {
  try {
    const { haDomain } = req.body;

    const settings = await prisma.instanceSettings.upsert({
      where: { id: 1 },
      update: {
        ...(haDomain !== undefined && { haDomain }),
      },
      create: {
        id: 1,
        haDomain: haDomain ?? 'https://homeassistant.local:8123',
      },
    });

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
