// Composant de statistiques de session - Story 2.6
import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  BarChart3,
  Weight,
  Target,
  TrendingUp,
  Calendar,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { ExerciseStats } from '@/types/exercise';

interface SessionStatisticsProps {
  stats: ExerciseStats;
  sessionDate: Date;
  className?: string;
}

const SessionStatistics: React.FC<SessionStatisticsProps> = ({
  stats,
  sessionDate,
  className = '',
}) => {
  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return 'Facile';
    if (intensity <= 6) return 'Modéré';
    if (intensity <= 8) return 'Difficile';
    return 'Intense';
  };

  const getIntensityPercentage = (intensity: number) => {
    return (intensity / 10) * 100;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDurationInHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h${remainingMinutes > 0 ? remainingMinutes.toString().padStart(2, '0') : ''}`;
    }
    return `${minutes}min`;
  };

  const getCaloriesPerMinute = () => {
    if (stats.totalDuration > 0) {
      return Math.round((stats.caloriesBurned / stats.totalDuration) * 10) / 10;
    }
    return 0;
  };

  const getAverageWeightPerSet = () => {
    if (stats.totalWeight && stats.exerciseCount > 0) {
      return Math.round((stats.totalWeight / stats.exerciseCount) * 10) / 10;
    }
    return 0;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée totale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {getDurationInHours(stats.totalDuration)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.totalDuration} minutes
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Intensité moyenne
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.averageIntensity}/10
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getIntensityLabel(stats.averageIntensity)}
              </div>
              <Progress
                value={getIntensityPercentage(stats.averageIntensity)}
                className="mt-2"
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Exercices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.exerciseCount}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.exerciseCount > 0
                  ? `${Math.round(stats.totalDuration / stats.exerciseCount)}min/exercice`
                  : 'Aucun exercice'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Calories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats.caloriesBurned}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getCaloriesPerMinute()} kcal/min
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Poids total (si applicable) */}
        {stats.totalWeight && stats.totalWeight > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Weight className="w-5 h-5" />
                  Poids total soulevé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalWeight} kg
                </div>
                <div className="text-sm text-gray-600">
                  Moyenne: {getAverageWeightPerSet()} kg par exercice
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Distribution d'intensité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Distribution d'intensité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.intensityDistribution.length > 0 ? (
                  <>
                    <div className="text-sm text-gray-600">
                      Intensité minimale:{' '}
                      {Math.min(...stats.intensityDistribution)}/10
                    </div>
                    <div className="text-sm text-gray-600">
                      Intensité maximale:{' '}
                      {Math.max(...stats.intensityDistribution)}/10
                    </div>
                    <div className="text-sm text-gray-600">
                      Écart:{' '}
                      {Math.max(...stats.intensityDistribution) -
                        Math.min(...stats.intensityDistribution)}{' '}
                      points
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    Aucune donnée d'intensité disponible
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Informations de session */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Informations de session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Date
                </div>
                <div className="text-lg text-gray-900">
                  {formatDate(sessionDate)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">
                  Heure
                </div>
                <div className="text-lg text-gray-900">
                  {formatTime(sessionDate)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges de performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.averageIntensity >= 8 && (
                <Badge variant="secondary" className="bg-red-100 text-red-800">
                  Session intense
                </Badge>
              )}
              {stats.totalDuration >= 60 && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800"
                >
                  Session longue
                </Badge>
              )}
              {stats.exerciseCount >= 5 && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Nombreux exercices
                </Badge>
              )}
              {stats.caloriesBurned >= 300 && (
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-800"
                >
                  Calories élevées
                </Badge>
              )}
              {stats.totalWeight && stats.totalWeight >= 1000 && (
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-800"
                >
                  Poids important
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SessionStatistics;
