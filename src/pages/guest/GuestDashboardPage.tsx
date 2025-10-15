import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { User, Eye, Lock } from 'lucide-react';

export function GuestDashboardPage() {
  return (
    <div className="p-4 space-y-6 bg-gray-50 min-h-screen">
      {/* En-tête de bienvenue */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          👋 Mode Guest
        </h1>
        <p className="text-gray-600">
          Accès limité - Fonctionnalités de base uniquement
        </p>
      </div>

      {/* Informations sur le mode guest */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Mode Guest</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">
              Vous êtes connecté en mode invité. Certaines fonctionnalités sont limitées.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Lock className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Fonctionnalités disponibles en mode guest :
                </span>
              </div>
              <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                <li>• Consultation des informations de base</li>
                <li>• Navigation limitée</li>
                <li>• Aucune modification de données</li>
              </ul>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Créer un compte
              </Button>
              <Button variant="outline" size="sm">
                Se connecter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques limitées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Sessions vues</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Temps passé</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Pages visitées</div>
          </CardContent>
        </Card>
      </div>

      {/* Message d'encouragement */}
      <Card>
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            🚀 Débloquez tout le potentiel !
          </h3>
          <p className="text-gray-600 mb-4">
            Créez un compte pour accéder à toutes les fonctionnalités de l'application.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Commencer maintenant
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
