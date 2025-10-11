// Composant principal de gestion des exercices - Story 2.3
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BarChart3, Clock, Zap, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useExercises, useExerciseStats } from '@/hooks/useExercises';
import { Exercise } from '@/types/exercise';
import ExerciseForm from './ExerciseForm';
import ExerciseList from './ExerciseList';

interface ExerciseManagerProps {
  sessionId: string;
  className?: string;
}

const ExerciseManager: React.FC<ExerciseManagerProps> = ({
  sessionId,
  className = '',
}) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [_editingExercise, setEditingExercise] = useState<Exercise | null>(
    null
  );
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null
  );

  const { exercises, isLoading, deleteExercise } = useExercises(sessionId);

  const { stats } = useExerciseStats(sessionId);

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    setDeletingExercise(exercise);
  };

  const confirmDeleteExercise = async () => {
    if (!deletingExercise) return;

    try {
      await deleteExercise(deletingExercise.id);
      setDeletingExercise(null);
      toast({
        title: 'Exercice supprimé',
        description: "L'exercice a été supprimé avec succès.",
      });
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'exercice. Veuillez réessayer.",
        variant: 'destructive',
      });
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingExercise(null);
  };

  // Statistiques calculées
  const totalWeight = exercises.reduce(
    (sum, ex) => sum + (ex.weight || 0) * (ex.sets || 0) * (ex.reps || 0),
    0
  );

  const caloriesBurned = exercises.reduce(
    (sum, ex) => sum + ex.duration * ex.intensity * 0.1,
    0
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête avec statistiques */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900">
              Gestion des exercices
            </CardTitle>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un exercice
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {/* Statistiques rapides */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalDuration}min
              </div>
              <div className="text-sm text-gray-600">Durée totale</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.averageIntensity}/10
              </div>
              <div className="text-sm text-gray-600">Intensité moyenne</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.exerciseCount}
              </div>
              <div className="text-sm text-gray-600">Exercices</div>
            </div>

            {totalWeight > 0 && (
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Weight className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {totalWeight}kg
                </div>
                <div className="text-sm text-gray-600">Poids total</div>
              </div>
            )}
          </div>

          {/* Détails supplémentaires */}
          {exercises.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-sm">
                Calories estimées: {Math.round(caloriesBurned)} kcal
              </Badge>
              {stats.intensityDistribution.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  Intensité min: {Math.min(...stats.intensityDistribution)}/10
                </Badge>
              )}
              {stats.intensityDistribution.length > 0 && (
                <Badge variant="outline" className="text-sm">
                  Intensité max: {Math.max(...stats.intensityDistribution)}/10
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire d'ajout/modification */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <ExerciseForm
              sessionId={sessionId}
              onSuccess={handleFormSuccess}
              onCancel={handleCancelForm}
              isOpen={showForm}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des exercices */}
      <ExerciseList
        sessionId={sessionId}
        onEdit={handleEditExercise}
        onDelete={handleDeleteExercise}
      />

      {/* Modal de confirmation de suppression */}
      <AnimatePresence>
        {deletingExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setDeletingExercise(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supprimer l'exercice
              </h3>
              <p className="text-gray-600 mb-4">
                Êtes-vous sûr de vouloir supprimer l'exercice "
                {deletingExercise.name}" ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDeletingExercise(null)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDeleteExercise}
                  className="flex-1"
                >
                  Supprimer
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExerciseManager;
