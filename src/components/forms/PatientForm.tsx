// Composant de formulaire de patient - Story 2.1
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Patient, CreatePatientInput } from '../../types/patient';
import { usePatientForm } from '../../hooks/usePatientForm';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Loader2,
  Save,
  User,
  MapPin,
  Heart,
  Phone,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

// Interface pour les props du composant
interface PatientFormProps {
  patientId?: string;
  onSave?: (patient: Patient) => void;
  onCancel?: () => void;
  isReadOnly?: boolean;
  showTabs?: boolean;
}

// Composant principal du formulaire
export function PatientForm({
  patientId,
  onSave,
  onCancel,
  isReadOnly = false,
  showTabs = true,
}: PatientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { form, formState, savePatient, resetForm, isDirty, hasErrors } =
    usePatientForm(patientId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = form;

  // Gestion de la soumission du formulaire
  const onSubmit = async (_data: CreatePatientInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const savedPatient = await savePatient();
      setSubmitSuccess(true);
      onSave?.(savedPatient);

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

  // Composant pour les informations personnelles
  const PersonalInfoSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            disabled={isReadOnly}
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-sm text-red-500">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            disabled={isReadOnly}
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-sm text-red-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="birthDate">Date de naissance *</Label>
          <Input
            id="birthDate"
            type="date"
            {...register('birthDate', { valueAsDate: true })}
            disabled={isReadOnly}
            className={errors.birthDate ? 'border-red-500' : ''}
          />
          {errors.birthDate && (
            <p className="text-sm text-red-500">{errors.birthDate.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            disabled={isReadOnly}
            className={errors.phone ? 'border-red-500' : ''}
            placeholder="06 12 34 56 78"
          />
          {errors.phone && (
            <p className="text-sm text-red-500">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          disabled={isReadOnly}
          className={errors.email ? 'border-red-500' : ''}
          placeholder="patient@example.com"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>
    </div>
  );

  // Composant pour l'adresse
  const AddressSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address.street">Adresse *</Label>
        <Input
          id="address.street"
          {...register('address.street')}
          disabled={isReadOnly}
          className={errors.address?.street ? 'border-red-500' : ''}
          placeholder="123 Rue de la Paix"
        />
        {errors.address?.street && (
          <p className="text-sm text-red-500">
            {errors.address.street.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="address.city">Ville *</Label>
          <Input
            id="address.city"
            {...register('address.city')}
            disabled={isReadOnly}
            className={errors.address?.city ? 'border-red-500' : ''}
            placeholder="Paris"
          />
          {errors.address?.city && (
            <p className="text-sm text-red-500">
              {errors.address.city.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address.postalCode">Code postal *</Label>
          <Input
            id="address.postalCode"
            {...register('address.postalCode')}
            disabled={isReadOnly}
            className={errors.address?.postalCode ? 'border-red-500' : ''}
            placeholder="75001"
          />
          {errors.address?.postalCode && (
            <p className="text-sm text-red-500">
              {errors.address.postalCode.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address.country">Pays *</Label>
          <Input
            id="address.country"
            {...register('address.country')}
            disabled={isReadOnly}
            className={errors.address?.country ? 'border-red-500' : ''}
            placeholder="France"
          />
          {errors.address?.country && (
            <p className="text-sm text-red-500">
              {errors.address.country.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Composant pour les informations médicales
  const MedicalInfoSection = () => {
    const medicalInfo = watch('medicalInfo');

    const addArrayItem = (field: keyof typeof medicalInfo, value: string) => {
      if (!value.trim()) return;
      const currentArray = medicalInfo?.[field] || [];
      setValue(`medicalInfo.${field}`, [...currentArray, value.trim()]);
    };

    const removeArrayItem = (
      field: keyof typeof medicalInfo,
      index: number
    ) => {
      const currentArray = medicalInfo?.[field] || [];
      setValue(
        `medicalInfo.${field}`,
        currentArray.filter((_, i) => i !== index)
      );
    };

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="medicalInfo.allergies">Allergies</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une allergie"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('allergies', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={isReadOnly}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalInfo?.allergies?.map((allergy, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {allergy}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('allergies', index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalInfo.medications">Médicaments</Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un médicament"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('medications', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={isReadOnly}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalInfo?.medications?.map((medication, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {medication}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem('medications', index)}
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalInfo.medicalHistory">
            Antécédents médicaux
          </Label>
          <Textarea
            id="medicalInfo.medicalHistory"
            {...register('medicalInfo.medicalHistory')}
            disabled={isReadOnly}
            placeholder="Décrivez les antécédents médicaux du patient..."
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalInfo.currentConditions">
            Affections actuelles
          </Label>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter une affection"
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addArrayItem('currentConditions', e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
                disabled={isReadOnly}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalInfo?.currentConditions?.map((condition, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {condition}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() =>
                        removeArrayItem('currentConditions', index)
                      }
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalInfo.notes">Notes médicales</Label>
          <Textarea
            id="medicalInfo.notes"
            {...register('medicalInfo.notes')}
            disabled={isReadOnly}
            placeholder="Notes supplémentaires..."
            rows={3}
          />
        </div>
      </div>
    );
  };

  // Composant pour le contact d'urgence
  const EmergencyContactSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact.name">Nom du contact *</Label>
          <Input
            id="emergencyContact.name"
            {...register('emergencyContact.name')}
            disabled={isReadOnly}
            className={errors.emergencyContact?.name ? 'border-red-500' : ''}
            placeholder="Jean Dupont"
          />
          {errors.emergencyContact?.name && (
            <p className="text-sm text-red-500">
              {errors.emergencyContact.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact.relationship">Relation *</Label>
          <Input
            id="emergencyContact.relationship"
            {...register('emergencyContact.relationship')}
            disabled={isReadOnly}
            className={
              errors.emergencyContact?.relationship ? 'border-red-500' : ''
            }
            placeholder="Conjoint, Parent, Enfant..."
          />
          {errors.emergencyContact?.relationship && (
            <p className="text-sm text-red-500">
              {errors.emergencyContact.relationship.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact.phone">Téléphone *</Label>
          <Input
            id="emergencyContact.phone"
            type="tel"
            {...register('emergencyContact.phone')}
            disabled={isReadOnly}
            className={errors.emergencyContact?.phone ? 'border-red-500' : ''}
            placeholder="06 12 34 56 78"
          />
          {errors.emergencyContact?.phone && (
            <p className="text-sm text-red-500">
              {errors.emergencyContact.phone.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="emergencyContact.email">Email</Label>
          <Input
            id="emergencyContact.email"
            type="email"
            {...register('emergencyContact.email')}
            disabled={isReadOnly}
            className={errors.emergencyContact?.email ? 'border-red-500' : ''}
            placeholder="contact@example.com"
          />
          {errors.emergencyContact?.email && (
            <p className="text-sm text-red-500">
              {errors.emergencyContact.email.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  // Rendu du formulaire
  if (showTabs) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personnel
            </TabsTrigger>
            <TabsTrigger value="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresse
            </TabsTrigger>
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Médical
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Urgence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Informations de base du patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalInfoSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="address">
            <Card>
              <CardHeader>
                <CardTitle>Adresse</CardTitle>
                <CardDescription>
                  Adresse de résidence du patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medical">
            <Card>
              <CardHeader>
                <CardTitle>Informations médicales</CardTitle>
                <CardDescription>
                  Antécédents, allergies et conditions médicales
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MedicalInfoSection />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency">
            <Card>
              <CardHeader>
                <CardTitle>Contact d'urgence</CardTitle>
                <CardDescription>
                  Personne à contacter en cas d'urgence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EmergencyContactSection />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

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
                  Patient sauvegardé avec succès !
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
    );
  }

  // Version sans onglets (pour les modales ou espaces restreints)
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations du patient</CardTitle>
          <CardDescription>
            Remplissez les informations du patient
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <PersonalInfoSection />
          <AddressSection />
          <MedicalInfoSection />
          <EmergencyContactSection />
        </CardContent>
      </Card>

      {/* Messages de statut et boutons - même logique que ci-dessus */}
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
                Patient sauvegardé avec succès !
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

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

      {formState.isSaving && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Sauvegarde automatique...
        </div>
      )}
    </form>
  );
}
