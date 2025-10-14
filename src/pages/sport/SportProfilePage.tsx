import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { User, Target, Settings, Save, Edit3 } from 'lucide-react';

export function SportProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    goals: ['Perte de poids', 'Musculation'],
    experience: 'intermediate',
    preferences: {
      workoutTime: 'evening',
      notifications: true,
      reminders: true,
    },
    bio: 'Passionné de fitness et de bien-être. Objectif: être en forme et en bonne santé !',
  });

  const experienceLevels = [
    { value: 'beginner', label: 'Débutant' },
    { value: 'intermediate', label: 'Intermédiaire' },
    { value: 'advanced', label: 'Avancé' },
    { value: 'expert', label: 'Expert' },
  ];

  const workoutTimes = [
    { value: 'morning', label: 'Matin (6h-9h)' },
    { value: 'afternoon', label: 'Après-midi (12h-17h)' },
    { value: 'evening', label: 'Soir (18h-22h)' },
    { value: 'flexible', label: 'Flexible' },
  ];

  const commonGoals = [
    'Perte de poids',
    'Prise de masse',
    'Musculation',
    'Cardio',
    'Flexibilité',
    'Endurance',
    'Force',
    'Bien-être général',
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedInputChange = (
    parent: string,
    field: string,
    value: string | number
  ) => {
    setProfileData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof typeof prev],
        [field]: value,
      },
    }));
  };

  const handleGoalToggle = (goal: string) => {
    setProfileData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  const handleSave = () => {
    console.log('Sauvegarde du profil:', profileData);
    setIsEditing(false);
    // TODO: Logique de sauvegarde
  };

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-600">Gérez vos informations et préférences</p>
      </div>

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Informations personnelles</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={profileData.firstName}
                onChange={e => handleInputChange('firstName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={profileData.lastName}
                onChange={e => handleInputChange('lastName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profileData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={e => handleInputChange('bio', e.target.value)}
              disabled={!isEditing}
              placeholder="Parlez-nous de vous..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Objectifs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Mes objectifs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {commonGoals.map(goal => (
              <Badge
                key={goal}
                variant={
                  profileData.goals.includes(goal) ? 'default' : 'outline'
                }
                className="cursor-pointer"
                onClick={() => isEditing && handleGoalToggle(goal)}
              >
                {goal}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Niveau d'expérience */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Niveau d'expérience</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={profileData.experience}
            onValueChange={value => handleInputChange('experience', value)}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {experienceLevels.map(level => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Préférences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Préférences</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Heure préférée pour s'entraîner</Label>
            <Select
              value={profileData.preferences.workoutTime}
              onValueChange={value =>
                handleNestedInputChange('preferences', 'workoutTime', value)
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {workoutTimes.map(time => (
                  <SelectItem key={time.value} value={time.value}>
                    {time.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notifications</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="notifications"
                checked={profileData.preferences.notifications}
                onChange={e =>
                  handleNestedInputChange(
                    'preferences',
                    'notifications',
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="notifications" className="text-sm">
                Recevoir des notifications
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminders"
                checked={profileData.preferences.reminders}
                onChange={e =>
                  handleNestedInputChange(
                    'preferences',
                    'reminders',
                    e.target.checked
                  )
                }
                disabled={!isEditing}
                className="rounded"
              />
              <Label htmlFor="reminders" className="text-sm">
                Rappels de séances
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {isEditing && (
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsEditing(false)}
          >
            Annuler
          </Button>
          <Button className="flex-1" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Sauvegarder
          </Button>
        </div>
      )}
    </div>
  );
}
