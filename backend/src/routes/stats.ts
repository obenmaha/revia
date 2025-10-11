import express from 'express';
import { query, validationResult } from 'express-validator';
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

// @route   GET /api/stats/dashboard
// @desc    Obtenir les statistiques du tableau de bord
// @access  Private
router.get('/dashboard', async (req, res, next) => {
  try {
    const practitionerId = req.user!.id;
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Statistiques du jour
    const todayStats = await prisma.session.aggregate({
      where: {
        practitionerId,
        scheduledAt: {
          gte: startOfDay,
          lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _count: true,
      _sum: {
        duration: true,
      },
    });

    // Statistiques de la semaine
    const weekStats = await prisma.session.aggregate({
      where: {
        practitionerId,
        scheduledAt: {
          gte: startOfWeek,
        },
      },
      _count: true,
      _sum: {
        duration: true,
      },
    });

    // Statistiques du mois
    const monthStats = await prisma.session.aggregate({
      where: {
        practitionerId,
        scheduledAt: {
          gte: startOfMonth,
        },
      },
      _count: true,
      _sum: {
        duration: true,
      },
    });

    // Nombre total de patients
    const totalPatients = await prisma.patient.count({
      where: { practitionerId },
    });

    // Patients actifs (avec au moins une séance dans les 30 derniers jours)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const activePatients = await prisma.patient.count({
      where: {
        practitionerId,
        sessions: {
          some: {
            scheduledAt: {
              gte: thirtyDaysAgo,
            },
          },
        },
      },
    });

    // Revenus du mois
    const monthlyRevenue = await prisma.invoice.aggregate({
      where: {
        practitionerId,
        status: 'paid',
        paidAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Séances à venir (prochaines 7 jours)
    const upcomingSessions = await prisma.session.findMany({
      where: {
        practitionerId,
        status: 'scheduled',
        scheduledAt: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        today: {
          sessions: todayStats._count,
          duration: todayStats._sum.duration || 0,
        },
        week: {
          sessions: weekStats._count,
          duration: weekStats._sum.duration || 0,
        },
        month: {
          sessions: monthStats._count,
          duration: monthStats._sum.duration || 0,
        },
        patients: {
          total: totalPatients,
          active: activePatients,
        },
        revenue: {
          monthly: monthlyRevenue._sum.amount || 0,
        },
        upcomingSessions,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/stats/sessions
// @desc    Obtenir les statistiques des séances
// @access  Private
router.get(
  '/sessions',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Date de début invalide'),
    query('endDate').optional().isISO8601().withMessage('Date de fin invalide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const practitionerId = req.user!.id;
      const { startDate, endDate } = req.query;

      const whereClause: any = {
        practitionerId,
      };

      if (startDate || endDate) {
        whereClause.scheduledAt = {};
        if (startDate)
          whereClause.scheduledAt.gte = new Date(startDate as string);
        if (endDate) whereClause.scheduledAt.lte = new Date(endDate as string);
      }

      // Statistiques par statut
      const statusStats = await prisma.session.groupBy({
        by: ['status'],
        where: whereClause,
        _count: true,
      });

      // Statistiques par jour de la semaine
      const dayOfWeekStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(DOW FROM "scheduled_at") as day_of_week,
        COUNT(*) as count
      FROM sessions 
      WHERE "practitioner_id" = ${practitionerId}
      ${startDate ? `AND "scheduled_at" >= ${new Date(startDate as string)}` : ''}
      ${endDate ? `AND "scheduled_at" <= ${new Date(endDate as string)}` : ''}
      GROUP BY EXTRACT(DOW FROM "scheduled_at")
      ORDER BY day_of_week
    `;

      // Durée moyenne des séances
      const avgDuration = await prisma.session.aggregate({
        where: whereClause,
        _avg: {
          duration: true,
        },
      });

      res.json({
        success: true,
        data: {
          statusStats,
          dayOfWeekStats,
          avgDuration: avgDuration._avg.duration || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// @route   GET /api/stats/patients
// @desc    Obtenir les statistiques des patients
// @access  Private
router.get('/patients', async (req, res, next) => {
  try {
    const practitionerId = req.user!.id;

    // Patients par mois d'inscription
    const patientsByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "created_at") as month,
        COUNT(*) as count
      FROM patients 
      WHERE "practitioner_id" = ${practitionerId}
      GROUP BY DATE_TRUNC('month', "created_at")
      ORDER BY month DESC
      LIMIT 12
    `;

    // Âge moyen des patients
    const avgAge = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(YEAR FROM AGE("birth_date"))) as avg_age
      FROM patients 
      WHERE "practitioner_id" = ${practitionerId}
    `;

    // Patients les plus actifs
    const mostActivePatients = await prisma.patient.findMany({
      where: { practitionerId },
      include: {
        _count: {
          select: {
            sessions: true,
          },
        },
      },
      orderBy: {
        sessions: {
          _count: 'desc',
        },
      },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        _count: {
          select: {
            sessions: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        patientsByMonth,
        avgAge: avgAge[0]?.avg_age || 0,
        mostActivePatients,
      },
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/stats/revenue
// @desc    Obtenir les statistiques de revenus
// @access  Private
router.get(
  '/revenue',
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Date de début invalide'),
    query('endDate').optional().isISO8601().withMessage('Date de fin invalide'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const practitionerId = req.user!.id;
      const { startDate, endDate } = req.query;

      const whereClause: any = {
        practitionerId,
      };

      if (startDate || endDate) {
        whereClause.paidAt = {};
        if (startDate) whereClause.paidAt.gte = new Date(startDate as string);
        if (endDate) whereClause.paidAt.lte = new Date(endDate as string);
      }

      // Revenus par mois
      const revenueByMonth = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "paid_at") as month,
        SUM(amount) as total
      FROM invoices 
      WHERE "practitioner_id" = ${practitionerId}
      AND status = 'paid'
      ${startDate ? `AND "paid_at" >= ${new Date(startDate as string)}` : ''}
      ${endDate ? `AND "paid_at" <= ${new Date(endDate as string)}` : ''}
      GROUP BY DATE_TRUNC('month', "paid_at")
      ORDER BY month DESC
      LIMIT 12
    `;

      // Statistiques des factures
      const invoiceStats = await prisma.invoice.groupBy({
        by: ['status'],
        where: {
          practitionerId,
          ...(startDate || endDate
            ? {
                createdAt: {
                  ...(startDate ? { gte: new Date(startDate as string) } : {}),
                  ...(endDate ? { lte: new Date(endDate as string) } : {}),
                },
              }
            : {}),
        },
        _count: true,
        _sum: {
          amount: true,
        },
      });

      // Montant total des revenus
      const totalRevenue = await prisma.invoice.aggregate({
        where: {
          practitionerId,
          status: 'paid',
          ...(startDate || endDate
            ? {
                paidAt: {
                  ...(startDate ? { gte: new Date(startDate as string) } : {}),
                  ...(endDate ? { lte: new Date(endDate as string) } : {}),
                },
              }
            : {}),
        },
        _sum: {
          amount: true,
        },
      });

      res.json({
        success: true,
        data: {
          revenueByMonth,
          invoiceStats,
          totalRevenue: totalRevenue._sum.amount || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
