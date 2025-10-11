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

// @route   GET /api/patients
// @desc    Obtenir la liste des patients du praticien
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
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('La recherche ne peut pas être vide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const skip = (page - 1) * limit;

      const whereClause: any = {
        practitionerId: req.user!.id,
      };

      // Ajouter la recherche si fournie
      if (search) {
        whereClause.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where: whereClause,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            birthDate: true,
            phone: true,
            email: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                sessions: true,
                invoices: true,
              },
            },
          },
        }),
        prisma.patient.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: patients,
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

// @route   GET /api/patients/:id
// @desc    Obtenir un patient spécifique
// @access  Private
router.get(
  '/:id',
  [param('id').isUUID().withMessage('ID de patient invalide'), validateRequest],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const patient = await prisma.patient.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
        include: {
          sessions: {
            orderBy: { scheduledAt: 'desc' },
            take: 10,
            select: {
              id: true,
              scheduledAt: true,
              duration: true,
              status: true,
              notes: true,
            },
          },
          invoices: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              id: true,
              invoiceNumber: true,
              amount: true,
              status: true,
              dueDate: true,
              createdAt: true,
            },
          },
          documents: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              filename: true,
              fileType: true,
              fileSize: true,
              category: true,
              createdAt: true,
            },
          },
        },
      });

      if (!patient) {
        throw new CustomError('Patient non trouvé', 404);
      }

      res.json({
        success: true,
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/patients
// @desc    Créer un nouveau patient
// @access  Private
router.post(
  '/',
  [
    body('firstName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Le prénom doit contenir au moins 2 caractères'),
    body('lastName')
      .trim()
      .isLength({ min: 2 })
      .withMessage('Le nom doit contenir au moins 2 caractères'),
    body('birthDate').isISO8601().withMessage('Date de naissance invalide'),
    body('phone')
      .optional()
      .isMobilePhone('fr-FR')
      .withMessage('Numéro de téléphone invalide'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('address')
      .optional()
      .isObject()
      .withMessage('Adresse doit être un objet'),
    body('medicalHistory')
      .optional()
      .isString()
      .withMessage('Historique médical doit être une chaîne'),
    body('emergencyContact')
      .optional()
      .isObject()
      .withMessage("Contact d'urgence doit être un objet"),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const {
        firstName,
        lastName,
        birthDate,
        phone,
        email,
        address,
        medicalHistory,
        emergencyContact,
      } = req.body;

      const patient = await prisma.patient.create({
        data: {
          practitionerId: req.user!.id,
          firstName,
          lastName,
          birthDate: new Date(birthDate),
          phone,
          email,
          address: address || {},
          medicalHistory,
          emergencyContact: emergencyContact || {},
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          phone: true,
          email: true,
          address: true,
          medicalHistory: true,
          emergencyContact: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Patient créé avec succès',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/patients/:id
// @desc    Mettre à jour un patient
// @access  Private
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de patient invalide'),
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Le prénom doit contenir au moins 2 caractères'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2 })
      .withMessage('Le nom doit contenir au moins 2 caractères'),
    body('birthDate')
      .optional()
      .isISO8601()
      .withMessage('Date de naissance invalide'),
    body('phone')
      .optional()
      .isMobilePhone('fr-FR')
      .withMessage('Numéro de téléphone invalide'),
    body('email').optional().isEmail().withMessage('Email invalide'),
    body('address')
      .optional()
      .isObject()
      .withMessage('Adresse doit être un objet'),
    body('medicalHistory')
      .optional()
      .isString()
      .withMessage('Historique médical doit être une chaîne'),
    body('emergencyContact')
      .optional()
      .isObject()
      .withMessage("Contact d'urgence doit être un objet"),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Vérifier que le patient appartient au praticien
      const existingPatient = await prisma.patient.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
      });

      if (!existingPatient) {
        throw new CustomError('Patient non trouvé', 404);
      }

      // Convertir birthDate en Date si fournie
      if (updateData.birthDate) {
        updateData.birthDate = new Date(updateData.birthDate);
      }

      const patient = await prisma.patient.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          birthDate: true,
          phone: true,
          email: true,
          address: true,
          medicalHistory: true,
          emergencyContact: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'Patient mis à jour avec succès',
        data: patient,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/patients/:id
// @desc    Supprimer un patient
// @access  Private
router.delete(
  '/:id',
  [param('id').isUUID().withMessage('ID de patient invalide'), validateRequest],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Vérifier que le patient appartient au praticien
      const existingPatient = await prisma.patient.findFirst({
        where: {
          id,
          practitionerId: req.user!.id,
        },
      });

      if (!existingPatient) {
        throw new CustomError('Patient non trouvé', 404);
      }

      await prisma.patient.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Patient supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
