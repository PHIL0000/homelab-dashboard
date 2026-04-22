import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
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

// List all users. Only ADMIN can do this.
router.get('/', authenticate, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    const users = await prisma.user.findMany({
      include: { settings: true }
    });
    res.json(users.map((user: any) => toPublicUser(user)));
  } catch (error) {
    console.error("Error listing users:", error);
    res.status(500).json({ error: "Failed to list users" });
  }
});

// Create a new user. Only ADMIN can do this.
router.post('/', authenticate, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    const { username, firstName, lastName, email, password, role } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'USER';
    
    // Check if avatarUrl was provided in the body
    const { avatarUrl } = req.body;

    const user = await prisma.user.create({
      data: {
        username,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        passwordHash,
        role: userRole,
        avatarUrl: avatarUrl || null,
        settings: {
          create: {}
        }
      },
      include: { settings: true }
    });

    res.status(201).json(toPublicUser(user));
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user (Profile update). 
router.put('/:id', authenticate, async (req: any, res: any) => {
  try {
    const targetUserId = req.params.id;
    const {
      username,
      firstName,
      lastName,
      email,
      avatarUrl
    } = req.body;

    const settingsFields = ['dashboardName', 'timezone', 'timeFormat', 'dateFormat', 'pageVisibility', 'oledAccentRgb'];
    const hasSettingsPayload = settingsFields.some((field) => req.body[field] !== undefined);
    if (hasSettingsPayload) {
      return res.status(400).json({
        error: 'Settings fields moved to /api/user-settings/:id. Update profile data via /api/users/:id only.'
      });
    }
    
    // Only allow if user is updating themselves, or if the requester is an ADMIN
    if (req.user.userId !== targetUserId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden: You do not have permission to modify this user" });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(username !== undefined && { username }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(email !== undefined && { email }),
        ...(avatarUrl !== undefined && { avatarUrl })
      },
      include: { settings: true }
    });

    res.json(toPublicUser(updatedUser));
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user. Only ADMIN can do this, and cannot delete themselves.
router.delete('/:id', authenticate, async (req: any, res: any) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: "Forbidden: Admins only" });
    }
    const targetUserId = req.params.id;
    
    if (req.user.userId === targetUserId) {
      return res.status(400).json({ error: "You cannot delete yourself" });
    }

    await prisma.user.delete({
      where: { id: targetUserId }
    });

    res.json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
