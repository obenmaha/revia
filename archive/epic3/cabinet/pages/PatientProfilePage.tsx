// Page de profil patient - Story 2.1
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  MapPin,
  Heart,
  Phone,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { usePatient } from '../hooks/usePatient';
import { PatientForm } from '../components/forms/PatientForm';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Loader2 } from 'lucide-react';

// Interface pour les props
interface PatientProfilePageProps {
  patientId?: string;
}

// Composant principal de la page de profil
export function PatientProfilePage({
  patientId: propPatientId,
}: PatientProfilePageProps) {
  const { patientId: paramPatientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const patientId = propPatientId || paramPatientId;
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { patient, isLoading, isError, error, deletePatient } = usePatient(
    patientId || null
  );

  // Gestion de la sauvegarde
  const handleSave = async (_updatedPatient: unknown) => {
    setIsEditing(false);
    // Le patient sera automatiquement mis à jour via le hook
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Gestion de la suppression
  const handleDelete = async () => {
    if (!patientId) return;

    setIsDeleting(true);
    try {
      await deletePatient();
      navigate('/patients');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Calcul de l'âge
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Formatage de la date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Composant d'affichage des informations personnelles
  const PersonalInfoCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Informations personnelles
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Prénom
            </label>
            <p className="text-lg">{patient?.firstName}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Nom
            </label>
            <p className="text-lg">{patient?.lastName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Date de naissance
            </label>
            <p className="text-lg">
              {patient?.birthDate
                ? formatDate(patient.birthDate)
                : 'Non renseignée'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Âge
            </label>
            <p className="text-lg">
              {patient?.birthDate
                ? `${calculateAge(patient.birthDate)} ans`
                : 'Non calculable'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Téléphone
            </label>
            <p className="text-lg">{patient?.phone || 'Non renseigné'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Email
            </label>
            <p className="text-lg">{patient?.email || 'Non renseigné'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Composant d'affichage de l'adresse
  const AddressCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Adresse
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-lg">{patient?.address?.street}</p>
          <p className="text-lg">
            {patient?.address?.postalCode} {patient?.address?.city}
          </p>
          <p className="text-lg">{patient?.address?.country}</p>
        </div>
      </CardContent>
    </Card>
  );

  // Composant d'affichage des informations médicales
  const MedicalInfoCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Informations médicales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Allergies */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Allergies
          </label>
          <div className="mt-2">
            {patient?.medicalInfo?.allergies &&
            patient.medicalInfo.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.medicalInfo.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Aucune allergie renseignée
              </p>
            )}
          </div>
        </div>

        {/* Médicaments */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Médicaments
          </label>
          <div className="mt-2">
            {patient?.medicalInfo?.medications &&
            patient.medicalInfo.medications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.medicalInfo.medications.map((medication, index) => (
                  <Badge key={index} variant="secondary">
                    {medication}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Aucun médicament renseigné
              </p>
            )}
          </div>
        </div>

        {/* Antécédents médicaux */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Antécédents médicaux
          </label>
          <p className="mt-2 text-sm">
            {patient?.medicalInfo?.medicalHistory ||
              'Aucun antécédent renseigné'}
          </p>
        </div>

        {/* Affections actuelles */}
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Affections actuelles
          </label>
          <div className="mt-2">
            {patient?.medicalInfo?.currentConditions &&
            patient.medicalInfo.currentConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.medicalInfo.currentConditions.map(
                  (condition, index) => (
                    <Badge key={index} variant="outline">
                      {condition}
                    </Badge>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Aucune affection renseignée
              </p>
            )}
          </div>
        </div>

        {/* Notes médicales */}
        {patient?.medicalInfo?.notes && (
          <div>
            <label className="text-sm font-medium text-muted-foreground">
              Notes médicales
            </label>
            <p className="mt-2 text-sm">{patient.medicalInfo.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Composant d'affichage du contact d'urgence
  const EmergencyContactCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Contact d'urgence
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nom
              </label>
              <p className="text-lg">
                {patient?.emergencyContact?.name || 'Non renseigné'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Relation
              </label>
              <p className="text-lg">
                {patient?.emergencyContact?.relationship || 'Non renseignée'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Téléphone
              </label>
              <p className="text-lg">
                {patient?.emergencyContact?.phone || 'Non renseigné'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Email
              </label>
              <p className="text-lg">
                {patient?.emergencyContact?.email || 'Non renseigné'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // États de chargement et d'erreur
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement du profil patient...</span>
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux patients
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Patient non trouvé'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Mode édition
  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au profil
          </Button>
          <h1 className="text-2xl font-bold">Modifier le profil</h1>
        </div>

        <PatientForm
          patientId={patientId}
          onSave={handleSave}
          onCancel={handleCancel}
          showTabs={true}
        />
      </div>
    );
  }

  // Mode affichage
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux patients
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              Patient depuis le {formatDate(patient.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Informations du patient */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PersonalInfoCard />
        <AddressCard />
      </div>

      <MedicalInfoCard />
      <EmergencyContactCard />

      {/* Informations système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Informations système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="font-medium text-muted-foreground">
                Créé le
              </label>
              <p>{formatDate(patient.createdAt)}</p>
            </div>
            <div>
              <label className="font-medium text-muted-foreground">
                Dernière modification
              </label>
              <p>{formatDate(patient.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le patient{' '}
              <strong>
                {patient.firstName} {patient.lastName}
              </strong>{' '}
              ? Cette action est irréversible et supprimera toutes les données
              associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export par défaut pour la compatibilité avec React Router
export default PatientProfilePage;
