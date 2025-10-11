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

// @route   GET /api/documents
// @desc    Obtenir la liste des documents du praticien
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
    query('category')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Catégorie ne peut pas être vide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const { patientId, category } = req.query;

      const whereClause: any = {
        patient: {
          practitionerId: req.user!.id,
        },
      };

      // Filtres optionnels
      if (patientId) whereClause.patientId = patientId;
      if (category) whereClause.category = category;

      const [documents, total] = await Promise.all([
        prisma.document.findMany({
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
              },
            },
          },
        }),
        prisma.document.count({ where: whereClause }),
      ]);

      res.json({
        success: true,
        data: documents,
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

// @route   GET /api/documents/:id
// @desc    Obtenir un document spécifique
// @access  Private
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de document invalide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const document = await prisma.document.findFirst({
        where: {
          id,
          patient: {
            practitionerId: req.user!.id,
          },
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

      if (!document) {
        throw new CustomError('Document non trouvé', 404);
      }

      res.json({
        success: true,
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   POST /api/documents
// @desc    Créer un nouveau document
// @access  Private
router.post(
  '/',
  [
    body('patientId').isUUID().withMessage('ID de patient invalide'),
    body('filename')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Nom de fichier requis'),
    body('filePath')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Chemin de fichier requis'),
    body('fileType')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Type de fichier requis'),
    body('fileSize')
      .isInt({ min: 1 })
      .withMessage('Taille de fichier invalide'),
    body('category')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Catégorie ne peut pas être vide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { patientId, filename, filePath, fileType, fileSize, category } =
        req.body;

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

      const document = await prisma.document.create({
        data: {
          patientId,
          filename,
          filePath,
          fileType,
          fileSize,
          category,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        message: 'Document créé avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   PUT /api/documents/:id
// @desc    Mettre à jour un document
// @access  Private
router.put(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de document invalide'),
    body('filename')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Nom de fichier ne peut pas être vide'),
    body('category')
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage('Catégorie ne peut pas être vide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Vérifier que le document appartient au praticien
      const existingDocument = await prisma.document.findFirst({
        where: {
          id,
          patient: {
            practitionerId: req.user!.id,
          },
        },
      });

      if (!existingDocument) {
        throw new CustomError('Document non trouvé', 404);
      }

      const document = await prisma.document.update({
        where: { id },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: 'Document mis à jour avec succès',
        data: document,
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   DELETE /api/documents/:id
// @desc    Supprimer un document
// @access  Private
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('ID de document invalide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Vérifier que le document appartient au praticien
      const existingDocument = await prisma.document.findFirst({
        where: {
          id,
          patient: {
            practitionerId: req.user!.id,
          },
        },
      });

      if (!existingDocument) {
        throw new CustomError('Document non trouvé', 404);
      }

      await prisma.document.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: 'Document supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
