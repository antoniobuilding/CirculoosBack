import prisma from '../config/prisma.js';

export async function getActors(req, res, next) {
  try {
    const actors = await prisma.actor.findMany({
      orderBy: { id: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: actors,
    });
  } catch (err) {
    next(err);
  }
}

export async function getActorById(req, res, next) {
  try {
    const actor = await prisma.actor.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!actor) {
      return res.status(404).json({
        success: false,
        error: 'Actor not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: actor,
    });
  } catch (err) {
    next(err);
  }
}

export async function createActor(req, res, next) {
  try {
    const { name, role, location, description, metrics, color } = req.body;

    const actor = await prisma.actor.create({
      data: { name, role, location, description, metrics, color },
    });

    return res.status(201).json({
      success: true,
      data: actor,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateActor(req, res, next) {
  try {
    const actor = await prisma.actor.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });

    return res.status(200).json({
      success: true,
      data: actor,
    });
  } catch (err) {
    next(err);
  }
}
