import prisma from '../config/prisma.js';

export async function getProducts(req, res, next) {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { id: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { events: { orderBy: { date: 'desc' } } },
      }),
      prisma.product.count({ where }),
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

export async function getProductById(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { events: { orderBy: { date: 'desc' } } },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const {
      id,
      name,
      material,
      recycledPercentage,
      weight,
      color,
      origin,
      status,
      currentOwner,
      batch,
      certifications,
    } = req.body;

    const product = await prisma.product.create({
      data: {
        id,
        name,
        material,
        recycledPercentage,
        weight,
        color,
        origin,
        status,
        currentOwner,
        batch,
        certifications: certifications || [],
      },
    });

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    return res.status(200).json({
      success: true,
      data: { message: 'Product deleted successfully.' },
    });
  } catch (err) {
    next(err);
  }
}
