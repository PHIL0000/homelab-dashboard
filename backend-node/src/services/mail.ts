import nodemailer, { Transporter } from 'nodemailer';

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_FROM'] as const;

let cachedTransporter: Transporter | null = null;
let lastConfigKey = '';

// dotenv preserves whitespace after `=`, so a stray "SMTP_HOST= mx.example.com"
// silently breaks DNS/auth. Strip it for every SMTP_* variable we read.
const envStr = (key: string): string => (process.env[key] || '').trim();

const buildConfigKey = () =>
  [
    envStr('SMTP_HOST'),
    envStr('SMTP_PORT'),
    envStr('SMTP_USER'),
    envStr('SMTP_PASS'),
    envStr('SMTP_SECURE'),
    envStr('SMTP_FROM'),
  ].join('|');

export const isMailConfigured = (): boolean =>
  requiredEnv.every((key) => !!envStr(key));

const getTransporter = (): Transporter => {
  if (!isMailConfigured()) {
    throw new Error(
      'SMTP is not configured. Set SMTP_HOST, SMTP_PORT and SMTP_FROM (plus optional SMTP_USER/SMTP_PASS/SMTP_SECURE) in the backend .env file.'
    );
  }

  const configKey = buildConfigKey();
  if (cachedTransporter && configKey === lastConfigKey) return cachedTransporter;

  const port = Number(envStr('SMTP_PORT'));
  const secureEnv = envStr('SMTP_SECURE').toLowerCase();
  const secure = secureEnv === 'true' || secureEnv === '1' || port === 465;
  const user = envStr('SMTP_USER');

  cachedTransporter = nodemailer.createTransport({
    host: envStr('SMTP_HOST'),
    port,
    secure,
    auth: user ? { user, pass: envStr('SMTP_PASS') } : undefined,
    debug: true,
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false, // Allow self-signed certs; adjust as needed for your security requirements.
    },
  });
  lastConfigKey = configKey;
  return cachedTransporter;
};

const dashboardName = () => envStr('SMTP_DASHBOARD_NAME') || 'Homelab Dashboard';

const renderCodeEmail = (heading: string, intro: string, code: string, minutes: number) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#0f172a; padding:32px; color:#e2e8f0;">
    <div style="max-width:480px; margin:0 auto; background:#1e293b; border-radius:16px; padding:32px; border:1px solid #334155;">
      <h1 style="margin:0 0 16px; font-size:22px; color:#f8fafc;">${heading}</h1>
      <p style="margin:0 0 24px; line-height:1.5; color:#cbd5e1;">${intro}</p>
      <div style="font-size:36px; letter-spacing:12px; font-weight:700; text-align:center; padding:24px; background:#0f172a; border-radius:12px; color:#a855f7; font-family: 'SF Mono', Menlo, monospace;">${code}</div>
      <p style="margin:24px 0 0; font-size:13px; color:#94a3b8;">This code expires in ${minutes} minutes. If you didn't request this, you can safely ignore this email.</p>
      <p style="margin:24px 0 0; font-size:12px; color:#64748b;">— ${dashboardName()}</p>
    </div>
  </div>
`;

export const sendVerificationEmail = async (
  email: string,
  code: string,
  minutes: number
): Promise<void> => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: envStr('SMTP_FROM'),
    to: email,
    subject: `Your ${dashboardName()} verification code`,
    text: `Your verification code is ${code}. It expires in ${minutes} minutes.`,
    html: renderCodeEmail(
      'Verify your email',
      `Use the code below to finish setting up your ${dashboardName()} account.`,
      code,
      minutes
    ),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  code: string,
  minutes: number
): Promise<void> => {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: envStr('SMTP_FROM'),
    to: email,
    subject: `Your ${dashboardName()} password reset code`,
    text: `Your password reset code is ${code}. It expires in ${minutes} minutes.`,
    html: renderCodeEmail(
      'Reset your password',
      `We received a request to reset the password for your ${dashboardName()} account.`,
      code,
      minutes
    ),
  });
};
