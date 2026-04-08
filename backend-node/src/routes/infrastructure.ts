import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from './auth';

const router = Router();
const prisma = new PrismaClient();

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

// STORAGE GET
router.get('/storage', authenticate, async (req, res) => {
  const storage = await prisma.storage.findMany({ include: { hardwareAsset: true, softwareUnit: true } });
  res.json(storage);
});

// STORAGE POST
router.post('/storage', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, ...rest } = req.body;
  const storage = await prisma.storage.create({
    data: {
      ...rest,
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null
    }
  });
  res.json(storage);
});

// STORAGE PUT
router.put('/storage/:id', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, ...rest } = req.body;
  const storage = await prisma.storage.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null
    }
  });
  res.json(storage);
});

// DOCS GET
router.get('/docs', authenticate, async (req, res) => {
  const docs = await prisma.doc.findMany({ include: { hardwareAsset: true, softwareUnit: true } });
  res.json(docs);
});

// DOCS POST
router.post('/docs', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, ...rest } = req.body;
  const doc = await prisma.doc.create({
    data: {
      ...rest,
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null
    }
  });
  res.json(doc);
});

// DOCS PUT
router.put('/docs/:id', authenticate, async (req, res) => {
  const { hardwareAssetId, softwareUnitId, ...rest } = req.body;
  const doc = await prisma.doc.update({
    where: { id: req.params.id },
    data: {
      ...rest,
      hardwareAssetId: hardwareAssetId || null,
      softwareUnitId: softwareUnitId || null
    }
  });
  res.json(doc);
});

export default router;
