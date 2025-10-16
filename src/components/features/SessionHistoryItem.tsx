// Composant d'item d'historique de session - Story 2.5
import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Zap,
  BarChart3,
  Weight,
  Calendar,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Session } from '@/types/session';
import { formatDate, formatTime, frenchLocale } from '../../utils/dateUtils';

interface SessionHistoryItemProps {
  session: Session;
  onView?: (session: Session) => void;
  onEdit?: (session: Session) => void;
  onDelete?: (session: Session) => void;
  className?: string;
}

const SessionHistoryItem: React.FC<SessionHistoryItemProps> = ({
  session,
  onView,
  onEdit,
  onDelete,
  className = '',
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-blue-600" />;
      case 'draft':
        return <FileText className="w-4 h-4 text-gray-600" />;
      default:
        return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rehabilitation':
        return 'bg-blue-100 text-blue-800';
      case 'sport':
        return 'bg-green-100 text-green-800';
      case 'fitness':
        return 'bg-orange-100 text-orange-800';
      case 'other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'rehabilitation':
        return 'Rééducation';
      case 'sport':
        return 'Sport';
      case 'fitness':
        return 'Fitness';
      case 'other':
        return 'Autre';
      default:
        return type;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminée';
      case 'in_progress':
        return 'En cours';
      case 'draft':
        return 'Brouillon';
      default:
        return status;
    }
  };

  const formatDateLocal = (date: Date) => {
    return formatDate(date, 'dd MMM yyyy');
  };

  const formatTimeLocal = (date: Date) => {
    return formatTime(date);
  };

  const getRelativeDate = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Il y a moins d'une heure";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else if (diffInHours < 168) {
      // 7 jours
      return `Il y a ${Math.floor(diffInHours / 24)} jour${Math.floor(diffInHours / 24) > 1 ? 's' : ''}`;
    } else {
      return formatDateLocal(date);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`group ${className}`}
    >
      <Card className="hover:shadow-md transition-all duration-200 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            {/* Contenu principal */}
            <div className="flex-1 min-w-0">
              {/* En-tête avec nom et statut */}
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-gray-900 truncate">
                  {session.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${getStatusColor(session.status)} text-xs`}
                  >
                    <div className="flex items-center gap-1">
                      {getStatusIcon(session.status)}
                      {getStatusLabel(session.status)}
                    </div>
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={`${getTypeColor(session.type)} text-xs`}
                  >
                    {getTypeLabel(session.type)}
                  </Badge>
                </div>
              </div>

              {/* Date et heure */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDateLocal(session.date)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeLocal(session.date)}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {getRelativeDate(session.date)}
                </span>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{session.duration}min</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <BarChart3 className="w-4 h-4" />
                  <span>Exercices</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <Zap className="w-4 h-4" />
                  <span>Intensité</span>
                </div>

                <div className="flex items-center gap-1 text-gray-600">
                  <Weight className="w-4 h-4" />
                  <span>Poids</span>
                </div>
              </div>

              {/* Notes (si présentes) */}
              {session.notes && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                  <p className="truncate">{session.notes}</p>
                </div>
              )}

              {/* Objectifs (si présents) */}
              {session.objectives && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {session.objectives.map((objective, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {objective}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView?.(session)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Eye className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView?.(session)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Voir les détails
                  </DropdownMenuItem>
                  {session.status !== 'completed' && (
                    <DropdownMenuItem onClick={() => onEdit?.(session)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Modifier
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => onDelete?.(session)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionHistoryItem;
