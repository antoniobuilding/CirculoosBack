import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { parse } from 'csv-parse/sync';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const prisma = new PrismaClient();

// ── Mock Data (from CirculoosDemo) ──────────────────────────────────

const products = [
  {
    id: 'RPL-2026-001',
    name: 'Premium Dump Truck',
    material: 'Recycled PP',
    recycledPercentage: 85,
    weight: 850,
    color: 'Red/Yellow',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'In Use',
    currentOwner: 'End Consumer',
    createdAt: '2026-01-15T10:30:00',
    batch: 'LOT-2026-0115',
    certifications: ['ISO 14001', 'EN 71-3', 'Circular Economy'],
    events: [
      {
        type: 'Manufacturing',
        date: '2026-01-15T10:30:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description:
          'Product manufactured with 85% certified recycled material',
        details: {
          energyUsed: '2.4 kWh',
          co2Saved: '0.62 kg',
          materialSource: 'Plasnovo S.L',
        },
      },
      {
        type: 'Distribution',
        date: '2026-01-18T14:20:00',
        actor: 'EcoDistribution',
        location: 'Valencia',
        description: 'Delivery made with electric fleet',
        details: {
          transportDistance: '85 km',
          co2Saved: '0.12 kg',
        },
      },
      {
        type: 'Sale',
        date: '2026-01-20T11:45:00',
        actor: 'El Sol Toy Store',
        location: 'Valencia',
        description: 'Product sold and registered in system',
      },
    ],
  },
  {
    id: 'RPL-2026-002',
    name: 'Construction Blocks 100 pcs',
    material: 'Recycled ABS',
    recycledPercentage: 75,
    weight: 1200,
    color: 'Multicolor',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'Recycling',
    currentOwner: 'Plasnovo S.L',
    createdAt: '2025-08-22T09:15:00',
    batch: 'LOT-2025-0822',
    certifications: ['ISO 14001', 'EN 71-3', 'FSC'],
    events: [
      {
        type: 'Manufacturing',
        date: '2025-08-22T09:15:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description:
          'Product manufactured with post-consumer recycled material',
      },
      {
        type: 'In Use',
        date: '2025-09-01T16:30:00',
        actor: 'End Consumer',
        location: 'Madrid',
        description: 'First activation by user',
      },
      {
        type: 'Repair',
        date: '2025-12-10T10:20:00',
        actor: 'ToyRenew',
        location: 'Madrid',
        description: 'Replacement of 5 damaged pieces',
        details: {
          piecesReplaced: '5',
          lifeExtension: '+18 months',
        },
      },
      {
        type: 'End of Life',
        date: '2026-02-10T14:00:00',
        actor: 'End Consumer',
        location: 'Madrid',
        description: 'Product returned for recycling',
      },
      {
        type: 'Recycling',
        date: '2026-02-14T09:30:00',
        actor: 'Plasnovo S.L',
        location: 'Ibi, Alicante',
        description: 'Shredding and granulation in progress',
        details: {
          recoveryRate: '96%',
          newDestination: 'New RE-PLAY production',
        },
      },
    ],
  },
  {
    id: 'RPL-2026-003',
    name: 'Luna Interactive Doll',
    material: 'Recycled PVC',
    recycledPercentage: 60,
    weight: 380,
    color: 'Pink/White',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'Repair',
    currentOwner: 'ToyRenew',
    createdAt: '2025-11-05T14:20:00',
    batch: 'LOT-2025-1105',
    certifications: ['EN 71-3', 'CE', 'Circular Economy'],
    events: [
      {
        type: 'Manufacturing',
        date: '2025-11-05T14:20:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description: 'Doll with recyclable electronic components',
      },
      {
        type: 'In Use',
        date: '2025-11-18T12:00:00',
        actor: 'End Consumer',
        location: 'Barcelona',
        description: 'Product activated and in use',
      },
      {
        type: 'Repair',
        date: '2026-02-08T15:45:00',
        actor: 'ToyRenew',
        location: 'Barcelona',
        description: 'Voice mechanism repair',
        details: {
          issue: 'Damaged speaker',
          status: 'In progress',
        },
      },
    ],
  },
  {
    id: 'RPL-2026-004',
    name: 'Chef Pro Kitchen Set',
    material: 'Recycled PE',
    recycledPercentage: 90,
    weight: 1450,
    color: 'Red/Silver',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'In Use',
    currentOwner: 'End Consumer',
    createdAt: '2026-01-28T11:00:00',
    batch: 'LOT-2026-0128',
    certifications: [
      'ISO 14001',
      'EN 71-3',
      'Circular Economy',
      'Carbon Neutral',
    ],
    events: [
      {
        type: 'Manufacturing',
        date: '2026-01-28T11:00:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description:
          'Manufactured with maximum percentage of recycled material',
      },
      {
        type: 'Distribution',
        date: '2026-02-01T09:30:00',
        actor: 'EcoDistribution',
        location: 'Seville',
        description: 'Sustainable transport delivery',
      },
      {
        type: 'Sale',
        date: '2026-02-05T16:20:00',
        actor: 'ToysWorld',
        location: 'Seville',
        description: 'Sold and registered',
      },
    ],
  },
  {
    id: 'RPL-2026-005',
    name: 'Turbo Remote Control Car',
    material: 'Recycled PP + ABS',
    recycledPercentage: 70,
    weight: 650,
    color: 'Blue/Black',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'Distribution',
    currentOwner: 'EcoDistribution',
    createdAt: '2026-02-10T08:45:00',
    batch: 'LOT-2026-0210',
    certifications: ['ISO 14001', 'EN 71-3', 'CE'],
    events: [
      {
        type: 'Manufacturing',
        date: '2026-02-10T08:45:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description: 'Production completed successfully',
      },
      {
        type: 'Distribution',
        date: '2026-02-14T10:00:00',
        actor: 'EcoDistribution',
        location: 'In transit',
        description: 'On its way to point of sale',
        details: {
          destination: 'Malaga',
          estimatedArrival: '2026-02-16',
        },
      },
    ],
  },
  {
    id: 'RPL-2025-156',
    name: 'Teddy Bear Plush',
    material: 'Recycled Textile',
    recycledPercentage: 95,
    weight: 320,
    color: 'Brown',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'Second Life',
    currentOwner: 'RE-PLAY Social Program',
    createdAt: '2025-06-12T13:30:00',
    batch: 'LOT-2025-0612',
    certifications: ['OEKO-TEX', 'Circular Economy', 'FSC'],
    events: [
      {
        type: 'Manufacturing',
        date: '2025-06-12T13:30:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description: 'Plush toy made from recycled textiles',
      },
      {
        type: 'In Use',
        date: '2025-06-20T10:00:00',
        actor: 'End Consumer',
        location: 'Valencia',
        description: 'First family',
      },
      {
        type: 'Donation',
        date: '2026-01-15T11:30:00',
        actor: 'End Consumer',
        location: 'Valencia',
        description: 'Donated in excellent condition',
      },
    ],
  },
  {
    id: 'RPL-2026-006',
    name: 'Extreme Racing Track',
    material: 'Recycled PP',
    recycledPercentage: 80,
    weight: 2100,
    color: 'Orange/Black',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'Manufacturing',
    currentOwner: 'RE-PLAY',
    createdAt: '2026-02-15T07:30:00',
    batch: 'LOT-2026-0215',
    certifications: ['ISO 14001', 'EN 71-3'],
    events: [
      {
        type: 'Manufacturing',
        date: '2026-02-15T07:30:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description: 'On production line – 85% complete',
        details: {
          progress: '85%',
          estimatedCompletion: '2026-02-16',
        },
      },
    ],
  },
  {
    id: 'RPL-2025-089',
    name: 'Urban Kids Tricycle',
    material: 'Recycled PE + Metal',
    recycledPercentage: 65,
    weight: 3200,
    color: 'Green/White',
    origin: 'RE-PLAY Plant – Ibi, Alicante',
    status: 'In Use',
    currentOwner: 'End Consumer',
    createdAt: '2025-04-18T10:15:00',
    batch: 'LOT-2025-0418',
    certifications: ['ISO 14001', 'EN 71-1', 'CE', 'Circular Economy'],
    events: [
      {
        type: 'Manufacturing',
        date: '2025-04-18T10:15:00',
        actor: 'RE-PLAY',
        location: 'Ibi, Alicante',
        description: 'Tricycle with recycled metal frame',
      },
      {
        type: 'In Use',
        date: '2025-05-02T15:00:00',
        actor: 'End Consumer',
        location: 'Bilbao',
        description: 'Actively in use',
      },
      {
        type: 'Maintenance',
        date: '2025-11-20T12:30:00',
        actor: 'ToyRenew',
        location: 'Bilbao',
        description: 'Inspection and lubrication of moving parts',
      },
    ],
  },
];

const actors = [
  {
    id: 1,
    name: 'RE-PLAY',
    role: 'Manufacturer',
    location: 'Ibi, Alicante',
    description:
      'Leading toy manufacturer focused on sustainability and circular economy',
    metrics: {
      'Products manufactured': '1,847',
      'Recycled material usage': '80%',
      'Carbon footprint reduction': '-60%',
    },
    color: '#006CB7',
  },
  {
    id: 2,
    name: 'Plasnovo S.L',
    role: 'Recycler',
    location: 'Ibi, Alicante',
    description:
      'Specialists in post-consumer plastic recycling and material recovery',
    metrics: {
      'Material processed': '2,450 kg/month',
      'Recovery rate': '95%',
      'Products recycled': '523',
    },
    color: '#009247',
  },
  {
    id: 3,
    name: 'EcoDistribution',
    role: 'Distributor',
    location: 'Nationwide',
    description:
      'Sustainable distribution network with full electric fleet',
    metrics: {
      'Active routes': '45',
      'Emissions reduced': '60%',
      'Monthly deliveries': '12,500',
    },
    color: '#6D28D9',
  },
  {
    id: 4,
    name: 'ToyRenew',
    role: 'Repairer',
    location: 'Madrid, Barcelona, Valencia',
    description:
      'Specialised repair and maintenance service to extend product life',
    metrics: {
      'Monthly repairs': '234',
      'Life extension': '+2.5 years',
      'Success rate': '92%',
    },
    color: '#D97706',
  },
];

const environmentalMetrics = {
  carbonFootprint: {
    current: 892,
    target: 1200,
    unit: 'kg CO₂',
    change: '-25.7%',
  },
  virginMaterial: {
    current: 1456,
    target: 2000,
    unit: 'kg',
    change: '+18.3%',
  },
  energyConsumption: {
    current: 4235,
    target: 5000,
    unit: 'kWh',
    change: '-32.1%',
  },
  waterSaved: {
    current: 12450,
    target: 15000,
    unit: 'litres',
    change: '-28.9%',
  },
};

// ── Helpers ────────────────────────────────────────────────────────

const STATUS_MAP = {
  'In Use': 'IN_USE',
  Manufacturing: 'MANUFACTURING',
  Repair: 'REPAIR',
  Recycling: 'RECYCLING',
  Distribution: 'DISTRIBUTION',
  'Second Life': 'SECOND_LIFE',
};

const METRIC_LABELS = {
  carbonFootprint: 'Carbon Footprint',
  virginMaterial: 'Virgin Material Saved',
  energyConsumption: 'Energy Consumption',
  waterSaved: 'Water Saved',
};

// ── Seed ───────────────────────────────────────────────────────────

async function main() {
  console.log('Seeding database...');

  // 1. Delete all existing data (respecting FK order)
  console.log('Cleaning existing data...');
  await prisma.moltoProduction.deleteMany();
  await prisma.plasnovoRecycling.deleteMany();
  await prisma.productEvent.deleteMany();
  await prisma.product.deleteMany();
  await prisma.actor.deleteMany();
  await prisma.environmentalMetric.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create users
  console.log('Creating users...');
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const viewerPassword = await bcrypt.hash('Viewer123!', 10);

  await prisma.user.createMany({
    data: [
      {
        email: 'admin@replay.es',
        password: adminPassword,
        name: 'Admin RE-PLAY',
        role: 'ADMIN',
      },
      {
        email: 'viewer@replay.es',
        password: viewerPassword,
        name: 'Viewer Demo',
        role: 'VIEWER',
      },
    ],
  });

  // 3. Create products and events
  console.log('Creating products and events...');
  for (const p of products) {
    const { events, ...productData } = p;

    await prisma.product.create({
      data: {
        id: productData.id,
        name: productData.name,
        material: productData.material,
        recycledPercentage: productData.recycledPercentage,
        weight: productData.weight,
        color: productData.color,
        origin: productData.origin,
        status: STATUS_MAP[productData.status],
        currentOwner: productData.currentOwner,
        batch: productData.batch,
        certifications: productData.certifications,
        createdAt: new Date(productData.createdAt),
        events: {
          create: events.map((e) => ({
            type: e.type,
            date: new Date(e.date),
            actor: e.actor,
            location: e.location,
            description: e.description,
            details: e.details || undefined,
          })),
        },
      },
    });
  }

  // 4. Create actors
  console.log('Creating actors...');
  for (const actor of actors) {
    await prisma.actor.create({
      data: {
        name: actor.name,
        role: actor.role,
        location: actor.location,
        description: actor.description,
        metrics: actor.metrics,
        color: actor.color,
      },
    });
  }

  // 5. Create environmental metrics
  console.log('Creating environmental metrics...');
  for (const [key, value] of Object.entries(environmentalMetrics)) {
    await prisma.environmentalMetric.create({
      data: {
        key,
        label: METRIC_LABELS[key],
        current: value.current,
        target: value.target,
        unit: value.unit,
        change: value.change,
      },
    });
  }

  // 6. Parse and insert Plasnovo recycling CSV
  console.log('Importing Plasnovo recycling data from CSV...');
  const plasnovoCsv = readFileSync(
    join(__dirname, 'plasnovo_recycling.csv'),
    'utf-8'
  );
  const plasnovoRows = parse(plasnovoCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for (const row of plasnovoRows) {
    await prisma.plasnovoRecycling.create({
      data: {
        rpid: row.rpid,
        ngsildId: row.id,
        type: row.type,
        observedAt: new Date(row.observedat),
        inputWasteBatchId: row.inputWasteBatchId,
        materialType: row.materialType,
        polymerGrade: row.polymerGrade,
        quantity: parseFloat(row.quantity),
        quantityUnitCode: row.quantity_unitCode,
        recycledContent: parseFloat(row.recycledContent),
        virginContent: parseFloat(row.virginContent),
        entryDate: new Date(row.entryDate),
        recyclingDate: new Date(row.recyclingDate),
        supplierId: row.supplierId,
        supplierName: row.supplierName,
        province: row.province,
        country: row.country,
        lerCode: row.lerCode,
        nimaCode: row.nimaCode,
        wasteOrigin: row.wasteOrigin,
        processLine: row.processLine,
        operatorId: row.operatorId,
        shiftCode: row.shiftCode,
        moistureLevel: parseFloat(row.moistureLevel),
        contaminationLevel: row.contaminationLevel,
        bulkDensity: parseFloat(row.bulkDensity),
        bulkDensityUnitCode: row.bulkDensity_unitCode,
        meltFlowIndex: parseFloat(row.meltFlowIndex),
        meltFlowIndexUnitCode: row.meltFlowIndex_unitCode,
        batchStatus: row.batchStatus,
        qualityGrade: row.qualityGrade,
        storageWarehouse: row.storageWarehouse,
        observations: row.observations || null,
      },
    });
  }

  // 7. Parse and insert Molto production CSV (depends on Plasnovo FK)
  console.log('Importing Molto production data from CSV...');
  const moltoCsv = readFileSync(
    join(__dirname, 'molto_production.csv'),
    'utf-8'
  );
  const moltoRows = parse(moltoCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  for (const row of moltoRows) {
    await prisma.moltoProduction.create({
      data: {
        id: row.id,
        type: row.type,
        observedAt: new Date(row.observedat),
        productionOrderId: row.productionOrderId,
        productReference: row.productReference,
        productFamily: row.productFamily,
        machineId: row.machineId,
        machineTonnage: parseInt(row.machineTonnage),
        mouldId: row.mouldId,
        mouldCavities: parseInt(row.mouldCavities),
        materialType: row.materialType,
        materialBatchId: row.materialBatchId,
        recycledContent: parseFloat(row.recycledContent),
        colorBatchId: row.colorBatchId,
        colorName: row.colorName,
        injectedQuantity: parseInt(row.injectedQuantity),
        plannedQuantity: parseInt(row.plannedQuantity),
        scrapQuantity: parseInt(row.scrapQuantity),
        defectiveQuantity: parseInt(row.defectiveQuantity),
        okQuantity: parseInt(row.okQuantity),
        cycleTime: parseFloat(row.cycleTime),
        cycleTimeUnitCode: row.cycleTime_unitCode,
        injectionPressure: parseInt(row.injectionPressure),
        injectionPressureUnitCode: row.injectionPressure_unitCode,
        meltTemperature: parseInt(row.meltTemperature),
        meltTemperatureUnitCode: row.meltTemperature_unitCode,
        unitWeight: parseFloat(row.unitWeight),
        unitWeightUnitCode: row.unitWeight_unitCode,
        energyConsumption: parseFloat(row.energyConsumption),
        energyConsumptionUnitCode: row.energyConsumption_unitCode,
        operatorId: row.operatorId,
        shiftCode: row.shiftCode,
        productionDate: new Date(row.productionDate),
        startTime: new Date(row.startTime),
        endTime: new Date(row.endTime),
        qualityStatus: row.qualityStatus,
        defectType: row.defectType,
        correctiveAction: row.correctiveAction,
        observations: row.observations || null,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(
    `  - Users: 2 (admin@replay.es / Admin123!, viewer@replay.es / Viewer123!)`
  );
  console.log(`  - Products: ${products.length}`);
  console.log(`  - Actors: ${actors.length}`);
  console.log(
    `  - Environmental Metrics: ${Object.keys(environmentalMetrics).length}`
  );
  console.log(`  - Plasnovo Recycling batches: ${plasnovoRows.length}`);
  console.log(`  - Molto Production orders: ${moltoRows.length}`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
