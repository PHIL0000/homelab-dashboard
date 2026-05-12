import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { authenticate, consumeEmailVerification } from './auth';

const router = Router();
const prisma: any = new PrismaClient();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeEmail = (email: string) => email.trim().toLowerCase();

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
  emailVerified: user.emailVerified,
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
    const { username, firstName, lastName, email, password, role, emailVerificationToken } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    if (username.length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    let emailVerified = false;
    let normalizedEmail: string | null = null;
    if (email) {
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      normalizedEmail = normalizeEmail(email);
      if (!emailVerificationToken) {
        return res.status(400).json({ error: 'Email must be verified before account creation' });
      }
      const ok = await consumeEmailVerification(normalizedEmail, emailVerificationToken);
      if (!ok) {
        return res.status(400).json({ error: 'Email verification token is invalid or expired' });
      }
      emailVerified = true;
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
        email: normalizedEmail,
        emailVerified,
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
      avatarUrl,
      emailVerificationToken
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

    // If the email is changing, require a fresh OTP verification for the new value.
    let emailUpdate: { email: string | null; emailVerified: boolean } | null = null;
    if (email !== undefined) {
      const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (!existing) return res.status(404).json({ error: 'User not found' });

      const normalizedNew = email ? normalizeEmail(email) : null;
      const currentEmail = existing.email ? normalizeEmail(existing.email) : null;

      if (normalizedNew !== currentEmail) {
        if (normalizedNew === null) {
          emailUpdate = { email: null, emailVerified: false };
        } else {
          if (!EMAIL_RE.test(normalizedNew)) {
            return res.status(400).json({ error: 'Invalid email format' });
          }
          if (!emailVerificationToken) {
            return res.status(400).json({ error: 'Email must be verified before it can be changed' });
          }
          const ok = await consumeEmailVerification(normalizedNew, emailVerificationToken);
          if (!ok) {
            return res.status(400).json({ error: 'Email verification token is invalid or expired' });
          }
          emailUpdate = { email: normalizedNew, emailVerified: true };
        }
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        ...(username !== undefined && { username }),
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(emailUpdate !== null && emailUpdate),
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
