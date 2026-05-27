import prisma from '../config/prisma.js';

export async function getMolto(req, res, next) {
  try {
    const {
      productFamily,
      machineId,
      qualityStatus,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (productFamily) where.productFamily = productFamily;
    if (machineId) where.machineId = machineId;
    if (qualityStatus) where.qualityStatus = qualityStatus;

    if (startDate || endDate) {
      where.observedAt = {};
      if (startDate) where.observedAt.gte = new Date(startDate);
      if (endDate) where.observedAt.lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.moltoProduction.findMany({
        where,
        skip,
        take,
        orderBy: { observedAt: 'desc' },
        include: { materialBatch: true },
      }),
      prisma.moltoProduction.count({ where }),
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

export async function getMoltoById(req, res, next) {
  try {
    const production = await prisma.moltoProduction.findUnique({
      where: { id: req.params.id },
      include: { materialBatch: true },
    });

    if (!production) {
      return res.status(404).json({
        success: false,
        error: 'Production order not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: production,
    });
  } catch (err) {
    next(err);
  }
}

export async function getMoltoStats(req, res, next) {
  try {
    const [totalProduction, familyAgg, allProduction] = await Promise.all([
      prisma.moltoProduction.count(),
      prisma.moltoProduction.groupBy({
        by: ['productFamily'],
        _count: { productFamily: true },
        _sum: {
          okQuantity: true,
          injectedQuantity: true,
          scrapQuantity: true,
          defectiveQuantity: true,
        },
      }),
      prisma.moltoProduction.aggregate({
        _sum: {
          okQuantity: true,
          injectedQuantity: true,
        },
        _avg: {
          cycleTime: true,
        },
      }),
    ]);

    const totalUnits = allProduction._sum.okQuantity || 0;
    const totalInjected = allProduction._sum.injectedQuantity || 0;
    const avgOkRate =
      totalInjected > 0
        ? ((totalUnits / totalInjected) * 100).toFixed(2)
        : 0;

    const productionByFamily = {};
    for (const group of familyAgg) {
      productionByFamily[group.productFamily] = {
        count: group._count.productFamily,
        okQuantity: group._sum.okQuantity,
        injectedQuantity: group._sum.injectedQuantity,
        scrapQuantity: group._sum.scrapQuantity,
        defectiveQuantity: group._sum.defectiveQuantity,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        totalProduction,
        totalUnits,
        avgOkRate: parseFloat(avgOkRate),
        avgCycleTime: allProduction._avg.cycleTime,
        productionByFamily,
      },
    });
  } catch (err) {
    next(err);
  }
}
