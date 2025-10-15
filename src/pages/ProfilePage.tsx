// Page de profil utilisateur - Story FR1
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Target,
  Settings,
  Bell,
  Palette,
  Shield,
  Globe,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile, type UserProfileFormData } from '../hooks/useUserProfile';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
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
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';

// Interface pour les props
interface ProfilePageProps {}

// Composant principal de la page de profil
export function ProfilePage({}: ProfilePageProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const {
    profile,
    isLoading,
    isError,
    error,
    updateProfile,
    isUpdating,
    updateError,
  } = useUserProfile(user?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileFormData>({});
  const [activeTab, setActiveTab] = useState('personal');

  // Initialiser les données du formulaire
  React.useEffect(() => {
    if (profile && !isEditing) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || undefined,
        height_cm: profile.height_cm || undefined,
        weight_kg: profile.weight_kg || undefined,
        fitness_level: profile.fitness_level || undefined,
        goals: profile.goals as any || {},
        preferences: profile.preferences as any || {},
      });
    }
  }, [profile, isEditing]);

  // Gestion de la sauvegarde
  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    setIsEditing(false);
    // Réinitialiser les données du formulaire
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
        gender: profile.gender || undefined,
        height_cm: profile.height_cm || undefined,
        weight_kg: profile.weight_kg || undefined,
        fitness_level: profile.fitness_level || undefined,
        goals: profile.goals as any || {},
        preferences: profile.preferences as any || {},
      });
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gestion des changements d'objectifs
  const handleGoalChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        [field]: value,
      },
    }));
  };

  // Gestion des changements de préférences
  const handlePreferenceChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: {
          ...prev.preferences?.[section as keyof typeof prev.preferences],
          [field]: value,
        },
      },
    }));
  };

  // Calcul de l'âge
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Formatage de la date
  const formatDate = (date: string) => {
    if (!date) return 'Non renseignée';
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  // États de chargement et d'erreur
  if (!isAuthenticated) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Vous devez être connecté pour accéder à votre profil.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement du profil...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>
        </div>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || 'Erreur lors du chargement du profil'}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
            <Label htmlFor="first_name">Prénom</Label>
            {isEditing ? (
              <Input
                id="first_name"
                value={formData.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Votre prénom"
              />
            ) : (
              <p className="text-lg">{profile?.first_name || 'Non renseigné'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="last_name">Nom</Label>
            {isEditing ? (
              <Input
                id="last_name"
                value={formData.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Votre nom"
              />
            ) : (
              <p className="text-lg">{profile?.last_name || 'Non renseigné'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="votre@email.com"
              />
            ) : (
              <p className="text-lg">{profile?.email || 'Non renseigné'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="06 12 34 56 78"
              />
            ) : (
              <p className="text-lg">{profile?.phone || 'Non renseigné'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="birth_date">Date de naissance</Label>
            {isEditing ? (
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date || ''}
                onChange={(e) => handleInputChange('birth_date', e.target.value)}
              />
            ) : (
              <p className="text-lg">{formatDate(profile?.birth_date || '')}</p>
            )}
          </div>
          <div>
            <Label htmlFor="gender">Genre</Label>
            {isEditing ? (
              <Select
                value={formData.gender || ''}
                onValueChange={(value) => handleInputChange('gender', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                  <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-lg">
                {profile?.gender === 'male' ? 'Homme' :
                 profile?.gender === 'female' ? 'Femme' :
                 profile?.gender === 'other' ? 'Autre' :
                 profile?.gender === 'prefer_not_to_say' ? 'Préfère ne pas dire' :
                 'Non renseigné'}
              </p>
            )}
          </div>
          <div>
            <Label>Âge</Label>
            <p className="text-lg">
              {profile?.birth_date ? `${calculateAge(profile.birth_date)} ans` : 'Non calculable'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="height_cm">Taille (cm)</Label>
            {isEditing ? (
              <Input
                id="height_cm"
                type="number"
                value={formData.height_cm || ''}
                onChange={(e) => handleInputChange('height_cm', parseInt(e.target.value) || undefined)}
                placeholder="170"
                min="100"
                max="250"
              />
            ) : (
              <p className="text-lg">{profile?.height_cm ? `${profile.height_cm} cm` : 'Non renseignée'}</p>
            )}
          </div>
          <div>
            <Label htmlFor="weight_kg">Poids (kg)</Label>
            {isEditing ? (
              <Input
                id="weight_kg"
                type="number"
                value={formData.weight_kg || ''}
                onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value) || undefined)}
                placeholder="70"
                min="30"
                max="300"
                step="0.1"
              />
            ) : (
              <p className="text-lg">{profile?.weight_kg ? `${profile.weight_kg} kg` : 'Non renseigné'}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="fitness_level">Niveau de forme</Label>
          {isEditing ? (
            <Select
              value={formData.fitness_level || ''}
              onValueChange={(value) => handleInputChange('fitness_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner votre niveau" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Débutant</SelectItem>
                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                <SelectItem value="advanced">Avancé</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-lg">
              {profile?.fitness_level === 'beginner' ? 'Débutant' :
               profile?.fitness_level === 'intermediate' ? 'Intermédiaire' :
               profile?.fitness_level === 'advanced' ? 'Avancé' :
               profile?.fitness_level === 'expert' ? 'Expert' :
               'Non renseigné'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Composant d'affichage des objectifs
  const GoalsCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Objectifs
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="primary_goal">Objectif principal</Label>
          {isEditing ? (
            <Input
              id="primary_goal"
              value={formData.goals?.primary_goal || ''}
              onChange={(e) => handleGoalChange('primary_goal', e.target.value)}
              placeholder="Ex: Perdre du poids, prendre du muscle..."
            />
          ) : (
            <p className="text-lg">{profile?.goals?.primary_goal || 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <Label htmlFor="target_weight">Poids cible (kg)</Label>
          {isEditing ? (
            <Input
              id="target_weight"
              type="number"
              value={formData.goals?.target_weight || ''}
              onChange={(e) => handleGoalChange('target_weight', parseFloat(e.target.value) || undefined)}
              placeholder="65"
              min="30"
              max="300"
              step="0.1"
            />
          ) : (
            <p className="text-lg">{profile?.goals?.target_weight ? `${profile.goals.target_weight} kg` : 'Non renseigné'}</p>
          )}
        </div>

        <div>
          <Label htmlFor="target_date">Date cible</Label>
          {isEditing ? (
            <Input
              id="target_date"
              type="date"
              value={formData.goals?.target_date || ''}
              onChange={(e) => handleGoalChange('target_date', e.target.value)}
            />
          ) : (
            <p className="text-lg">{formatDate(profile?.goals?.target_date || '')}</p>
          )}
        </div>

        <div>
          <Label>Objectifs secondaires</Label>
          {isEditing ? (
            <Textarea
              value={formData.goals?.secondary_goals?.join(', ') || ''}
              onChange={(e) => handleGoalChange('secondary_goals', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              placeholder="Ex: Améliorer l'endurance, Renforcer le dos..."
              rows={3}
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.goals?.secondary_goals?.length ? (
                profile.goals.secondary_goals.map((goal, index) => (
                  <Badge key={index} variant="secondary">
                    {goal}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">Aucun objectif secondaire</p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Composant d'affichage des préférences
  const PreferencesCard = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Préférences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Thème */}
        <div>
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Thème
          </Label>
          {isEditing ? (
            <Select
              value={formData.preferences?.theme || 'system'}
              onValueChange={(value) => handlePreferenceChange('theme', 'theme', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Clair</SelectItem>
                <SelectItem value="dark">Sombre</SelectItem>
                <SelectItem value="system">Système</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-lg mt-2">
              {profile?.preferences?.theme === 'light' ? 'Clair' :
               profile?.preferences?.theme === 'dark' ? 'Sombre' :
               profile?.preferences?.theme === 'system' ? 'Système' :
               'Système'}
            </p>
          )}
        </div>

        <Separator />

        {/* Notifications */}
        <div>
          <Label className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </Label>
          <div className="space-y-3 mt-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email_notifications">Email</Label>
              {isEditing ? (
                <Switch
                  id="email_notifications"
                  checked={formData.preferences?.notifications?.email || false}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', 'email', checked)}
                />
              ) : (
                <Badge variant={profile?.preferences?.notifications?.email ? 'default' : 'secondary'}>
                  {profile?.preferences?.notifications?.email ? 'Activé' : 'Désactivé'}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push_notifications">Push</Label>
              {isEditing ? (
                <Switch
                  id="push_notifications"
                  checked={formData.preferences?.notifications?.push || false}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', 'push', checked)}
                />
              ) : (
                <Badge variant={profile?.preferences?.notifications?.push ? 'default' : 'secondary'}>
                  {profile?.preferences?.notifications?.push ? 'Activé' : 'Désactivé'}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reminders">Rappels</Label>
              {isEditing ? (
                <Switch
                  id="reminders"
                  checked={formData.preferences?.notifications?.reminders || false}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', 'reminders', checked)}
                />
              ) : (
                <Badge variant={profile?.preferences?.notifications?.reminders ? 'default' : 'secondary'}>
                  {profile?.preferences?.notifications?.reminders ? 'Activé' : 'Désactivé'}
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="achievements">Succès</Label>
              {isEditing ? (
                <Switch
                  id="achievements"
                  checked={formData.preferences?.notifications?.achievements || false}
                  onCheckedChange={(checked) => handlePreferenceChange('notifications', 'achievements', checked)}
                />
              ) : (
                <Badge variant={profile?.preferences?.notifications?.achievements ? 'default' : 'secondary'}>
                  {profile?.preferences?.notifications?.achievements ? 'Activé' : 'Désactivé'}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Unités */}
        <div>
          <Label className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Unités
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div>
              <Label htmlFor="weight_unit">Poids</Label>
              {isEditing ? (
                <Select
                  value={formData.preferences?.units?.weight || 'kg'}
                  onValueChange={(value) => handlePreferenceChange('units', 'weight', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">{profile?.preferences?.units?.weight || 'kg'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="height_unit">Taille</Label>
              {isEditing ? (
                <Select
                  value={formData.preferences?.units?.height || 'cm'}
                  onValueChange={(value) => handlePreferenceChange('units', 'height', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cm">cm</SelectItem>
                    <SelectItem value="ft">ft</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">{profile?.preferences?.units?.height || 'cm'}</p>
              )}
            </div>
            <div>
              <Label htmlFor="distance_unit">Distance</Label>
              {isEditing ? (
                <Select
                  value={formData.preferences?.units?.distance || 'km'}
                  onValueChange={(value) => handlePreferenceChange('units', 'distance', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="km">km</SelectItem>
                    <SelectItem value="miles">miles</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg">{profile?.preferences?.units?.distance || 'km'}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Confidentialité */}
        <div>
          <Label className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Confidentialité
          </Label>
          <div className="space-y-3 mt-3">
            <div>
              <Label htmlFor="profile_visibility">Visibilité du profil</Label>
              {isEditing ? (
                <Select
                  value={formData.preferences?.privacy?.profile_visibility || 'private'}
                  onValueChange={(value) => handlePreferenceChange('privacy', 'profile_visibility', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                    <SelectItem value="friends">Amis uniquement</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-lg mt-2">
                  {profile?.preferences?.privacy?.profile_visibility === 'public' ? 'Public' :
                   profile?.preferences?.privacy?.profile_visibility === 'private' ? 'Privé' :
                   profile?.preferences?.privacy?.profile_visibility === 'friends' ? 'Amis uniquement' :
                   'Privé'}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="activity_sharing">Partage d'activité</Label>
              {isEditing ? (
                <Switch
                  id="activity_sharing"
                  checked={formData.preferences?.privacy?.activity_sharing || false}
                  onCheckedChange={(checked) => handlePreferenceChange('privacy', 'activity_sharing', checked)}
                />
              ) : (
                <Badge variant={profile?.preferences?.privacy?.activity_sharing ? 'default' : 'secondary'}>
                  {profile?.preferences?.privacy?.activity_sharing ? 'Activé' : 'Désactivé'}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Mon Profil</h1>
            <p className="text-muted-foreground">
              Gérez vos informations personnelles et préférences
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={isUpdating}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Messages d'erreur */}
      {updateError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Erreur lors de la mise à jour : {updateError.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Message de succès */}
      {!isUpdating && !updateError && isEditing === false && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Profil sauvegardé avec succès
          </AlertDescription>
        </Alert>
      )}

      {/* Contenu principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personnel</TabsTrigger>
          <TabsTrigger value="goals">Objectifs</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <PersonalInfoCard />
        </TabsContent>

        <TabsContent value="goals">
          <GoalsCard />
        </TabsContent>

        <TabsContent value="preferences">
          <PreferencesCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export par défaut pour la compatibilité avec React Router
export default ProfilePage;
