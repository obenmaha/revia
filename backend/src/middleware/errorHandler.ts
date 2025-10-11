import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export class CustomError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        error = new CustomError(
          'Une ressource avec ces informations existe déjà',
          409
        );
        break;
      case 'P2025':
        error = new CustomError('Ressource non trouvée', 404);
        break;
      case 'P2003':
        error = new CustomError(
          'Violation de contrainte de clé étrangère',
          400
        );
        break;
      default:
        error = new CustomError('Erreur de base de données', 500);
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    error = new CustomError('Données invalides', 400);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = err.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join(', ');
    error = new CustomError(`Erreur de validation: ${message}`, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new CustomError('Token invalide', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new CustomError('Token expiré', 401);
  }

  // Default error
  if (!error.statusCode) {
    error.statusCode = 500;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
