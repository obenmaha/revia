// Exemple d'intégration des notifications dans le profil utilisateur - FR9
import { useState } from 'react';
import { Bell, Settings, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications, useScheduleSessionReminder } from '@/hooks/useNotifications';
import { NotificationService } from '@/services/notificationService';
import { NotificationIntegration } from './NotificationIntegration';
import { NotificationStatus } from './NotificationStatus';

interface NotificationExampleProps {
  userId?: string;
}

export function NotificationExample({ userId }: NotificationExampleProps) {
  const { scheduleLocalReminder, preferences, permission } = useNotifications(userId);
  const { scheduleSessionReminder } = useScheduleSessionReminder();
  const [testResult, setTestResult] = useState<string>('');

  const handleTestNotification = async () => {
    try {
      setTestResult('Envoi de la notification de test...');
      
      await scheduleLocalReminder('Test de notification', {
        body: 'Ceci est un test de notification pour vérifier que tout fonctionne correctement.',
        tag: 'test-notification',
      });
      
      setTestResult('✅ Notification de test envoyée avec succès !');
    } catch (error) {
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleTestSessionReminder = async () => {
    try {
      setTestResult('Programmation du rappel de séance...');
      
      const sessionDate = new Date(Date.now() + 2 * 60 * 1000); // Dans 2 minutes
      
      await scheduleSessionReminder('Séance de test', sessionDate, {
        minutesBefore: 1,
        customMessage: 'Rappel: Votre séance de test commence bientôt !'
      });
      
      setTestResult('✅ Rappel de séance programmé avec succès ! Il se déclenchera dans 1 minute.');
    } catch (error) {
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  const handleTestServiceNotification = async () => {
    try {
      setTestResult('Test du service de notifications...');
      
      const template = NotificationService.generateReminderTemplate({
        sessionName: 'Séance de musculation',
        scheduledAt: new Date(Date.now() + 5 * 60 * 1000),
        userName: 'Utilisateur Test',
        currentStreak: 5,
      });
      
      await NotificationService.scheduleLocalNotification(template);
      
      setTestResult('✅ Notification générée par le service envoyée avec succès !');
    } catch (error) {
      setTestResult(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications - Exemple d'intégration
          </CardTitle>
          <CardDescription>
            Démonstration des fonctionnalités de notifications FR9
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="settings">Configuration</TabsTrigger>
              <TabsTrigger value="status">Statut</TabsTrigger>
              <TabsTrigger value="test">Tests</TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4">
              <NotificationIntegration userId={userId} />
            </TabsContent>
            
            <TabsContent value="status" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Statut des notifications</h3>
                  <div className="flex items-center gap-4">
                    <NotificationStatus userId={userId} showLabel size="lg" />
                    <NotificationStatus userId={userId} showLabel={false} size="md" />
                    <NotificationStatus userId={userId} showLabel={false} size="sm" />
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Informations détaillées</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>Support navigateur:</strong> {NotificationService.isSupported() ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Permission:</strong> {permission}</p>
                    <p><strong>Préférences configurées:</strong> {preferences ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Notifications push activées:</strong> {preferences?.push_enabled ? '✅ Oui' : '❌ Non'}</p>
                    <p><strong>Notifications email activées:</strong> {preferences?.email_enabled ? '✅ Oui' : '❌ Non'}</p>
                    {preferences?.reminder_time && (
                      <p><strong>Heure des rappels:</strong> {preferences.reminder_time}</p>
                    )}
                    {preferences?.reminder_frequency && (
                      <p><strong>Fréquence:</strong> {preferences.reminder_frequency}</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="test" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Tests de notifications</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Testez les différentes fonctionnalités de notifications
                  </p>
                </div>
                
                <div className="grid gap-3">
                  <Button 
                    onClick={handleTestNotification}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4" />
                    Test notification simple
                  </Button>
                  
                  <Button 
                    onClick={handleTestSessionReminder}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4" />
                    Test rappel de séance
                  </Button>
                  
                  <Button 
                    onClick={handleTestServiceNotification}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <TestTube className="h-4 w-4" />
                    Test service de notifications
                  </Button>
                </div>
                
                {testResult && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-mono">{testResult}</p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Instructions de test</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• <strong>Test notification simple:</strong> Envoie une notification immédiate</li>
                    <li>• <strong>Test rappel de séance:</strong> Programme un rappel dans 1 minute</li>
                    <li>• <strong>Test service:</strong> Utilise le service de notifications avec template</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
