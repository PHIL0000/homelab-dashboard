import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  isMailConfigured,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from '../services/mail';

declare global {
  // eslint-disable-next-line no-var
  var prismaAuthRoute: PrismaClient | undefined;
}

const globalForPrisma = globalThis as typeof globalThis & {
  prismaAuthRoute?: PrismaClient;
};

const router = Router();
const prisma: any = globalForPrisma.prismaAuthRoute ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaAuthRoute = prisma;
}
const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable must be set');
}

const JWT_SECRET = jwtSecret;

const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
const hashCode = (code: string) =>
  crypto.createHash('sha256').update(code).digest('hex');
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
  role: user.role,
  avatarUrl: user.avatarUrl,
  dashboardName: user.settings?.dashboardName ?? defaultSettings.dashboardName,
  timezone: user.settings?.timezone ?? defaultSettings.timezone,
  timeFormat: user.settings?.timeFormat ?? defaultSettings.timeFormat,
  dateFormat: user.settings?.dateFormat ?? defaultSettings.dateFormat,
  pageVisibility: user.settings?.pageVisibility ?? defaultSettings.pageVisibility,
  oledAccentRgb: user.settings?.oledAccentRgb ?? defaultSettings.oledAccentRgb
});

// Verifies that {email, token} was minted by /auth/email/verify, hasn't expired,
// and consumes it. Returns true on success.
export const consumeEmailVerification = async (
  email: string,
  token: string
): Promise<boolean> => {
  const normalized = normalizeEmail(email);
  const record = await prisma.emailVerification.findUnique({
    where: { email: normalized }
  });
  if (!record || !record.consumeToken || !record.verifiedAt) return false;
  if (record.consumeToken !== token) return false;
  if (record.expiresAt.getTime() < Date.now()) {
    await prisma.emailVerification.delete({ where: { email: normalized } });
    return false;
  }
  await prisma.emailVerification.delete({ where: { email: normalized } });
  return true;
};

// Check if initial setup is needed (i.e. no users exist)
router.get('/setup-status', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    res.json({ needsSetup: userCount === 0 });
  } catch (error) {
    console.error("Error checking setup status:", error);
    res.status(500).json({ error: "Failed to check setup status" });
  }
});

// Send a fresh OTP to the given email. Overwrites any previous pending code.
router.post('/email/request-verification', async (req, res) => {
  try {
    const rawEmail = (req.body?.email || '').toString();
    if (!rawEmail || !EMAIL_RE.test(rawEmail)) {
      return res.status(400).json({ error: 'A valid email is required' });
    }
    if (!isMailConfigured()) {
      return res.status(503).json({
        error: 'Email verification is unavailable: SMTP is not configured on the server.'
      });
    }

    const email = normalizeEmail(rawEmail);

    // Reject if another user already owns this verified email
    const existingUser = await prisma.user.findFirst({
      where: { email, emailVerified: true }
    });
    if (existingUser) {
      return res.status(409).json({ error: 'This email is already in use.' });
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

    await prisma.emailVerification.upsert({
      where: { email },
      update: {
        codeHash: hashCode(code),
        expiresAt,
        attempts: 0,
        verifiedAt: null,
        consumeToken: null
      },
      create: {
        email,
        codeHash: hashCode(code),
        expiresAt
      }
    });

    await sendVerificationEmail(email, code, OTP_TTL_MINUTES);
    res.json({ ok: true, expiresInMinutes: OTP_TTL_MINUTES });
  } catch (error: any) {
    console.error('Error requesting email verification:', error);
    res.status(500).json({ error: error?.message || 'Failed to send verification code' });
  }
});

// Verify the OTP and return a one-shot token to be passed to setup/create/update.
router.post('/email/verify', async (req, res) => {
  try {
    const rawEmail = (req.body?.email || '').toString();
    const code = (req.body?.code || '').toString().trim();
    if (!rawEmail || !EMAIL_RE.test(rawEmail) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid email or code' });
    }

    const email = normalizeEmail(rawEmail);
    const record = await prisma.emailVerification.findUnique({ where: { email } });
    if (!record) return res.status(400).json({ error: 'No verification pending for this email' });

    if (record.expiresAt.getTime() < Date.now()) {
      await prisma.emailVerification.delete({ where: { email } });
      return res.status(400).json({ error: 'Code expired. Request a new one.' });
    }
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.emailVerification.delete({ where: { email } });
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }

    if (record.codeHash !== hashCode(code)) {
      await prisma.emailVerification.update({
        where: { email },
        data: { attempts: { increment: 1 } }
      });
      return res.status(400).json({ error: 'Incorrect code' });
    }

    const consumeToken = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerification.update({
      where: { email },
      data: { verifiedAt: new Date(), consumeToken }
    });

    res.json({ ok: true, token: consumeToken });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

// Start a password reset for a user (identified by username or email).
// Always returns 200 to avoid leaking which accounts exist.
router.post('/forgot-password', async (req, res) => {
  try {
    const identifier = (req.body?.identifier || '').toString().trim();
    if (!identifier) {
      return res.status(400).json({ error: 'Username or email is required' });
    }
    if (!isMailConfigured()) {
      return res.status(503).json({
        error: 'Password reset is unavailable: SMTP is not configured on the server.'
      });
    }

    const lookup = identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lookup },
          { username: identifier }
        ]
      }
    });

    if (user?.email && user.emailVerified) {
      const code = generateOtp();
      const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);

      await prisma.passwordReset.deleteMany({ where: { userId: user.id } });
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          codeHash: hashCode(code),
          expiresAt
        }
      });
      try {
        await sendPasswordResetEmail(user.email, code, OTP_TTL_MINUTES);
      } catch (err) {
        console.error('Failed to send password reset email:', err);
      }
    }

    res.json({ ok: true, expiresInMinutes: OTP_TTL_MINUTES });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to start password reset' });
  }
});

// Consume a password-reset code and set a new password.
router.post('/reset-password', async (req, res) => {
  try {
    const identifier = (req.body?.identifier || '').toString().trim();
    const code = (req.body?.code || '').toString().trim();
    const newPassword = (req.body?.newPassword || '').toString();

    if (!identifier || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Invalid request' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters' });
    }

    const lookup = identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lookup },
          { username: identifier }
        ]
      }
    });
    if (!user) return res.status(400).json({ error: 'Invalid code' });

    const reset = await prisma.passwordReset.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
    if (!reset) return res.status(400).json({ error: 'Invalid code' });

    if (reset.expiresAt.getTime() < Date.now()) {
      await prisma.passwordReset.delete({ where: { id: reset.id } });
      return res.status(400).json({ error: 'Code expired. Request a new one.' });
    }
    if (reset.attempts >= OTP_MAX_ATTEMPTS) {
      await prisma.passwordReset.delete({ where: { id: reset.id } });
      return res.status(429).json({ error: 'Too many attempts. Request a new code.' });
    }
    if (reset.codeHash !== hashCode(code)) {
      await prisma.passwordReset.update({
        where: { id: reset.id },
        data: { attempts: { increment: 1 } }
      });
      return res.status(400).json({ error: 'Invalid code' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });
    await prisma.passwordReset.deleteMany({ where: { userId: user.id } });

    res.json({ ok: true });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Perform initial setup (create first admin user)
router.post('/setup', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return res.status(403).json({ error: "Setup has already been completed" });
    }

    const { username, firstName, lastName, email, password, emailVerificationToken } = req.body;
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

    const user = await prisma.user.create({
      data: {
        username,
        firstName: firstName || null,
        lastName: lastName || null,
        email: normalizedEmail,
        emailVerified,
        passwordHash,
        role: 'ADMIN', // Prisma enum value UserRole.ADMIN = 'ADMIN'
        settings: {
          create: {}
        }
      },
      include: { settings: true }
    });

    // Generate token
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: toPublicUser(user as any), token });
  } catch (error) {
    console.error("Error during setup:", error);
    res.status(500).json({ error: "Internal server error during setup" });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const lookup = (identifier || '').toString();
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: lookup.toLowerCase() },
          { username: lookup }
        ]
      },
      include: { settings: true }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: toPublicUser(user as any), token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Middleware for protected routes (optional right here, but good to have)
export const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Me endpoint
router.get('/me', authenticate, async (req: any, res: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { settings: true }
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(toPublicUser(user as any));
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});


// Change password
router.post('/change-password', authenticate, async (req: any, res: any) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const passwordMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { passwordHash: newPasswordHash }
    });

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

export default router;
