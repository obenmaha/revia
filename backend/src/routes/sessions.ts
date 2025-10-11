import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { CustomError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Appliquer l'authentification à toutes les routes
router.use(authenticate);

// Validation middleware
const validateRequest = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Données invalides',
      details: errors.array(),
    });
  }
  next();
};

// @route   GET /api/sessions
// @desc    Obtenir la liste des séances du praticien
// @access  Private
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('La page doit être un entier positif'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('La limite doit être entre 1 et 100'),
    query('patientId')
      .optional()
      .isUUID()
      .withMessage('ID de patient invalide'),
    query('status')
      .optional()
      .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
      .withMessage('Statut invalide'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Date de début invalide'),
    query('endDate').optional().isISO8601().withMessage('Date de fin invalide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const { patientId, status, startDate, endDate } = req.query;

      const whereClause: any = {
        practitionerId: req.user!.id,
      };

      // Filtres optionnels
      if (patientId) whereClause.patientId = patientId;
      if (status) whereClause.status = status;
      if (startDate || endDate) {
        whereClause.scheduledAt = {};
        if (startDate)
          whereClause.scheduledAt.gte = new Date(startDate as string);
        if (endDate) whereClause.scheduledAt.lte = new Date(endDate as string);
      }

      const [sessions, total] = await Promise.all([
        prisma.session.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { scheduledAt: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        }),
        prisma.session.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: sessions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/sessions/:id
// @desc    Obtenir une séance spécifique
// @access  Private
router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID de séance invalide'), validateRequest],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const session = await prisma.session.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
            },
          },
        },
      });

      if (!session) {
        throw new CustomError('Séance non trouvée', 404);
      }

      res.json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/sessions
// @desc    Créer une nouvelle séance
// @access  Private
router.post(
  '/',
  [
    body('patientId').isUUID().withMessage('ID de patient invalide'),
    body('scheduledAt').isISO8601().withMessage('Date de séance invalide'),
    body('duration')
      .isInt({ min: 15, max: 480 })
      .withMessage('Durée doit être entre 15 et 480 minutes'),
    body('status')
      .optional()
      .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
      .withMessage('Statut invalide'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes doivent être une chaîne'),
    body('objectives')
      .optional()
      .isArray()
      .withMessage('Objectifs doivent être un tableau'),
    body('exercises')
      .optional()
      .isArray()
      .withMessage('Exercices doivent être un tableau'),
    body('evaluation')
      .optional()
      .isObject()
      .withMessage('Évaluation doit être un objet'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const {
        patientId,
        scheduledAt,
        duration,
        status = 'scheduled',
        notes,
        objectives,
        exercises,
        evaluation,
      } = req.body;

      // Vérifier que le patient appartient au praticien
      const patient = await prisma.patient.findFirst({
        where: {
          id: patientId,
          practitionerId: req.user!.id,
        },
      });

      if (!patient) {
        throw new CustomError('Patient non trouvé', 404);
      }

      // Vérifier les conflits de planning
      const conflictingSession = await prisma.session.findFirst({
        where: {
          practitionerId: req.user!.id,
          status: { not: 'cancelled' },
          scheduledAt: {
            gte: new Date(new Date(scheduledAt).getTime() - duration * 60000),
            lte: new Date(new Date(scheduledAt).getTime() + duration * 60000),
          },
        },
      });

      if (conflictingSession) {
        throw new CustomError('Conflit de planning détecté', 409);
      }

      const session = await prisma.session.create({
        data: {
          patientId,
          practitionerId: req.user!.id,
          scheduledAt: new Date(scheduledAt),
          duration,
          status,
          notes,
          objectives: objectives || [],
          exercises: exercises || [],
          evaluation: evaluation || {},
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Séance créée avec succès',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/sessions/:id
// @desc    Mettre à jour une séance
// @access  Private
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de séance invalide'),
    body('scheduledAt')
      .optional()
      .isISO8601()
      .withMessage('Date de séance invalide'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Durée doit être entre 15 et 480 minutes'),
    body('status')
      .optional()
      .isIn(['scheduled', 'completed', 'cancelled', 'no_show'])
      .withMessage('Statut invalide'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes doivent être une chaîne'),
    body('objectives')
      .optional()
      .isArray()
      .withMessage('Objectifs doivent être un tableau'),
    body('exercises')
      .optional()
      .isArray()
      .withMessage('Exercices doivent être un tableau'),
    body('evaluation')
      .optional()
      .isObject()
      .withMessage('Évaluation doit être un objet'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Vérifier que la séance appartient au praticien
      const existingSession = await prisma.session.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
      });

      if (!existingSession) {
        throw new CustomError('Séance non trouvée', 404);
      }

      // Convertir scheduledAt en Date si fournie
      if (updateData.scheduledAt) {
        updateData.scheduledAt = new Date(updateData.scheduledAt);
      }

      // Vérifier les conflits de planning si la date change
      if (updateData.scheduledAt || updateData.duration) {
        const scheduledAt =
          updateData.scheduledAt || existingSession.scheduledAt;
        const duration = updateData.duration || existingSession.duration;

        const conflictingSession = await prisma.session.findFirst({
          where: {
            id: { not: id },
            practitionerId: req.user!.id,
            status: { not: 'cancelled' },
            scheduledAt: {
              gte: new Date(new Date(scheduledAt).getTime() - duration * 60000),
              lte: new Date(new Date(scheduledAt).getTime() + duration * 60000),
            },
          },
        });

        if (conflictingSession) {
          throw new CustomError('Conflit de planning détecté', 409);
        }
      }

      const session = await prisma.session.update({
        where: { id },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Séance mise à jour avec succès',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/sessions/:id
// @desc    Supprimer une séance
// @access  Private
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('ID de séance invalide'), validateRequest],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Vérifier que la séance appartient au praticien
      const existingSession = await prisma.session.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
      });

      if (!existingSession) {
        throw new CustomError('Séance non trouvée', 404);
      }

      await prisma.session.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Séance supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
