import { exec } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Pause between ping rounds (ms)
const ROUND_INTERVAL_MS = 30_000;
// Per-device ping timeout (seconds)
const PING_TIMEOUT_S = 2;

function pingHost(ip: string): Promise<boolean> {
  return new Promise((resolve) => {
    // -c 1: single packet, -W: timeout in seconds (Linux), -w: deadline
    exec(`ping -c 1 -W ${PING_TIMEOUT_S} ${ip}`, (error) => {
      resolve(!error);
    });
  });
}

async function runPingRound(): Promise<void> {
  const devices = await prisma.hardwareAsset.findMany({
    where: {
      ip: { not: null },
      status: { not: 'MAINTENANCE' },
    },
    select: { id: true, ip: true, name: true },
  });

  if (devices.length === 0) return;

  await Promise.all(
    devices.map(async (device) => {
      const isOnline = await pingHost(device.ip!);
      await prisma.hardwareAsset.update({
        where: { id: device.id },
        data: {
          status: isOnline ? 'ONLINE' : 'OFFLINE',
          ...(isOnline ? { lastSeen: new Date() } : {}),
        },
      });
    })
  );
}

export function startPingService(): void {
  console.log('[ping] Service started');

  const loop = async () => {
    try {
      await runPingRound();
    } catch (err) {
      console.error('[ping] Round failed:', err);
    }
    setTimeout(loop, ROUND_INTERVAL_MS);
  };

  // Start first round after a short delay so the server is fully up
  setTimeout(loop, 5_000);
}
