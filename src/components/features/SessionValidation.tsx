// Composant de validation de session - Story 2.4
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  Zap,
  BarChart3,
  Weight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useExercises, useExerciseStats } from '@/hooks/useExercises';
import { useSessions } from '@/hooks/useSessions';

interface SessionValidationProps {
  sessionId: string;
  onValidationComplete?: () => void;
  className?: string;
}

const SessionValidation: React.FC<SessionValidationProps> = ({
  sessionId,
  onValidationComplete,
  className = '',
}) => {
  const { toast } = useToast();
  const [isValidating, setIsValidating] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { exercises, isLoading: exercisesLoading } = useExercises(sessionId);
  const { stats, isLoading: statsLoading } = useExerciseStats(sessionId);
  const { updateSession } = useSessions();

  const isLoading = exercisesLoading || statsLoading;

  // Vérifier si la session peut être validée
  const canValidate = exercises.length > 0 && !isValidating;

  // Calculer les statistiques de validation
  const validationStats = {
    totalDuration: stats.totalDuration,
    averageIntensity: stats.averageIntensity,
    exerciseCount: stats.exerciseCount,
    totalWeight: stats.totalWeight,
    caloriesBurned: stats.caloriesBurned,
    intensityDistribution: stats.intensityDistribution,
  };

  const handleValidateSession = async () => {
    if (!canValidate) return;

    setIsValidating(true);
    try {
      // Mettre à jour le statut de la session
      await updateSession(sessionId, { status: 'completed' });

      toast({
        title: '🎉 Session validée !',
        description: 'Votre session a été validée avec succès. Félicitations !',
      });

      onValidationComplete?.();
    } catch {
      toast({
        title: 'Erreur de validation',
        description: 'Impossible de valider la session. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleConfirmValidation = () => {
    setShowConfirmation(true);
  };

  const handleCancelValidation = () => {
    setShowConfirmation(false);
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'text-green-600';
    if (intensity <= 6) return 'text-yellow-600';
    if (intensity <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  const getIntensityLabel = (intensity: number) => {
    if (intensity <= 3) return 'Facile';
    if (intensity <= 6) return 'Modéré';
    if (intensity <= 8) return 'Difficile';
    return 'Intense';
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span>Chargement des données...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Statistiques de la session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Résumé de votre session
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {validationStats.totalDuration}min
              </div>
              <div className="text-sm text-gray-600">Durée totale</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {validationStats.averageIntensity}/10
              </div>
              <div className="text-sm text-gray-600">Intensité moyenne</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {validationStats.exerciseCount}
              </div>
              <div className="text-sm text-gray-600">Exercices</div>
            </div>

            {validationStats.totalWeight && validationStats.totalWeight > 0 && (
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Weight className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {validationStats.totalWeight}kg
                </div>
                <div className="text-sm text-gray-600">Poids total</div>
              </div>
            )}
          </div>

          {/* Détails supplémentaires */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Intensité moyenne
              </span>
              <div className="flex items-center gap-2">
                <Progress
                  value={validationStats.averageIntensity * 10}
                  className="w-24"
                />
                <Badge
                  variant="outline"
                  className={`${getIntensityColor(validationStats.averageIntensity)}`}
                >
                  {getIntensityLabel(validationStats.averageIntensity)}
                </Badge>
              </div>
            </div>

            {validationStats.caloriesBurned > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Calories brûlées
                </span>
                <Badge variant="secondary" className="text-orange-600">
                  {validationStats.caloriesBurned} kcal
                </Badge>
              </div>
            )}

            {validationStats.intensityDistribution.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Intensité min/max
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-green-600">
                    Min: {Math.min(...validationStats.intensityDistribution)}/10
                  </Badge>
                  <Badge variant="outline" className="text-red-600">
                    Max: {Math.max(...validationStats.intensityDistribution)}/10
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bouton de validation */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {exercises.length === 0 ? (
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <AlertCircle className="w-8 h-8" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    Aucun exercice
                  </h3>
                  <p className="text-sm">
                    Ajoutez au moins un exercice pour valider votre session.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-medium">Prêt pour la validation</span>
                </div>

                <p className="text-gray-600">
                  Vous avez terminé {validationStats.exerciseCount} exercice
                  {validationStats.exerciseCount > 1 ? 's' : ''}
                  en {validationStats.totalDuration} minutes. Félicitations pour
                  votre effort !
                </p>

                <Button
                  onClick={handleConfirmValidation}
                  disabled={!canValidate}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Valider la session
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de confirmation */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={handleCancelValidation}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    🎉 Félicitations !
                  </h3>
                  <p className="text-gray-600">
                    Vous avez terminé votre session avec succès. Voulez-vous
                    confirmer la validation ?
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Durée totale:</span>
                    <span className="font-medium">
                      {validationStats.totalDuration} minutes
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Exercices:</span>
                    <span className="font-medium">
                      {validationStats.exerciseCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Intensité moyenne:</span>
                    <span className="font-medium">
                      {validationStats.averageIntensity}/10
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancelValidation}
                    className="flex-1"
                    disabled={isValidating}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleValidateSession}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={isValidating}
                  >
                    {isValidating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Confirmer
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SessionValidation;
