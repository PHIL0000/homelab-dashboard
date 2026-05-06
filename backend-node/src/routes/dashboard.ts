import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from './auth';

const router = Router();
const prisma: any = new PrismaClient();

// POST /sync-widgets — called by frontend on startup to upsert CardTypes from the widget registry
router.post('/sync-widgets', authenticate, async (req: any, res: any) => {
  const { widgets } = req.body;
  if (!Array.isArray(widgets)) {
    return res.status(400).json({ error: 'widgets must be an array' });
  }

  for (const w of widgets) {
    await prisma.cardType.upsert({
      where: { key: w.key },
      update: {
        name: w.name,
        description: w.description ?? null,
        icon: w.icon ?? null,
        configSchema: {
          defaultW: w.defaultW,
          defaultH: w.defaultH,
          minW: w.minW ?? null,
          minH: w.minH ?? null,
          defaultConfig: w.defaultConfig ?? {},
        },
      },
      create: {
        key: w.key,
        name: w.name,
        description: w.description ?? null,
        icon: w.icon ?? null,
        configSchema: {
          defaultW: w.defaultW,
          defaultH: w.defaultH,
          minW: w.minW ?? null,
          minH: w.minH ?? null,
          defaultConfig: w.defaultConfig ?? {},
        },
      },
    });
  }

  res.json({ synced: widgets.length });
});

// GET /widget-types — list all registered CardTypes
router.get('/widget-types', authenticate, async (_req: any, res: any) => {
  const cardTypes = await prisma.cardType.findMany({ orderBy: { name: 'asc' } });
  res.json(cardTypes);
});

// GET /page/:page — get the user's dashboard for a given page
router.get('/page/:page', authenticate, async (req: any, res: any) => {
  const { page } = req.params;
  const userId = req.user.userId;

  const dashboard = await prisma.userDashboard.findUnique({
    where: { userId_page: { userId, page } },
    include: {
      widgetLinks: {
        include: {
          widget: { include: { cardType: true } },
        },
      },
    },
  });

  if (!dashboard) return res.json(null);

  res.json({
    id: dashboard.id,
    page: dashboard.page,
    layout: dashboard.layout ?? [],
    widgets: dashboard.widgetLinks.map((link: any) => ({
      id: link.widget.id,
      cardTypeKey: link.widget.cardType.key,
      customTitle: link.widget.customTitle,
      config: link.widget.config ?? {},
    })),
  });
});

// PUT /page/:page/layout — save the current layout
router.put('/page/:page/layout', authenticate, async (req: any, res: any) => {
  const { page } = req.params;
  const { layout } = req.body;
  const userId = req.user.userId;

  await prisma.userDashboard.upsert({
    where: { userId_page: { userId, page } },
    update: { layout },
    create: { userId, page, layout },
  });

  res.json({ ok: true });
});

// POST /page/:page/widgets — add a widget instance to the dashboard
router.post('/page/:page/widgets', authenticate, async (req: any, res: any) => {
  const { page } = req.params;
  const { cardTypeKey, customTitle, config } = req.body;
  const userId = req.user.userId;

  const cardType = await prisma.cardType.findUnique({ where: { key: cardTypeKey } });
  if (!cardType) return res.status(404).json({ error: 'CardType not found' });

  const schema = (cardType.configSchema ?? {}) as any;

  // Ensure dashboard exists
  let dashboard = await prisma.userDashboard.findUnique({
    where: { userId_page: { userId, page } },
  });
  if (!dashboard) {
    dashboard = await prisma.userDashboard.create({
      data: { userId, page, layout: [] },
    });
  }

  const widget = await prisma.widget.create({
    data: {
      cardTypeId: cardType.id,
      customTitle: customTitle ?? null,
      config: config ?? schema.defaultConfig ?? {},
    },
  });

  await prisma.dashboardWidget.create({
    data: { userDashboardId: dashboard.id, widgetId: widget.id },
  });

  const currentLayout: any[] = Array.isArray(dashboard.layout) ? dashboard.layout : [];
  const newItem = {
    i: widget.id,
    x: 0,
    y: Infinity, // react-grid-layout places it at the bottom
    w: schema.defaultW ?? 3,
    h: schema.defaultH ?? 3,
    minW: schema.minW ?? undefined,
    minH: schema.minH ?? undefined,
  };

  await prisma.userDashboard.update({
    where: { id: dashboard.id },
    data: { layout: [...currentLayout, newItem] },
  });

  res.json({
    id: widget.id,
    cardTypeKey,
    customTitle: widget.customTitle,
    config: widget.config,
    layoutItem: newItem,
  });
});

// PUT /widgets/:widgetId — update a widget's config
router.put('/widgets/:widgetId', authenticate, async (req: any, res: any) => {
  const { widgetId } = req.params;
  const { config, customTitle } = req.body;
  const userId = req.user.userId;

  const link = await prisma.dashboardWidget.findFirst({
    where: { widgetId, userDashboard: { userId } },
  });
  if (!link) return res.status(404).json({ error: 'Widget not found' });

  const updated = await prisma.widget.update({
    where: { id: widgetId },
    data: {
      ...(config !== undefined ? { config } : {}),
      ...(customTitle !== undefined ? { customTitle } : {}),
    },
  });

  res.json({ id: updated.id, config: updated.config, customTitle: updated.customTitle });
});

// DELETE /widgets/:widgetId — remove a widget from the dashboard
router.delete('/widgets/:widgetId', authenticate, async (req: any, res: any) => {
  const { widgetId } = req.params;
  const userId = req.user.userId;

  const link = await prisma.dashboardWidget.findFirst({
    where: { widgetId, userDashboard: { userId } },
    include: { userDashboard: true },
  });

  if (!link) return res.status(404).json({ error: 'Widget not found' });

  const currentLayout: any[] = Array.isArray(link.userDashboard.layout)
    ? link.userDashboard.layout
    : [];

  await prisma.userDashboard.update({
    where: { id: link.userDashboardId },
    data: { layout: currentLayout.filter((item: any) => item.i !== widgetId) },
  });

  await prisma.dashboardWidget.delete({ where: { id: link.id } });
  await prisma.widget.delete({ where: { id: widgetId } });

  res.json({ ok: true });
});

export default router;
