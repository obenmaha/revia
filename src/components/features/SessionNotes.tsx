// Composant de notes de session - Story 2.6
import React, { useState } from 'react';
import {
  FileText,
  Edit3,
  Save,
  X,
  Calendar,
  User,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Session } from '@/types/session';

interface SessionNotesProps {
  session: Session;
  onUpdateNotes?: (notes: string) => void;
  isEditable?: boolean;
  className?: string;
}

const SessionNotes: React.FC<SessionNotesProps> = ({
  session,
  onUpdateNotes,
  isEditable = false,
  className = '',
}) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(session.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedNotes(session.notes || '');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedNotes(session.notes || '');
  };

  const handleSave = async () => {
    if (!onUpdateNotes) return;

    setIsSaving(true);
    try {
      await onUpdateNotes(editedNotes);
      setIsEditing(false);
      toast({
        title: 'Notes mises à jour',
        description: 'Vos notes ont été sauvegardées avec succès.',
      });
    } catch {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les notes. Veuillez réessayer.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
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
      return formatDate(date);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notes de session */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notes de session
            </CardTitle>
            {isEditable && !isEditing && (
              <Button variant="outline" size="sm" onClick={handleEdit}>
                <Edit3 className="w-4 h-4 mr-2" />
                Modifier
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedNotes}
                onChange={e => setEditedNotes(e.target.value)}
                placeholder="Ajoutez vos notes sur cette session..."
                className="min-h-[120px]"
                maxLength={1000}
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  {editedNotes.length}/1000 caractères
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Sauvegarder
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {session.notes ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {session.notes}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">
                    {isEditable
                      ? 'Aucune note pour cette session. Cliquez sur "Modifier" pour en ajouter.'
                      : 'Aucune note pour cette session.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Objectifs de session */}
      {session.objectives && session.objectives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Objectifs de session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {session.objectives.map((objective, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {objective}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métadonnées de session */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5" />
            Informations de session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-600 mb-1">Créée le</div>
              <div className="text-gray-900">
                {formatDate(session.createdAt)} à{' '}
                {formatTime(session.createdAt)}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {getRelativeDate(session.createdAt)}
              </div>
            </div>

            <div>
              <div className="font-medium text-gray-600 mb-1">Modifiée le</div>
              <div className="text-gray-900">
                {formatDate(session.updatedAt)} à{' '}
                {formatTime(session.updatedAt)}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {getRelativeDate(session.updatedAt)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionNotes;
