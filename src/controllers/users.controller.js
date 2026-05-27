import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';

export async function getUsers(req, res, next) {
  try {
    const { role, actorId, search } = req.query;

    const where = {};

    if (role) {
      where.role = role;
    }

    if (actorId) {
      where.actorId = parseInt(actorId);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
    });

    const sanitized = users.map(({ password, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: { actor: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    const { password, ...sanitized } = user;

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const { email, name, password, role, actorId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const data = {
      email,
      name,
      password: hashedPassword,
      role: role || 'VIEWER',
    };

    if (actorId) {
      data.actorId = parseInt(actorId);
    }

    const user = await prisma.user.create({
      data,
      include: { actor: true },
    });

    const { password: _, ...sanitized } = user;

    return res.status(201).json({
      success: true,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const { name, role, actorId, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    // Prevent self-demotion
    if (req.user.id === userId && role && role !== existing.role) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change your own role.',
      });
    }

    const data = {};

    if (name !== undefined) data.name = name;
    if (role !== undefined) data.role = role;
    if (email !== undefined) data.email = email;
    if (actorId !== undefined) data.actorId = actorId ? parseInt(actorId) : null;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      include: { actor: true },
    });

    const { password: _, ...sanitized } = user;

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (req.user.id === userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account.',
      });
    }

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    await prisma.user.delete({ where: { id: userId } });

    return res.status(200).json({
      success: true,
      data: { message: 'User deleted successfully.' },
    });
  } catch (err) {
    next(err);
  }
}
