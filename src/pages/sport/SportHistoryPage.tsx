import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { SessionList } from '../../components/features/sport/SessionCard';
import { Search, Filter, Calendar, TrendingUp, Download } from 'lucide-react';

// Données mockées
const mockSessions = [
  {
    id: '1',
    name: 'Cardio Intense',
    type: 'cardio' as const,
    date: '2024-01-14',
    time: '18:00',
    duration: 45,
    status: 'completed' as const,
    exercises: 4,
    rpe: 8,
    painLevel: 2,
  },
  {
    id: '2',
    name: 'Musculation Bras',
    type: 'musculation' as const,
    date: '2024-01-12',
    time: '19:30',
    duration: 60,
    status: 'completed' as const,
    exercises: 6,
    rpe: 7,
    painLevel: 1,
  },
  {
    id: '3',
    name: 'Yoga Relaxation',
    type: 'yoga' as const,
    date: '2024-01-10',
    time: '20:00',
    duration: 30,
    status: 'completed' as const,
    exercises: 8,
    rpe: 4,
    painLevel: 0,
  },
];

const mockStats = {
  totalSessions: 23,
  thisWeek: 4,
  thisMonth: 12,
  averageRPE: 6.2,
  totalDuration: 18.5,
};

export function SportHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');

  const handleStartSession = (session: { id: string; name: string }) => {
    console.log('Démarrer séance:', session);
  };

  const handleEditSession = (session: { id: string; name: string }) => {
    console.log('Modifier séance:', session);
  };

  const handleDuplicateSession = (session: { id: string; name: string }) => {
    console.log('Dupliquer séance:', session);
  };

  const filteredSessions = mockSessions.filter(session => {
    const matchesSearch = session.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || session.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-4 space-y-6">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique</h1>
        <p className="text-gray-600">Consultez vos séances passées</p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mockStats.totalSessions}
            </div>
            <div className="text-sm text-gray-600">Séances totales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {mockStats.totalDuration}h
            </div>
            <div className="text-sm text-gray-600">Temps total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtres</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une séance..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Type
              </label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="musculation">Musculation</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Période
              </label>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="week">Cette semaine</SelectItem>
                  <SelectItem value="month">Ce mois</SelectItem>
                  <SelectItem value="year">Cette année</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistiques détaillées */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Statistiques</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {mockStats.thisWeek}
              </div>
              <div className="text-sm text-gray-600">Cette semaine</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {mockStats.averageRPE}/10
              </div>
              <div className="text-sm text-gray-600">RPE moyen</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des séances */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Séances terminées</span>
            </CardTitle>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">
                Aucune séance trouvée
              </div>
              <div className="text-gray-400 text-sm">
                {searchQuery || typeFilter !== 'all'
                  ? 'Aucune séance ne correspond à vos critères'
                  : 'Vos séances terminées apparaîtront ici'}
              </div>
            </div>
          ) : (
            <SessionList
              sessions={filteredSessions}
              onStart={handleStartSession}
              onEdit={handleEditSession}
              onDuplicate={handleDuplicateSession}
              variant="completed"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
