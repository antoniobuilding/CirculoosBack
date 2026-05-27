import prisma from '../config/prisma.js';

export async function getProductEvents(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found.',
      });
    }

    const events = await prisma.productEvent.findMany({
      where: { productId },
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProductEvent(req, res, next) {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found.',
      });
    }

    const { type, date, actor, location, description, details } = req.body;

    const event = await prisma.productEvent.create({
      data: {
        productId,
        type,
        date: new Date(date),
        actor,
        location,
        description,
        details: details || undefined,
      },
    });

    return res.status(201).json({
      success: true,
      data: event,
    });
  } catch (err) {
    next(err);
  }
}
