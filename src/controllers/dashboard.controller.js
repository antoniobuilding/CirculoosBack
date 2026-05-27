import prisma from '../config/prisma.js';

export async function getStats(req, res, next) {
  try {
    const [
      totalProducts,
      productsByStatus,
      recentProducts,
      environmentalMetrics,
      totalActors,
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { events: { orderBy: { date: 'desc' } } },
      }),
      prisma.environmentalMetric.findMany(),
      prisma.actor.count(),
    ]);

    const statusCounts = {};
    for (const group of productsByStatus) {
      statusCounts[group.status] = group._count.status;
    }

    return res.status(200).json({
      success: true,
      data: {
        totalProducts,
        productsByStatus: statusCounts,
        recentProducts,
        environmentalMetrics,
        totalActors,
      },
    });
  } catch (err) {
    next(err);
  }
}
