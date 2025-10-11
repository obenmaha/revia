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

// @route   GET /api/invoices
// @desc    Obtenir la liste des factures du praticien
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
      .isIn(['draft', 'sent', 'paid', 'overdue'])
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
        whereClause.createdAt = {};
        if (startDate)
          whereClause.createdAt.gte = new Date(startDate as string);
        if (endDate) whereClause.createdAt.lte = new Date(endDate as string);
      }

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            sessions: {
              select: {
                id: true,
                scheduledAt: true,
                duration: true,
                status: true,
              },
            },
            payments: {
              select: {
                id: true,
                amount: true,
                method: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.invoice.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: invoices,
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

// @route   GET /api/invoices/:id
// @desc    Obtenir une facture spécifique
// @access  Private
router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID de facture invalide'), validateRequest],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const invoice = await prisma.invoice.findFirst({
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
              address: true,
            },
          },
          sessions: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
              notes: true,
            },
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              amount: true,
              method: true,
              reference: true,
              createdAt: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new CustomError('Facture non trouvée', 404);
      }

      res.json({
        success: true,
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/invoices
// @desc    Créer une nouvelle facture
// @access  Private
router.post(
  '/',
  [
    body('patientId').isUUID().withMessage('ID de patient invalide'),
    body('sessionIds').isArray().withMessage('IDs de séances requis'),
    body('sessionIds.*').isUUID().withMessage('ID de séance invalide'),
    body('dueDate').isISO8601().withMessage("Date d'échéance invalide"),
    body('amount').optional().isDecimal().withMessage('Montant invalide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { patientId, sessionIds, dueDate, amount } = req.body;

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

      // Vérifier que les séances appartiennent au praticien et au patient
      const sessions = await prisma.session.findMany({
        where: {
          id: { in: sessionIds },
          practitionerId: req.user!.id,
          patientId,
        },
      });

      if (sessions.length !== sessionIds.length) {
        throw new CustomError('Certaines séances ne sont pas valides', 400);
      }

      // Calculer le montant si non fourni (tarif par défaut de 25€/séance)
      const calculatedAmount = amount || sessions.length * 25;

      const invoice = await prisma.invoice.create({
        data: {
          patientId,
          practitionerId: req.user!.id,
          amount: calculatedAmount,
          dueDate: new Date(dueDate),
          sessions: {
            connect: sessionIds.map((id: string) => ({ id })),
          },
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
          sessions: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Facture créée avec succès',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/invoices/:id
// @desc    Mettre à jour une facture
// @access  Private
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de facture invalide'),
    body('status')
      .optional()
      .isIn(['draft', 'sent', 'paid', 'overdue'])
      .withMessage('Statut invalide'),
    body('amount').optional().isDecimal().withMessage('Montant invalide'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage("Date d'échéance invalide"),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Vérifier que la facture appartient au praticien
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
      });

      if (!existingInvoice) {
        throw new CustomError('Facture non trouvée', 404);
      }

      // Convertir dueDate en Date si fournie
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      // Marquer comme payée si le statut passe à 'paid'
      if (updateData.status === 'paid' && existingInvoice.status !== 'paid') {
        updateData.paidAt = new Date();
      }

      const invoice = await prisma.invoice.update({
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
          sessions: {
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Facture mise à jour avec succès',
        data: invoice,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/invoices/:id
// @desc    Supprimer une facture
// @access  Private
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('ID de facture invalide'), validateRequest],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Vérifier que la facture appartient au praticien
      const existingInvoice = await prisma.invoice.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
      });

      if (!existingInvoice) {
        throw new CustomError('Facture non trouvée', 404);
      }

      await prisma.invoice.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Facture supprimée avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
