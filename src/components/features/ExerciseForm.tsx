// Composant de formulaire d'exercice - Story 2.3
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useExerciseForm } from '@/hooks/useExercises';
import {
  EXERCISE_TYPE_OPTIONS,
  EXERCISE_VALIDATION_RULES,
} from '@/types/exercise';
import { createExerciseSchema } from '@/types/exercise';

interface ExerciseFormProps {
  sessionId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
}

interface FormData {
  name: string;
  duration: number;
  intensity: number;
  painLevel?: number;
  weight?: number;
  sets?: number;
  reps?: number;
  notes?: string;
  exerciseType: 'cardio' | 'musculation' | 'etirement' | 'autre';
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({
  sessionId,
  onSuccess,
  onCancel,
  isOpen = true,
}) => {
  const { toast } = useToast();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isLoading, updateField, validateField, saveExercise, resetForm } =
    useExerciseForm(sessionId);

  // Configuration du formulaire avec React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors: formErrors, isDirty: formIsDirty },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(
      createExerciseSchema.omit({ sessionId: true, orderIndex: true })
    ),
    defaultValues: {
      name: '',
      duration: 30,
      intensity: 5,
      painLevel: 0,
      exerciseType: 'cardio',
    },
  });

  const watchedType = watch('exerciseType');
  const watchedIntensity = watch('intensity');
  const watchedPainLevel = watch('painLevel') || 0;

  // Mise à jour des champs requis selon le type d'exercice
  useEffect(() => {
    const rules = EXERCISE_VALIDATION_RULES[watchedType];
    if (rules) {
      // Réinitialiser les champs optionnels si le type change
      if (watchedType !== 'musculation') {
        setValue('weight', undefined);
        setValue('sets', undefined);
        setValue('reps', undefined);
      }
    }
  }, [watchedType, setValue]);

  // Validation en temps réel
  const handleFieldChange = (field: keyof FormData, value: unknown) => {
    setValue(field, value, { shouldDirty: true });
    updateField(field, value);

    // Validation immédiate
    const fieldErrors = validateField(field);
    if (fieldErrors.length > 0) {
      // Afficher l'erreur dans le toast
      toast({
        title: 'Erreur de validation',
        description: fieldErrors[0],
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (_data: FormData) => {
    setIsSubmitting(true);
    try {
      await saveExercise();
      toast({
        title: 'Exercice ajouté',
        description: "L'exercice a été ajouté avec succès à votre session.",
      });
      reset();
      onSuccess?.();
    } catch {
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter l'exercice. Veuillez réessayer.",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    resetForm();
    onCancel?.();
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

  const getIntensityColor = (value: number) => {
    if (value <= 3) return 'text-green-600';
    if (value <= 6) return 'text-yellow-600';
    if (value <= 8) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Ajouter un exercice
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Type d'exercice */}
              <div className="space-y-2">
                <Label
                  htmlFor="exerciseType"
                  className="text-sm font-medium text-gray-700"
                >
                  Type d'exercice *
                </Label>
                <Select
                  value={watchedType}
                  onValueChange={value =>
                    handleFieldChange('exerciseType', value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span className={option.color}>●</span>
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.exerciseType && (
                  <p className="text-sm text-red-600">
                    {formErrors.exerciseType.message}
                  </p>
                )}
              </div>

              {/* Nom de l'exercice */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700"
                >
                  Nom de l'exercice *
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="Ex: Squats, Course, Étirements..."
                  className="w-full"
                  onChange={e => handleFieldChange('name', e.target.value)}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600">
                    {formErrors.name.message}
                  </p>
                )}
              </div>

              {/* Durée et Intensité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-sm font-medium text-gray-700"
                  >
                    Durée (minutes) *
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    max="300"
                    {...register('duration', { valueAsNumber: true })}
                    onChange={e =>
                      handleFieldChange('duration', parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                  {formErrors.duration && (
                    <p className="text-sm text-red-600">
                      {formErrors.duration.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Intensité RPE *
                  </Label>
                  <div className="space-y-2">
                    <Slider
                      value={[watchedIntensity]}
                      onValueChange={([value]) =>
                        handleFieldChange('intensity', value)
                      }
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">1</span>
                      <Badge
                        variant="secondary"
                        className={`${getIntensityColor(watchedIntensity)} font-medium`}
                      >
                        {watchedIntensity} -{' '}
                        {getIntensityLabel(watchedIntensity)}
                      </Badge>
                      <span className="text-sm text-gray-500">10</span>
                    </div>
                  </div>
                  {formErrors.intensity && (
                    <p className="text-sm text-red-600">
                      {formErrors.intensity.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Niveau de douleur */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  Niveau de douleur (0 = aucune, 10 = maximale)
                </Label>
                <div className="space-y-2">
                  <Slider
                    value={[watchedPainLevel]}
                    onValueChange={([value]) =>
                      handleFieldChange('painLevel', value)
                    }
                    max={10}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">0</span>
                    <Badge
                      variant="secondary"
                      className={`${watchedPainLevel === 0 ? 'text-green-600' : watchedPainLevel <= 3 ? 'text-yellow-600' : watchedPainLevel <= 6 ? 'text-orange-600' : 'text-red-600'} font-medium`}
                    >
                      {watchedPainLevel} -{' '}
                      {watchedPainLevel === 0
                        ? 'Aucune douleur'
                        : watchedPainLevel <= 3
                          ? 'Légère'
                          : watchedPainLevel <= 6
                            ? 'Modérée'
                            : watchedPainLevel <= 8
                              ? 'Importante'
                              : 'Sévère'}
                    </Badge>
                    <span className="text-sm text-gray-500">10</span>
                  </div>
                </div>
                {formErrors.painLevel && (
                  <p className="text-sm text-red-600">
                    {formErrors.painLevel.message}
                  </p>
                )}
              </div>

              {/* Champs avancés pour la musculation */}
              {watchedType === 'musculation' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <h4 className="font-medium text-blue-900">
                    Détails musculation
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="weight"
                        className="text-sm font-medium text-gray-700"
                      >
                        Poids (kg) *
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        min="0"
                        max="1000"
                        step="0.5"
                        {...register('weight', { valueAsNumber: true })}
                        onChange={e =>
                          handleFieldChange(
                            'weight',
                            parseFloat(e.target.value)
                          )
                        }
                        className="w-full"
                      />
                      {formErrors.weight && (
                        <p className="text-sm text-red-600">
                          {formErrors.weight.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="sets"
                        className="text-sm font-medium text-gray-700"
                      >
                        Séries *
                      </Label>
                      <Input
                        id="sets"
                        type="number"
                        min="1"
                        max="100"
                        {...register('sets', { valueAsNumber: true })}
                        onChange={e =>
                          handleFieldChange('sets', parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                      {formErrors.sets && (
                        <p className="text-sm text-red-600">
                          {formErrors.sets.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="reps"
                        className="text-sm font-medium text-gray-700"
                      >
                        Répétitions *
                      </Label>
                      <Input
                        id="reps"
                        type="number"
                        min="1"
                        max="1000"
                        {...register('reps', { valueAsNumber: true })}
                        onChange={e =>
                          handleFieldChange('reps', parseInt(e.target.value))
                        }
                        className="w-full"
                      />
                      {formErrors.reps && (
                        <p className="text-sm text-red-600">
                          {formErrors.reps.message}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bouton pour afficher/masquer les champs avancés */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {showAdvanced ? 'Masquer' : 'Afficher'} les options avancées
                </Button>
              </div>

              {/* Champs avancés */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 p-4 bg-gray-50 rounded-lg border"
                  >
                    <h4 className="font-medium text-gray-900">
                      Options avancées
                    </h4>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="text-sm font-medium text-gray-700"
                      >
                        Notes (optionnel)
                      </Label>
                      <Textarea
                        id="notes"
                        {...register('notes')}
                        placeholder="Ajoutez des notes sur l'exercice..."
                        className="w-full"
                        rows={3}
                        onChange={e =>
                          handleFieldChange('notes', e.target.value)
                        }
                      />
                      {formErrors.notes && (
                        <p className="text-sm text-red-600">
                          {formErrors.notes.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    resetForm();
                  }}
                  className="flex-1"
                  disabled={isSubmitting || !formIsDirty}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>

                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Ajout en cours...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Ajouter l'exercice
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExerciseForm;
