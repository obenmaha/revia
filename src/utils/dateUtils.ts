// Utilitaires de date optimisés - Import centralisé pour réduire le bundle
import { format, addDays, addWeeks, isAfter, isBefore, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';

// Export des fonctions les plus utilisées
export { addDays, addWeeks, isAfter, isBefore, isSameDay };

// Fonction de formatage avec locale française par défaut
export const formatDate = (date: Date, formatStr: string = 'dd/MM/yyyy') => {
  return format(date, formatStr, { locale: fr });
};

// Fonction de formatage pour les heures
export const formatTime = (date: Date) => {
  return format(date, 'HH:mm', { locale: fr });
};

// Fonction de formatage pour les dates complètes
export const formatDateTime = (date: Date) => {
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
};

// Fonction de formatage pour les dates longues
export const formatDateLong = (date: Date) => {
  return format(date, 'EEEE dd MMMM yyyy', { locale: fr });
};

// Export de la locale pour les cas spéciaux
export { fr as frenchLocale };
