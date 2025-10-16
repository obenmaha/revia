import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { Checkbox } from '../components/ui/checkbox';
import { CalendarIcon, Clock, Dumbbell, Copy } from 'lucide-react';
import { formatDate, formatTime, frenchLocale } from '../utils/dateUtils';
import { cn } from '../lib/utils';
import { generateDuplicateDates } from '../utils/duplicateDates';
import { SessionService } from '../services/sessionService';
import type { CreateSessionInput } from '../types/session';
import { analytics } from '../lib/analytics';

interface SessionFormData {
  name: string;
  type: string;
  date: Date;
  time: string;
  duration: number;
  objectives: string;
  notes: string;
  duplicateEnabled: boolean;
  duplicateType: 'daily' | 'every-other-day' | 'weekly';
  duplicateEndDate: Date | null;
  duplicateCount: number;
}

const sessionTypes = [
  { value: 'cardio', label: 'Cardio', icon: '🏃‍♂️' },
  { value: 'musculation', label: 'Musculation', icon: '💪' },
  { value: 'yoga', label: 'Yoga', icon: '🧘‍♀️' },
  { value: 'autre', label: 'Autre', icon: '🏋️‍♀️' },
];

const duplicateTypes = [
  { value: 'daily', label: 'Quotidien', description: 'Tous les jours' },
  { value: 'every-other-day', label: '1 jour sur 2', description: 'Un jour sur deux' },
  { value: 'weekly', label: 'Hebdomadaire', description: 'Toutes les semaines' },
];

export function NewSessionPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<SessionFormData>({
    name: '',
    type: '',
    date: new Date(),
    time: '',
    duration: 30,
    objectives: '',
    notes: '',
    duplicateEnabled: false,
    duplicateType: 'daily',
    duplicateEndDate: null,
    duplicateCount: 7,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateDates, setDuplicateDates] = useState<Date[]>([]);

  const handleInputChange = (field: keyof SessionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Recalculer les dates de duplication si nécessaire
    if (field === 'duplicateEnabled' || field === 'duplicateType' || 
        field === 'duplicateEndDate' || field === 'duplicateCount' || field === 'date') {
      updateDuplicateDates();
    }
  };

  const updateDuplicateDates = () => {
    if (!formData.duplicateEnabled) {
      setDuplicateDates([]);
      return;
    }

    const dates = generateDuplicateDates({
      startDate: formData.date,
      type: formData.duplicateType,
      endDate: formData.duplicateEndDate,
      count: formData.duplicateCount,
    });

    setDuplicateDates(dates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données de la session
      const sessionData: CreateSessionInput = {
        name: formData.name,
        date: formData.date,
        type: formData.type,
        objectives: formData.objectives,
        notes: formData.notes,
      };

      if (formData.duplicateEnabled && duplicateDates.length > 1) {
        // Créer plusieurs sessions avec duplication
        const duplicateOptions = {
          startDate: formData.date,
          type: formData.duplicateType,
          endDate: formData.duplicateEndDate,
          count: formData.duplicateCount,
        };

        const createdSessions = await SessionService.duplicateSession(
          sessionData,
          duplicateOptions
        );

        console.log(`${createdSessions.length} séances créées avec duplication`);
        
        // Analytics: Session créée avec duplication
        analytics.track('session_created', {
          session_type: formData.type as 'cardio' | 'strength' | 'flexibility' | 'sport',
          has_duplicates: true,
          duplicate_type: formData.duplicateType,
          duplicate_count: createdSessions.length
        });
      } else {
        // Créer une seule session
        const createdSession = await SessionService.createSession(sessionData);
        console.log('Séance créée:', createdSession);
        
        // Analytics: Session créée simple
        analytics.track('session_created', {
          session_type: formData.type as 'cardio' | 'strength' | 'flexibility' | 'sport',
          has_duplicates: false
        });
      }
      
      // Redirection vers le dashboard
      navigate('/sport/dashboard');
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      
      // Analytics: Erreur lors de la création de session
      analytics.track('error_occurred', {
        error_type: 'validation',
        error_message: error instanceof Error ? error.message : 'Erreur inconnue',
        component: 'new-session',
        user_action: 'create_session'
      });
      
      // TODO: Afficher un message d'erreur à l'utilisateur
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/sport/dashboard');
  };

  return (
    <div className="p-4 space-y-6 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleCancel}>
          ← Retour
        </Button>
        <h1 className="text-2xl font-bold">Nouvelle séance</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de la séance</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleInputChange('name', e.target.value)}
                placeholder="Ex: Musculation du haut du corps"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Type de séance</Label>
              <Select
                value={formData.type}
                onValueChange={value => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {sessionTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <span className="flex items-center gap-2">
                        <span>{type.icon}</span>
                        <span>{type.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? (
                        format(formData.date, "PPP", { locale: fr })
                      ) : (
                        <span>Sélectionner une date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={date => date && handleInputChange('date', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="time">Heure</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={e => handleInputChange('time', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="duration">Durée (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="5"
                max="300"
                value={formData.duration}
                onChange={e => handleInputChange('duration', parseInt(e.target.value))}
                required
              />
            </div>

            <div>
              <Label htmlFor="objectives">Objectifs</Label>
              <Textarea
                id="objectives"
                value={formData.objectives}
                onChange={e => handleInputChange('objectives', e.target.value)}
                placeholder="Décrivez vos objectifs pour cette séance..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={e => handleInputChange('notes', e.target.value)}
                placeholder="Notes supplémentaires..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Duplication de séance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Copy className="h-5 w-5" />
              Dupliquer cette séance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="duplicateEnabled"
                checked={formData.duplicateEnabled}
                onCheckedChange={checked => handleInputChange('duplicateEnabled', checked)}
              />
              <Label htmlFor="duplicateEnabled">
                Dupliquer cette séance sur plusieurs dates
              </Label>
            </div>

            {formData.duplicateEnabled && (
              <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                <div>
                  <Label htmlFor="duplicateType">Type de récurrence</Label>
                  <Select
                    value={formData.duplicateType}
                    onValueChange={value => handleInputChange('duplicateType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {duplicateTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {type.description}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duplicateEndDate">Date de fin</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.duplicateEndDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.duplicateEndDate ? (
                            format(formData.duplicateEndDate, "PPP", { locale: fr })
                          ) : (
                            <span>Jusqu'au...</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.duplicateEndDate || undefined}
                          onSelect={date => handleInputChange('duplicateEndDate', date)}
                          disabled={date => date < formData.date}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label htmlFor="duplicateCount">Nombre de séances</Label>
                    <Input
                      id="duplicateCount"
                      type="number"
                      min="1"
                      max="365"
                      value={formData.duplicateCount}
                      onChange={e => handleInputChange('duplicateCount', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                {/* Aperçu des dates de duplication */}
                {duplicateDates.length > 0 && (
                  <div>
                    <Label>Aperçu des dates ({duplicateDates.length} séances)</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {duplicateDates.slice(0, 10).map((date, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span>
                              {format(date, "dd/MM/yyyy", { locale: fr })}
                            </span>
                          </div>
                        ))}
                        {duplicateDates.length > 10 && (
                          <div className="col-span-2 text-muted-foreground text-center">
                            ... et {duplicateDates.length - 10} autres
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            className="flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Création...' : 'Créer la séance'}
          </Button>
        </div>
      </form>
    </div>
  );
}
