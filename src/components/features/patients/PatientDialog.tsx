import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePatient, usePatients } from '../../../hooks/usePatients';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Loader2 } from 'lucide-react';

// Schéma de validation Zod
const patientSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  birthDate: z.string().min(1, 'La date de naissance est requise'),
  phone: z.string().optional(),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  address: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientDialogProps {
  patientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDialog({
  patientId,
  open,
  onOpenChange,
}: PatientDialogProps) {
  const isEditing = !!patientId;
  const { patient, isLoading: isLoadingPatient } = usePatient(patientId || '');
  const { createPatient, isCreating } = usePatients();
  const { updatePatient, isUpdating } = usePatient(patientId || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    if (patient && isEditing) {
      reset({
        firstName: patient.firstName,
        lastName: patient.lastName,
        birthDate: new Date(patient.birthDate).toISOString().split('T')[0],
        phone: patient.phone || '',
        email: patient.email || '',
        address: patient.address || '',
        medicalHistory: patient.medicalHistory || '',
        emergencyContact: patient.emergencyContact || '',
      });
    } else {
      reset({
        firstName: '',
        lastName: '',
        birthDate: '',
        phone: '',
        email: '',
        address: '',
        medicalHistory: '',
        emergencyContact: '',
      });
    }
  }, [patient, isEditing, reset]);

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (isEditing && patientId) {
        await updatePatient(data);
      } else {
        await createPatient(data);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error('Error saving patient:', error);
    }
  };

  const isLoading = isCreating || isUpdating || (isEditing && isLoadingPatient);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le patient' : 'Nouveau patient'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifiez les informations du patient'
              : 'Ajoutez un nouveau patient à votre liste'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                {...register('firstName')}
                disabled={isLoading}
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                {...register('lastName')}
                disabled={isLoading}
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Date de naissance *</Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
              disabled={isLoading}
              className={errors.birthDate ? 'border-red-500' : ''}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-500">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                {...register('phone')}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="patient@example.com"
                {...register('email')}
                disabled={isLoading}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Textarea
              id="address"
              placeholder="Adresse complète"
              {...register('address')}
              disabled={isLoading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Antécédents médicaux</Label>
            <Textarea
              id="medicalHistory"
              placeholder="Informations médicales pertinentes..."
              {...register('medicalHistory')}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContact">Contact d'urgence</Label>
            <Input
              id="emergencyContact"
              placeholder="Nom et téléphone"
              {...register('emergencyContact')}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
