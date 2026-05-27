import prisma from '../config/prisma.js';

export async function getPlasnovo(req, res, next) {
  try {
    const {
      materialType,
      batchStatus,
      wasteOrigin,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (materialType) where.materialType = materialType;
    if (batchStatus) where.batchStatus = batchStatus;
    if (wasteOrigin) where.wasteOrigin = wasteOrigin;

    if (startDate || endDate) {
      where.observedAt = {};
      if (startDate) where.observedAt.gte = new Date(startDate);
      if (endDate) where.observedAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.plasnovoRecycling.findMany({
        where,
        skip,
        take,
        orderBy: { observedAt: 'desc' },
        include: { productions: true },
      }),
      prisma.plasnovoRecycling.count({ where }),
    ]);

    return res.status(200).json({
      success: true,
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / take),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlasnovoByRpid(req, res, next) {
  try {
    const batch = await prisma.plasnovoRecycling.findUnique({
      where: { rpid: req.params.rpid },
      include: { productions: true },
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        error: 'Batch not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlasnovoStats(req, res, next) {
  try {
    const [totalBatches, materialAgg, statusAgg, allBatches] =
      await Promise.all([
        prisma.plasnovoRecycling.count(),
        prisma.plasnovoRecycling.groupBy({
          by: ['materialType'],
          _sum: { quantity: true },
          _count: { materialType: true },
        }),
        prisma.plasnovoRecycling.groupBy({
          by: ['batchStatus'],
          _count: { batchStatus: true },
        }),
        prisma.plasnovoRecycling.aggregate({
          _avg: { recycledContent: true },
          _sum: { quantity: true },
        }),
      ]);

    const totalKgByMaterial = {};
    for (const group of materialAgg) {
      totalKgByMaterial[group.materialType] = group._sum.quantity;
    }

    const batchesByStatus = {};
    for (const group of statusAgg) {
      batchesByStatus[group.batchStatus] = group._count.batchStatus;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalBatches,
        totalKg: allBatches._sum.quantity,
        totalKgByMaterial,
        avgRecycledContent: allBatches._avg.recycledContent,
        batchesByStatus,
      },
    });
  } catch (err) {
    next(err);
  }
}
