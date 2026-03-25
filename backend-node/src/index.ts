import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const port = 3001; // Backend on 3001

app.use(cors());
app.use(express.json());

// Routes
// GET /settings - get settings (create default if missing)
app.get('/settings', async (req, res) => {
  try {
    let settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });
    
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,
        },
      });
    }

    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /settings - update settings
app.put('/settings', async (req, res) => {
  try {
    const { theme, language, haDomain } = req.body;
    
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        ...(theme !== undefined && { theme }),
        ...(language !== undefined && { language }),
        ...(haDomain !== undefined && { haDomain }),
      },
      create: {
        id: 1,
        theme: theme ?? "midnight",
        language: language ?? "de",
        haDomain: haDomain ?? "https://ha.hlphil.de/wall-tablet/home",
      },
    });

    res.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

app.listen(port, () => {
  console.log(`Backend is running on http://localhost:${port}`);
});