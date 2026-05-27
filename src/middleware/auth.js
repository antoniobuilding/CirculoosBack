import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import prisma from '../config/prisma.js';

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    prisma.user
      .findUnique({ where: { id: decoded.userId } })
      .then((user) => {
        if (!user) {
          return res.status(401).json({
            success: false,
            error: 'Invalid token. User not found.',
          });
        }

        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };

        next();
      })
      .catch((err) => {
        next(err);
      });
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token.',
    });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions.',
      });
    }

    next();
  };
}
