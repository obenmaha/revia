import { useParams, Link } from 'react-router-dom';
import { usePatient } from '../hooks/usePatients';
import { useSessions } from '../hooks/useSessions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Calendar,
  FileText,
  Phone,
  Mail,
  MapPin,
  User,
  Clock,
  Activity,
} from 'lucide-react';
import { PatientDialog } from '../components/features/patients/PatientDialog';
import { useState } from 'react';

export function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { patient, isLoading: isLoadingPatient } = usePatient(id || '');
  const { sessions, isLoading: isLoadingSessions } = useSessions({
    patientId: id,
    limit: 10,
  });

  if (isLoadingPatient) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">
            Patient non trouvé
          </h1>
          <p className="text-gray-600 mt-2">
            Le patient que vous recherchez n'existe pas.
          </p>
          <Button asChild className="mt-4">
            <Link to="/patients">Retour à la liste</Link>
          </Button>
        </div>
      </div>
    );
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'scheduled':
        return 'Programmée';
      case 'cancelled':
        return 'Annulée';
      case 'no_show':
        return 'Absent';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/patients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-muted-foreground">
              {calculateAge(patient.birthDate.toString())} ans
            </p>
          </div>
        </div>
        <Button onClick={() => setIsEditDialogOpen(true)}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sessions">Séances</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Né(e) le :
                  </span>
                  <span>{formatDate(patient.birthDate.toString())}</span>
                </div>

                {patient.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Téléphone :
                    </span>
                    <span>{patient.phone}</span>
                  </div>
                )}

                {patient.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Email :
                    </span>
                    <span>{patient.email}</span>
                  </div>
                )}

                {patient.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Adresse :
                      </span>
                      <p className="text-sm">{patient.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Antécédents médicaux */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Antécédents médicaux
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medicalHistory ? (
                  <p className="text-sm whitespace-pre-wrap">
                    {patient.medicalHistory}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aucun antécédent médical renseigné
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contact d'urgence */}
          {patient.emergencyContact && (
            <Card>
              <CardHeader>
                <CardTitle>Contact d'urgence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{patient.emergencyContact}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Historique des séances
              </CardTitle>
              <CardDescription>
                {sessions?.length || 0} séance(s) enregistrée(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSessions ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : sessions?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Aucune séance enregistrée
                </p>
              ) : (
                <div className="space-y-4">
                  {sessions?.map(session => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm">
                          <p className="font-medium">
                            {formatDate(session.scheduledAt.toString())}
                          </p>
                          <p className="text-muted-foreground">
                            {new Date(session.scheduledAt).toLocaleTimeString(
                              'fr-FR',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}{' '}
                            - {session.duration} min
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.status)}>
                        {getStatusLabel(session.status)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documents
              </CardTitle>
              <CardDescription>
                Documents et fichiers du patient
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun document uploadé
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <PatientDialog
        patientId={patient.id}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </div>
  );
}
