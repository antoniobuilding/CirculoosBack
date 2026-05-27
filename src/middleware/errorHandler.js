import { Prisma } from '@prisma/client';

export function errorHandler(err, req, res, _next) {
  console.error('Error:', err);

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({
          success: false,
          error: `Unique constraint violation on: ${err.meta?.target?.join(', ')}`,
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Record not found.',
        });
      case 'P2003':
        return res.status(400).json({
          success: false,
          error: 'Foreign key constraint failed.',
        });
      default:
        return res.status(400).json({
          success: false,
          error: `Database error: ${err.message}`,
        });
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided.',
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal server error' : message,
  });
}
