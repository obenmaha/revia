// Composant de formulaire de session - Story 2.2
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Session,
  CreateSessionInput,
  SessionType,
  SESSION_TYPE_OPTIONS,
} from '../../types/session';
import { useSessionForm } from '../../hooks/useSessionForm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  CalendarIcon,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Interface pour les props du composant
interface SessionFormProps {
  sessionId?: string;
  onSave?: (session: Session) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
  showHeader?: boolean;
}

// Composant principal du formulaire
export function SessionForm({
  sessionId,
  onSave,
  onCancel,
  isReadOnly = false,
  showHeader = true,
}: SessionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { form, formState, saveSession, resetForm, isDirty, hasErrors } =
    useSessionForm(sessionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  // Gestion de la soumission du formulaire
  const onSubmit = async (_data: CreateSessionInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const savedSession = await saveSession();
      setSubmitSuccess(true);
      onSave?.(savedSession);

      // Reset du succès après 3 secondes
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Erreur inconnue'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir annuler ?'
      );
      if (!confirmed) return;
    }
    resetForm();
    onCancel?.();
  };

  // Gestion de la sélection de date
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setValue('date', date, { shouldDirty: true, shouldValidate: true });
    }
  };

  // Gestion de la sélection de type
  const handleTypeSelect = (type: string) => {
    setValue('type', type as SessionType, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  // Composant de sélection de date
  const DatePicker = () => {
    const selectedDate = watch('date');

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            disabled={isReadOnly}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? format(selectedDate, 'PPP', { locale: fr })
              : 'Sélectionner une date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={date =>
              date < new Date() ||
              date > new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Composant de sélection de type
  const TypeSelector = () => {
    const selectedType = watch('type');

    return (
      <Select
        value={selectedType}
        onValueChange={handleTypeSelect}
        disabled={isReadOnly}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Choisir le type d'activité" />
        </SelectTrigger>
        <SelectContent>
          {SESSION_TYPE_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${option.color}`}>
                  {option.icon === 'HeartPulse' && '❤️'}
                  {option.icon === 'Trophy' && '🏆'}
                  {option.icon === 'Dumbbell' && '🏋️'}
                  {option.icon === 'MoreHorizontal' && '⋯'}
                </span>
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };

  // Rendu du formulaire
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {showHeader && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {sessionId ? 'Modifier la session' : 'Nouvelle session'}
              </CardTitle>
            </CardHeader>
          </Card>
        )}

        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Nom de la session */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la session *</Label>
              <Input
                id="name"
                {...register('name')}
                disabled={isReadOnly}
                className={errors.name ? 'border-red-500' : ''}
                placeholder="Ex: Séance matin, Entraînement cardio..."
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Date et type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <DatePicker />
                {errors.date && (
                  <p className="text-sm text-red-500">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type d'activité *</Label>
                <TypeSelector />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
            </div>

            {/* Objectifs */}
            <div className="space-y-2">
              <Label htmlFor="objectives">Objectifs</Label>
              <Textarea
                id="objectives"
                {...register('objectives')}
                disabled={isReadOnly}
                className={errors.objectives ? 'border-red-500' : ''}
                placeholder="Décrivez les objectifs de cette session..."
                rows={3}
              />
              {errors.objectives && (
                <p className="text-sm text-red-500">
                  {errors.objectives.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {watch('objectives')?.length || 0}/500 caractères
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                disabled={isReadOnly}
                className={errors.notes ? 'border-red-500' : ''}
                placeholder="Notes supplémentaires..."
                rows={3}
              />
              {errors.notes && (
                <p className="text-sm text-red-500">{errors.notes.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {watch('notes')?.length || 0}/1000 caractères
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Messages de statut */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {submitSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Session sauvegardée avec succès !
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Boutons d'action */}
        {!isReadOnly && (
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || formState.isSaving || hasErrors}
              className="flex items-center gap-2"
            >
              {isSubmitting || formState.isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSubmitting ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        )}

        {/* Indicateur de sauvegarde automatique */}
        {formState.isSaving && (
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Sauvegarde automatique...
          </div>
        )}
      </form>
    </motion.div>
  );
}
