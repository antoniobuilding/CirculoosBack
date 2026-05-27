import prisma from '../config/prisma.js';

export async function getMetrics(req, res, next) {
  try {
    const metrics = await prisma.environmentalMetric.findMany({
      orderBy: { id: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMetric(req, res, next) {
  try {
    const metric = await prisma.environmentalMetric.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      data: metric,
    });
  } catch (err) {
    next(err);
  }
}
