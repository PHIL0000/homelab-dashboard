import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from './auth';

const router = Router();
const prisma: any = new PrismaClient();

const defaultSettings = {
	dashboardName: 'Homelab',
	timezone: 'Europe/Berlin',
	timeFormat: '24h',
	dateFormat: 'DD-MM-YYYY',
	pageVisibility: null,
	oledAccentRgb: null
};

const allowedPagePaths = new Set([
	'/dashboard',
	'/calendar',
	'/home-assistant',
	'/ai',
	'/documentation',
	'/storage',
	'/ai/chat',
	'/ai/image-gen',
	'/storage/nas',
	'/storage/nextcloud',
	'/storage/gitlab',
	'/documentation/overview',
	'/documentation/map',
	'/documentation/hardware',
	'/documentation/services',
	'/documentation/storage',
	'/documentation/docs',
	'/performance'
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return !!value && typeof value === 'object' && !Array.isArray(value);
};

const toPublicUser = (user: any) => ({
	id: user.id,
	username: user.username,
	firstName: user.firstName,
	lastName: user.lastName,
	email: user.email,
	avatarUrl: user.avatarUrl,
	role: user.role,
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
	dashboardName: user.settings?.dashboardName ?? defaultSettings.dashboardName,
	timezone: user.settings?.timezone ?? defaultSettings.timezone,
	timeFormat: user.settings?.timeFormat ?? defaultSettings.timeFormat,
	dateFormat: user.settings?.dateFormat ?? defaultSettings.dateFormat,
	pageVisibility: user.settings?.pageVisibility ?? defaultSettings.pageVisibility,
	oledAccentRgb: user.settings?.oledAccentRgb ?? defaultSettings.oledAccentRgb
});

const ensureCanAccessTargetUser = (req: any, targetUserId: string, res: any): boolean => {
	if (req.user.userId !== targetUserId && req.user.role !== 'ADMIN') {
		res.status(403).json({ error: 'Forbidden: You do not have permission to modify this user' });
		return false;
	}
	return true;
};

router.get('/:id', authenticate, async (req: any, res: any) => {
	try {
		const targetUserId = req.params.id;
		if (!ensureCanAccessTargetUser(req, targetUserId, res)) return;

		const user = await prisma.user.findUnique({
			where: { id: targetUserId },
			include: { settings: true }
		});

		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		return res.json(toPublicUser(user));
	} catch (error) {
		console.error('Error fetching user settings:', error);
		return res.status(500).json({ error: 'Failed to fetch user settings' });
	}
});

router.put('/:id', authenticate, async (req: any, res: any) => {
	try {
		const targetUserId = req.params.id;
		if (!ensureCanAccessTargetUser(req, targetUserId, res)) return;

		const {
			dashboardName,
			timezone,
			timeFormat,
			dateFormat,
			pageVisibility,
			oledAccentRgb
		} = req.body;

		const allowedTimeFormats = new Set(['12h', '24h']);
		const allowedDateFormats = new Set(['DD-MM-YYYY', 'MM-DD-YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY']);

		if (timeFormat !== undefined && !allowedTimeFormats.has(String(timeFormat))) {
			return res.status(400).json({ error: 'Invalid time format' });
		}

		if (dateFormat !== undefined && !allowedDateFormats.has(String(dateFormat))) {
			return res.status(400).json({ error: 'Invalid date format' });
		}

		let sanitizedPageVisibility: Record<string, boolean> | undefined;
		if (pageVisibility !== undefined) {
			if (!isPlainObject(pageVisibility)) {
				return res.status(400).json({ error: 'Invalid page visibility payload' });
			}

			sanitizedPageVisibility = {};
			for (const [key, value] of Object.entries(pageVisibility)) {
				if (!allowedPagePaths.has(key)) {
					return res.status(400).json({ error: `Invalid page path in visibility map: ${key}` });
				}
				if (typeof value !== 'boolean') {
					return res.status(400).json({ error: `Visibility for ${key} must be boolean` });
				}
				sanitizedPageVisibility[key] = value;
			}
		}

		let sanitizedOledAccentRgb: { r: number; g: number; b: number } | null | undefined;
		if (oledAccentRgb !== undefined) {
			if (oledAccentRgb === null) {
				sanitizedOledAccentRgb = null;
			} else if (isPlainObject(oledAccentRgb)) {
				const r = Number(oledAccentRgb.r);
				const g = Number(oledAccentRgb.g);
				const b = Number(oledAccentRgb.b);
				const isValid = [r, g, b].every((v) => Number.isInteger(v) && v >= 0 && v <= 255);
				if (!isValid) {
					return res.status(400).json({ error: 'oledAccentRgb must contain integer r,g,b values in range 0..255' });
				}
				sanitizedOledAccentRgb = { r, g, b };
			} else {
				return res.status(400).json({ error: 'Invalid oledAccentRgb payload' });
			}
		}

		const userExists = await prisma.user.findUnique({ where: { id: targetUserId }, select: { id: true } });
		if (!userExists) {
			return res.status(404).json({ error: 'User not found' });
		}

		await prisma.userSettings.upsert({
			where: { userId: targetUserId },
			update: {
				...(dashboardName !== undefined && { dashboardName }),
				...(timezone !== undefined && { timezone }),
				...(timeFormat !== undefined && { timeFormat }),
				...(dateFormat !== undefined && { dateFormat }),
				...(sanitizedPageVisibility !== undefined && { pageVisibility: sanitizedPageVisibility }),
				...(sanitizedOledAccentRgb !== undefined && { oledAccentRgb: sanitizedOledAccentRgb })
			},
			create: {
				userId: targetUserId,
				...(dashboardName !== undefined && { dashboardName }),
				...(timezone !== undefined && { timezone }),
				...(timeFormat !== undefined && { timeFormat }),
				...(dateFormat !== undefined && { dateFormat }),
				...(sanitizedPageVisibility !== undefined && { pageVisibility: sanitizedPageVisibility }),
				...(sanitizedOledAccentRgb !== undefined && { oledAccentRgb: sanitizedOledAccentRgb })
			}
		});

		const updatedUser = await prisma.user.findUnique({
			where: { id: targetUserId },
			include: { settings: true }
		});

		return res.json(toPublicUser(updatedUser));
	} catch (error) {
		console.error('Error updating user settings:', error);
		return res.status(500).json({ error: 'Failed to update user settings' });
	}
});

export default router;
