// Composant de liste d'exercices avec drag & drop - Story 2.3
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Edit,
  Trash2,
  Clock,
  Zap,
  Weight,
  Repeat,
  MoreVertical,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useExercises } from '@/hooks/useExercises';
import { Exercise, EXERCISE_TYPE_OPTIONS } from '@/types/exercise';

interface ExerciseListProps {
  sessionId: string;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  className?: string;
}

interface ExerciseItemProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
}

// Composant d'item d'exercice sortable
const SortableExerciseItem: React.FC<ExerciseItemProps> = ({
  exercise,
  onEdit,
  onDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: exercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getTypeOption = (type: string) => {
    return (
      EXERCISE_TYPE_OPTIONS.find(option => option.value === type) ||
      EXERCISE_TYPE_OPTIONS[EXERCISE_TYPE_OPTIONS.length - 1]
    );
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 3) return 'text-green-600 bg-green-100';
    if (intensity <= 6) return 'text-yellow-600 bg-yellow-100';
    if (intensity <= 8) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getIntensityLabel = (value: number) => {
    const labels = {
      1: 'Très facile',
      2: 'Facile',
      3: 'Léger',
      4: 'Modéré',
      5: 'Moyen',
      6: 'Soutenu',
      7: 'Difficile',
      8: 'Très difficile',
      9: 'Extrême',
      10: 'Maximum',
    };
    return labels[value as keyof typeof labels] || value.toString();
  };

  const typeOption = getTypeOption(exercise.exerciseType);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card
        className={`transition-all duration-200 ${
          isDragging
            ? 'shadow-lg border-blue-300'
            : 'hover:shadow-md border-gray-200'
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Handle de drag */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <GripVertical className="w-4 h-4" />
            </div>

            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 truncate">
                  {exercise.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${typeOption.color} text-xs`}
                  >
                    {typeOption.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${getIntensityColor(exercise.intensity)} text-xs`}
                  >
                    {exercise.intensity}/10
                  </Badge>
                </div>
              </div>

              {/* Détails de l'exercice */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{exercise.duration}min</span>
                </div>

                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>{getIntensityLabel(exercise.intensity)}</span>
                </div>

                {exercise.weight && exercise.sets && exercise.reps && (
                  <>
                    <div className="flex items-center gap-1">
                      <Weight className="w-4 h-4" />
                      <span>{exercise.weight}kg</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Repeat className="w-4 h-4" />
                      <span>
                        {exercise.sets}x{exercise.reps}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Notes */}
              {exercise.notes && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  {exercise.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(exercise)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Edit className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(exercise)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(exercise)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant principal de la liste
const ExerciseList: React.FC<ExerciseListProps> = ({
  sessionId,
  onEdit,
  onDelete,
  className = '',
}) => {
  const { toast } = useToast();
  const { exercises, isLoading, error, reorderExercises } =
    useExercises(sessionId);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = exercises.findIndex(item => item.id === active.id);
    const newIndex = exercises.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newExercises = arrayMove(exercises, oldIndex, newIndex);
    setIsReordering(true);

    try {
      await reorderExercises(newExercises);
      toast({
        title: 'Ordre mis à jour',
        description: "L'ordre des exercices a été modifié avec succès.",
      });
    } catch {
      toast({
        title: 'Erreur',
        description:
          'Impossible de réorganiser les exercices. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsReordering(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Chargement des exercices...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <span>Erreur lors du chargement des exercices: {error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">
                  Aucun exercice
                </h3>
                <p className="text-sm">
                  Commencez par ajouter votre premier exercice à cette session.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Exercices ({exercises.length})
        </h2>
        {isReordering && (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span>Mise à jour de l'ordre...</span>
          </div>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises.map(ex => ex.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatePresence>
            {exercises.map(exercise => (
              <SortableExerciseItem
                key={exercise.id}
                exercise={exercise}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {/* Instructions de drag & drop */}
      <div className="text-center text-sm text-gray-500 py-2">
        <div className="flex items-center justify-center gap-1">
          <GripVertical className="w-4 h-4" />
          <span>Glissez-déposez pour réorganiser les exercices</span>
        </div>
      </div>
    </div>
  );
};

export default ExerciseList;
