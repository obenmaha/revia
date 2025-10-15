import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NewSessionPage } from '../../pages/new-session';

// Mock de react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock de date-fns
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    format: (date: Date, formatStr: string, options?: any) => {
      if (options?.locale?.code === 'fr') {
        return date.toLocaleDateString('fr-FR');
      }
      return date.toLocaleDateString();
    },
  };
});

// Mock de l'utilitaire duplicateDates
vi.mock('../../utils/duplicateDates', () => ({
  generateDuplicateDates: vi.fn((options) => ({
    dates: [
      options.startDate,
      new Date(options.startDate.getTime() + 24 * 60 * 60 * 1000),
      new Date(options.startDate.getTime() + 2 * 24 * 60 * 60 * 1000),
    ],
    totalCount: 3,
    isValid: true,
    errors: [],
  })),
}));

const renderNewSessionPage = () => {
  return render(
    <BrowserRouter>
      <NewSessionPage />
    </BrowserRouter>
  );
};

describe('NewSessionPage - Tests d\'intégration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendu initial', () => {
    it('devrait afficher le formulaire de création de séance', () => {
      renderNewSessionPage();

      expect(screen.getByText('Nouvelle séance')).toBeInTheDocument();
      expect(screen.getByLabelText('Nom de la séance')).toBeInTheDocument();
      expect(screen.getByLabelText('Type de séance')).toBeInTheDocument();
      expect(screen.getByLabelText('Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Heure')).toBeInTheDocument();
      expect(screen.getByLabelText('Durée (minutes)')).toBeInTheDocument();
    });

    it('devrait afficher la section de duplication', () => {
      renderNewSessionPage();

      expect(screen.getByText('Dupliquer cette séance')).toBeInTheDocument();
      expect(screen.getByLabelText('Dupliquer cette séance sur plusieurs dates')).toBeInTheDocument();
    });
  });

  describe('Saisie des informations de base', () => {
    it('devrait permettre de saisir le nom de la séance', () => {
      renderNewSessionPage();

      const nameInput = screen.getByLabelText('Nom de la séance');
      fireEvent.change(nameInput, { target: { value: 'Musculation du haut' } });

      expect(nameInput).toHaveValue('Musculation du haut');
    });

    it('devrait permettre de sélectionner le type de séance', () => {
      renderNewSessionPage();

      const typeSelect = screen.getByLabelText('Type de séance');
      fireEvent.click(typeSelect);

      expect(screen.getByText('Cardio')).toBeInTheDocument();
      expect(screen.getByText('Musculation')).toBeInTheDocument();
      expect(screen.getByText('Yoga')).toBeInTheDocument();
      expect(screen.getByText('Autre')).toBeInTheDocument();
    });

    it('devrait permettre de saisir l\'heure', () => {
      renderNewSessionPage();

      const timeInput = screen.getByLabelText('Heure');
      fireEvent.change(timeInput, { target: { value: '18:30' } });

      expect(timeInput).toHaveValue('18:30');
    });

    it('devrait permettre de saisir la durée', () => {
      renderNewSessionPage();

      const durationInput = screen.getByLabelText('Durée (minutes)');
      fireEvent.change(durationInput, { target: { value: '45' } });

      expect(durationInput).toHaveValue(45);
    });
  });

  describe('Fonctionnalité de duplication', () => {
    it('devrait activer la duplication quand la checkbox est cochée', () => {
      renderNewSessionPage();

      const duplicateCheckbox = screen.getByLabelText('Dupliquer cette séance sur plusieurs dates');
      fireEvent.click(duplicateCheckbox);

      expect(duplicateCheckbox).toBeChecked();
      expect(screen.getByLabelText('Type de récurrence')).toBeInTheDocument();
    });

    it('devrait afficher les options de récurrence quand la duplication est activée', () => {
      renderNewSessionPage();

      const duplicateCheckbox = screen.getByLabelText('Dupliquer cette séance sur plusieurs dates');
      fireEvent.click(duplicateCheckbox);

      expect(screen.getByText('Quotidien')).toBeInTheDocument();
      expect(screen.getByText('1 jour sur 2')).toBeInTheDocument();
      expect(screen.getByText('Hebdomadaire')).toBeInTheDocument();
    });

    it('devrait permettre de sélectionner le type de récurrence', () => {
      renderNewSessionPage();

      const duplicateCheckbox = screen.getByLabelText('Dupliquer cette séance sur plusieurs dates');
      fireEvent.click(duplicateCheckbox);

      const typeSelect = screen.getByLabelText('Type de récurrence');
      fireEvent.click(typeSelect);

      expect(screen.getByText('Tous les jours')).toBeInTheDocument();
      expect(screen.getByText('Un jour sur deux')).toBeInTheDocument();
      expect(screen.getByText('Toutes les semaines')).toBeInTheDocument();
    });

    it('devrait permettre de saisir le nombre de séances', () => {
      renderNewSessionPage();

      const duplicateCheckbox = screen.getByLabelText('Dupliquer cette séance sur plusieurs dates');
      fireEvent.click(duplicateCheckbox);

      const countInput = screen.getByLabelText('Nombre de séances');
      fireEvent.change(countInput, { target: { value: '10' } });

      expect(countInput).toHaveValue(10);
    });
  });

  describe('Validation et soumission', () => {
    it('devrait valider les champs obligatoires', async () => {
      renderNewSessionPage();

      const submitButton = screen.getByText('Créer la séance');
      fireEvent.click(submitButton);

      // Les champs obligatoires devraient être marqués comme requis
      expect(screen.getByLabelText('Nom de la séance')).toBeRequired();
      expect(screen.getByLabelText('Heure')).toBeRequired();
    });

    it('devrait soumettre le formulaire avec les données correctes', async () => {
      renderNewSessionPage();

      // Remplir le formulaire
      fireEvent.change(screen.getByLabelText('Nom de la séance'), {
        target: { value: 'Test Session' },
      });
      fireEvent.change(screen.getByLabelText('Heure'), {
        target: { value: '18:00' },
      });
      fireEvent.change(screen.getByLabelText('Durée (minutes)'), {
        target: { value: '30' },
      });

      const submitButton = screen.getByText('Créer la séance');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Création...')).toBeInTheDocument();
      });

      // Attendre la redirection
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sport/dashboard');
      });
    });

    it('devrait gérer la duplication lors de la soumission', async () => {
      renderNewSessionPage();

      // Remplir le formulaire de base
      fireEvent.change(screen.getByLabelText('Nom de la séance'), {
        target: { value: 'Test Session' },
      });
      fireEvent.change(screen.getByLabelText('Heure'), {
        target: { value: '18:00' },
      });

      // Activer la duplication
      const duplicateCheckbox = screen.getByLabelText('Dupliquer cette séance sur plusieurs dates');
      fireEvent.click(duplicateCheckbox);

      fireEvent.change(screen.getByLabelText('Nombre de séances'), {
        target: { value: '5' },
      });

      const submitButton = screen.getByText('Créer la séance');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sport/dashboard');
      });
    });
  });

  describe('Navigation', () => {
    it('devrait naviguer vers le dashboard lors de l\'annulation', () => {
      renderNewSessionPage();

      const cancelButton = screen.getByText('Annuler');
      fireEvent.click(cancelButton);

      expect(mockNavigate).toHaveBeenCalledWith('/sport/dashboard');
    });
  });

  describe('Gestion des erreurs', () => {
    it('devrait afficher un état de chargement pendant la soumission', async () => {
      renderNewSessionPage();

      // Remplir le formulaire
      fireEvent.change(screen.getByLabelText('Nom de la séance'), {
        target: { value: 'Test Session' },
      });
      fireEvent.change(screen.getByLabelText('Heure'), {
        target: { value: '18:00' },
      });

      const submitButton = screen.getByText('Créer la séance');
      fireEvent.click(submitButton);

      expect(screen.getByText('Création...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Tests de régression - Scénarios complexes', () => {
    it('devrait gérer un formulaire complet avec duplication hebdomadaire', async () => {
      renderNewSessionPage();

      // Remplir toutes les informations
      fireEvent.change(screen.getByLabelText('Nom de la séance'), {
        target: { value: 'Séance complète' },
      });
      fireEvent.change(screen.getByLabelText('Heure'), {
        target: { value: '19:30' },
      });
      fireEvent.change(screen.getByLabelText('Durée (minutes)'), {
        target: { value: '60' },
      });
      fireEvent.change(screen.getByLabelText('Objectifs'), {
        target: { value: 'Développer la force' },
      });
      fireEvent.change(screen.getByLabelText('Notes'), {
        target: { value: 'Séance intensive' },
      });

      // Activer la duplication hebdomadaire
      const duplicateCheckbox = screen.getByLabelText('Dupliquer cette séance sur plusieurs dates');
      fireEvent.click(duplicateCheckbox);

      const typeSelect = screen.getByLabelText('Type de récurrence');
      fireEvent.click(typeSelect);
      fireEvent.click(screen.getByText('Hebdomadaire'));

      fireEvent.change(screen.getByLabelText('Nombre de séances'), {
        target: { value: '4' },
      });

      const submitButton = screen.getByText('Créer la séance');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/sport/dashboard');
      });
    });

    it('devrait gérer la validation des champs numériques', () => {
      renderNewSessionPage();

      const durationInput = screen.getByLabelText('Durée (minutes)');
      
      // Tester les limites
      fireEvent.change(durationInput, { target: { value: '0' } });
      expect(durationInput).toHaveValue(0);

      fireEvent.change(durationInput, { target: { value: '300' } });
      expect(durationInput).toHaveValue(300);

      fireEvent.change(durationInput, { target: { value: '301' } });
      expect(durationInput).toHaveValue(301); // L'input HTML5 ne bloque pas, mais la validation devrait le faire
    });
  });
});
