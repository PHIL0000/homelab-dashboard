import { Router } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { authenticate } from './auth';

const router = Router();
const prisma = new PrismaClient();

const ALLOWED_STORAGE_TYPES = ['SSD', 'HDD', 'SD', 'EMMC', 'USB_FLASH', 'OPTICAL', 'TAPE', 'OTHER'] as const;
const ALLOWED_STORAGE_INTERFACES = [
  'SATA',
  'SAS',
  'NVME M.2',
  'SATA NVME',
  'U.2/U.3 NVME',
  'PCIE',
  'USB',
  'THUNDERBOLT',
  'SDIO',
  'EMMC',
  'ISCSI',
  'FIBRE_CHANNEL',
  'OTHER'
] as const;

const isAllowedStorageType = (value: unknown): value is (typeof ALLOWED_STORAGE_TYPES)[number] => {
  return typeof value === 'string' && ALLOWED_STORAGE_TYPES.includes(value as (typeof ALLOWED_STORAGE_TYPES)[number]);
};

const isAllowedStorageInterface = (value: unknown): value is (typeof ALLOWED_STORAGE_INTERFACES)[number] => {
  return typeof value === 'string' && ALLOWED_STORAGE_INTERFACES.includes(value as (typeof ALLOWED_STORAGE_INTERFACES)[number]);
};

const ensureMarkdownExtension = (title: unknown) => {
  const normalized = typeof title === 'string' ? title.trim() : '';
  if (!normalized) return 'untitled.md';
  return normalized.toLowerCase().endsWith('.md') ? normalized : `${normalized}.md`;
};

const collectDocSubtreeIds = async (tx: Prisma.TransactionClient, rootDocIds: string[]) => {
  if (rootDocIds.length === 0) return [] as string[];

  const seen = new Set<string>();
  let frontier = [...new Set(rootDocIds)];

  for (const docId of frontier) {
    seen.add(docId);
  }

  while (frontier.length > 0) {
    const childDocs = await tx.doc.findMany({
      where: {
        parentDocId: {
          in: frontier
        }
      },
      select: {
        id: true
      }
    } as any);

    const nextFrontier: string[] = [];
    for (const child of childDocs as Array<{ id: string }>) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      nextFrontier.push(child.id);
    }

    frontier = nextFrontier;
  }

  return Array.from(seen);
};

// HW GET
router.get('/hardware', authenticate, async (req, res) => {
  const hw = await prisma.hardwareAsset.findMany({ include: { deployments: { include: { softwareUnit: true } } } });
  res.json(hw);
});

// HW POST
router.post('/hardware', authenticate, async (req, res) => {
  const hw = await prisma.hardwareAsset.create({ data: req.body });
  res.json(hw);
});

// HW PUT
router.put('/hardware/:id', authenticate, async (req, res) => {
  const hw = await prisma.hardwareAsset.update({ where: { id: req.params.id }, data: req.body });
  res.json(hw);
});

// HW DELETE
router.delete('/hardware/:id', authenticate, async (req, res) => {
  try {
    const hardwareId = req.params.id;

    await prisma.$transaction(async (tx) => {
      const deploymentsForHardware = await tx.deployment.findMany({
        where: { hardwareAssetId: hardwareId },
        select: { softwareUnitId: true }
      });

      const affectedSoftwareIds = Array.from(
        new Set(
          deploymentsForHardware
            .map((dep) => dep.softwareUnitId)
            .filter(Boolean)
        )
      ) as string[];

      // Delete deployments for this hardware first
      await tx.deployment.deleteMany({ where: { hardwareAssetId: hardwareId } });

      // Find which software units have no remaining deployments (orphaned)
      let orphanedSoftwareIds: string[] = [];
      if (affectedSoftwareIds.length > 0) {
        const stillDeployed = await tx.deployment.findMany({
          where: { softwareUnitId: { in: affectedSoftwareIds } },
          select: { softwareUnitId: true }
        });
        const stillDeployedIds = new Set(stillDeployed.map((d) => d.softwareUnitId));
        orphanedSoftwareIds = affectedSoftwareIds.filter((id) => !stillDeployedIds.has(id));
      }

      // Collect docs to delete: hardware docs + orphaned software docs only
      const docFilters: Prisma.DocWhereInput[] = [{ hardwareAssetId: hardwareId }];
      if (orphanedSoftwareIds.length > 0) {
        docFilters.push({ softwareUnitId: { in: orphanedSoftwareIds } });
      }

      const relatedDocs = await tx.doc.findMany({
        where: { OR: docFilters },
        select: { id: true }
      });

      const docsToDelete = await collectDocSubtreeIds(tx, relatedDocs.map((doc) => doc.id));

      if (docsToDelete.length > 0) {
        await tx.doc.deleteMany({ where: { id: { in: docsToDelete } } });
      }

      if (orphanedSoftwareIds.length > 0) {
        await tx.softwareUnit.deleteMany({
          where: { id: { in: orphanedSoftwareIds } }
        });
      }

      await tx.hardwareAsset.delete({ where: { id: hardwareId } });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Failed to delete hardware' });
  }
});

// SW GET
router.get('/services', authenticate, async (req, res) => {
  const sw = await prisma.softwareUnit.findMany({ include: { deployments: { include: { hardwareAsset: true } } } });
  res.json(sw);
});

// SW POST
router.post('/services', authenticate, async (req, res) => {
  const sw = await prisma.softwareUnit.create({ data: req.body });
  res.json(sw);
});

// SW PUT
router.put('/services/:id', authenticate, async (req, res) => {
  const sw = await prisma.softwareUnit.update({ where: { id: req.params.id }, data: req.body });
  res.json(sw);
});

// SW DELETE
router.delete('/services/:id', authenticate, async (req, res) => {
  try {
    const serviceId = req.params.id;

    await prisma.$transaction(async (tx) => {
      const rootServiceDocs = await tx.doc.findMany({
        where: { softwareUnitId: serviceId },
        select: { id: true }
      });

      const docsToDelete = await collectDocSubtreeIds(tx, rootServiceDocs.map((doc) => doc.id));

      if (docsToDelete.length > 0) {
        await tx.doc.deleteMany({ where: { id: { in: docsToDelete } } });
      }

      await tx.storage.deleteMany({ where: { softwareUnitId: serviceId } });
      await tx.deployment.deleteMany({ where: { softwareUnitId: serviceId } });
      await tx.softwareUnit.delete({ where: { id: serviceId } });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Failed to delete service' });
  }
});

// DEPLOYMENTS GET
router.get('/deployments', authenticate, async (req, res) => {
  const deployments = await prisma.deployment.findMany({ include: { hardwareAsset: true, softwareUnit: true } });
  res.json(deployments);
});

// DEPLOYMENTS POST
router.post('/deployments', authenticate, async (req, res) => {
  const deployment = await prisma.deployment.create({ data: req.body });
  res.json(deployment);
});

// DEPLOYMENTS PUT
router.put('/deployments/:id', authenticate, async (req, res) => {
  const deployment = await prisma.deployment.update({ where: { id: req.params.id }, data: req.body });
  res.json(deployment);
});

// DEPLOYMENTS DELETE
router.delete('/deployments/:id', authenticate, async (req, res) => {
  try {
    await prisma.deployment.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Failed to delete deployment' });
  }
});

// STORAGE GET
router.get('/storage', authenticate, async (req, res) => {
  const storage = await prisma.storage.findMany({ include: { hardwareAsset: true, softwareUnit: true } });
  res.json(storage);
});

// STORAGE POST
router.post('/storage', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, storageType, interface: interfaceValue, ...rest } = req.body;

  if (storageType != null && storageType !== '' && !isAllowedStorageType(storageType)) {
    return res.status(400).json({
      error: `Invalid storage type. Allowed values: ${ALLOWED_STORAGE_TYPES.join(', ')}`
    });
  }

  if (interfaceValue != null && interfaceValue !== '' && !isAllowedStorageInterface(interfaceValue)) {
    return res.status(400).json({
      error: `Invalid storage interface. Allowed values: ${ALLOWED_STORAGE_INTERFACES.join(', ')}`
    });
  }

  const storage = await prisma.storage.create({
    data: {
      ...rest,
      storageType: storageType || null,
      interface: interfaceValue || null,
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null
    }
  });
  res.json(storage);
});

// STORAGE PUT
router.put('/storage/:id', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, storageType, interface: interfaceValue, ...rest } = req.body;

  if (storageType != null && storageType !== '' && !isAllowedStorageType(storageType)) {
    return res.status(400).json({
      error: `Invalid storage type. Allowed values: ${ALLOWED_STORAGE_TYPES.join(', ')}`
    });
  }

  if (interfaceValue != null && interfaceValue !== '' && !isAllowedStorageInterface(interfaceValue)) {
    return res.status(400).json({
      error: `Invalid storage interface. Allowed values: ${ALLOWED_STORAGE_INTERFACES.join(', ')}`
    });
  }

  const storage = await prisma.storage.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      storageType: storageType || null,
      interface: interfaceValue || null,
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null
    }
  });
  res.json(storage);
});

// STORAGE DELETE
router.delete('/storage/:id', authenticate, async (req, res) => {
  try {
    await prisma.storage.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Failed to delete storage' });
  }
});

// DOCS GET
router.get('/docs', authenticate, async (req, res) => {
  const docs = await prisma.doc.findMany({
    include: {
      hardwareAsset: true,
      softwareUnit: true,
      parentDoc: {
        select: { id: true, title: true, parentDocId: true }
      },
      children: {
        select: { id: true, title: true, parentDocId: true }
      }
    } as any
  });
  res.json(docs);
});

// DOCS POST
router.post('/docs', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, parentDocId, title, ...rest } = req.body;
  const doc = await prisma.doc.create({
    data: {
      ...rest,
      title: ensureMarkdownExtension(title),
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null,
      parentDocId: parentDocId || null
    }
  });
  res.json(doc);
});

// DOCS PUT
router.put('/docs/:id', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, parentDocId, title, ...rest } = req.body;
  const doc = await prisma.doc.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      title: ensureMarkdownExtension(title),
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null,
      parentDocId: parentDocId || null
    }
  });
  res.json(doc);
});

// DOCS DELETE
router.delete('/docs/:id', authenticate, async (req, res) => {
  try {
    const docId = req.params.id;

    await prisma.$transaction(async (tx) => {
      const docsToDelete = await collectDocSubtreeIds(tx, [docId]);
      await tx.doc.deleteMany({ where: { id: { in: docsToDelete } } });
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Failed to delete document' });
  }
});

export default router;
