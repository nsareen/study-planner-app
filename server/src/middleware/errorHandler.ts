import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'A record with this data already exists',
        details: err.meta,
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        error: 'Not Found',
        message: 'The requested record does not exist',
      });
    }

    // Foreign key constraint failed
    if (err.code === 'P2003') {
      return res.status(400).json({
        error: 'Invalid Reference',
        message: 'Referenced record does not exist',
        details: err.meta,
      });
    }
  }

  // Prisma validation error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid data provided',
    });
  }

  // Application errors with status code
  if ('statusCode' in err && err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.name || 'Application Error',
      message: err.message,
    });
  }

  // Unknown errors
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
