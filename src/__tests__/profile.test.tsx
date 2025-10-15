// Tests pour la page de profil utilisateur - Story FR1
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ProfilePage from '../pages/ProfilePage';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';

// Mock des hooks
vi.mock('../hooks/useAuth');
vi.mock('../hooks/useUserProfile');

// Mock de React Router
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock des composants UI
vi.mock('../components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('../components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h3 {...props}>{children}</h3>,
}));

vi.mock('../components/ui/input', () => ({
  Input: ({ onChange, value, ...props }: any) => (
    <input onChange={onChange} value={value} {...props} />
  ),
}));

vi.mock('../components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

vi.mock('../components/ui/textarea', () => ({
  Textarea: ({ onChange, value, ...props }: any) => (
    <textarea onChange={onChange} value={value} {...props} />
  ),
}));

vi.mock('../components/ui/select', () => ({
  Select: ({ children, onValueChange, value }: any) => (
    <select value={value} onChange={(e) => onValueChange(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <select>{children}</select>,
  SelectValue: () => <span>Select value</span>,
}));

vi.mock('../components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, id, ...props }: any) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      {...props}
    />
  ),
}));

vi.mock('../components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span className={`badge-${variant}`} {...props}>
      {children}
    </span>
  ),
}));

vi.mock('../components/ui/alert', () => ({
  Alert: ({ children, variant, ...props }: any) => (
    <div className={`alert-${variant}`} {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('../components/ui/tabs', () => ({
  Tabs: ({ children, value, onValueChange }: any) => (
    <div data-testid="tabs" data-value={value} onClick={() => onValueChange('goals')}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }: any) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
  TabsList: ({ children }: any) => <div>{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid={`tab-${value}`}>{children}</button>
  ),
}));

vi.mock('../components/ui/separator', () => ({
  Separator: () => <hr />,
}));

// Mock des icônes Lucide
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <span>←</span>,
  Edit: () => <span>✏️</span>,
  Save: () => <span>💾</span>,
  X: () => <span>✕</span>,
  User: () => <span>👤</span>,
  Target: () => <span>🎯</span>,
  Settings: () => <span>⚙️</span>,
  Bell: () => <span>🔔</span>,
  Palette: () => <span>🎨</span>,
  Shield: () => <span>🛡️</span>,
  Globe: () => <span>🌍</span>,
  Loader2: () => <span>⏳</span>,
  AlertTriangle: () => <span>⚠️</span>,
  CheckCircle: () => <span>✅</span>,
}));

// Helper pour créer un QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

// Helper pour wrapper les composants
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Données de test
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'practitioner' as const,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile = {
  id: 'profile-123',
  user_id: 'user-123',
  first_name: 'John',
  last_name: 'Doe',
  email: 'test@example.com',
  phone: '06 12 34 56 78',
  birth_date: '1990-01-01',
  gender: 'male' as const,
  height_cm: 180,
  weight_kg: 75,
  fitness_level: 'intermediate' as const,
  goals: {
    primary_goal: 'Perdre du poids',
    secondary_goals: ['Améliorer l\'endurance', 'Renforcer le dos'],
    target_weight: 70,
    target_date: '2024-12-31',
  },
  preferences: {
    theme: 'system' as const,
    notifications: {
      email: true,
      push: false,
      reminders: true,
      achievements: false,
    },
    units: {
      weight: 'kg' as const,
      height: 'cm' as const,
      distance: 'km' as const,
    },
    privacy: {
      profile_visibility: 'private' as const,
      activity_sharing: false,
    },
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('ProfilePage', () => {
  let mockUseAuth: any;
  let mockUseUserProfile: any;

  beforeEach(() => {
    mockUseAuth = vi.mocked(useAuth);
    mockUseUserProfile = vi.mocked(useUserProfile);

    // Mock par défaut pour useAuth
    mockUseAuth.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock par défaut pour useUserProfile
    mockUseUserProfile.mockReturnValue({
      profile: mockProfile,
      isLoading: false,
      isError: false,
      error: null,
      updateProfile: vi.fn(),
      isUpdating: false,
      updateError: null,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Affichage initial', () => {
    it('affiche le profil utilisateur quand l\'utilisateur est connecté', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Mon Profil')).toBeInTheDocument();
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('Doe')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('affiche un message d\'erreur quand l\'utilisateur n\'est pas connecté', () => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Vous devez être connecté pour accéder à votre profil.')).toBeInTheDocument();
    });

    it('affiche un état de chargement', () => {
      mockUseUserProfile.mockReturnValue({
        profile: null,
        isLoading: true,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Chargement du profil...')).toBeInTheDocument();
    });

    it('affiche une erreur de chargement', () => {
      mockUseUserProfile.mockReturnValue({
        profile: null,
        isLoading: false,
        isError: true,
        error: 'Erreur de chargement',
        updateProfile: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });
  });

  describe('Mode édition', () => {
    it('passe en mode édition quand on clique sur Modifier', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      const editButton = screen.getByText('Modifier');
      fireEvent.click(editButton);

      expect(screen.getByText('Sauvegarder')).toBeInTheDocument();
      expect(screen.getByText('Annuler')).toBeInTheDocument();
    });

    it('permet de modifier les informations personnelles', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      // Vérifier que les champs sont éditables
      const firstNameInput = screen.getByDisplayValue('John');
      expect(firstNameInput).toBeInTheDocument();

      // Modifier le prénom
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      expect(firstNameInput).toHaveValue('Jane');
    });

    it('permet de modifier les objectifs', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      // Aller à l'onglet objectifs
      fireEvent.click(screen.getByTestId('tab-goals'));

      // Vérifier que les champs d'objectifs sont éditables
      const primaryGoalInput = screen.getByDisplayValue('Perdre du poids');
      expect(primaryGoalInput).toBeInTheDocument();

      // Modifier l'objectif principal
      fireEvent.change(primaryGoalInput, { target: { value: 'Prendre du muscle' } });
      expect(primaryGoalInput).toHaveValue('Prendre du muscle');
    });

    it('permet de modifier les préférences', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      // Aller à l'onglet préférences
      fireEvent.click(screen.getByTestId('tab-preferences'));

      // Vérifier que les switches de notifications sont présents
      const emailSwitch = screen.getByRole('checkbox', { name: /email/i });
      expect(emailSwitch).toBeInTheDocument();
      expect(emailSwitch).toBeChecked();
    });
  });

  describe('Sauvegarde', () => {
    it('sauvegarde les modifications avec succès', async () => {
      const mockUpdateProfile = vi.fn().mockResolvedValue(undefined);
      mockUseUserProfile.mockReturnValue({
        profile: mockProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: mockUpdateProfile,
        isUpdating: false,
        updateError: null,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      // Modifier un champ
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      // Sauvegarder
      fireEvent.click(screen.getByText('Sauvegarder'));

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      }, { timeout: 5000 });
    });

    it('affiche une erreur en cas d\'échec de sauvegarde', () => {
      const mockError = new Error('Erreur de sauvegarde');
      mockUseUserProfile.mockReturnValue({
        profile: mockProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: false,
        updateError: mockError,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      expect(screen.getByText('Erreur lors de la mise à jour : Erreur de sauvegarde')).toBeInTheDocument();
    });

    it('affiche un état de chargement pendant la sauvegarde', () => {
      mockUseUserProfile.mockReturnValue({
        profile: mockProfile,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: vi.fn(),
        isUpdating: true,
        updateError: null,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      expect(screen.getByText('Sauvegarde...')).toBeInTheDocument();
    });
  });

  describe('Annulation', () => {
    it('annule les modifications et revient au mode affichage', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      // Modifier un champ
      const firstNameInput = screen.getByDisplayValue('John');
      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });

      // Annuler
      fireEvent.click(screen.getByText('Annuler'));

      // Vérifier qu'on est revenu au mode affichage
      expect(screen.getByText('Modifier')).toBeInTheDocument();
      expect(screen.queryByText('Sauvegarder')).not.toBeInTheDocument();
    });
  });

  describe('Navigation par onglets', () => {
    it('permet de naviguer entre les onglets', () => {
      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Vérifier que l'onglet personnel est actif par défaut
      expect(screen.getByTestId('tab-content-personal')).toBeInTheDocument();

      // Cliquer sur l'onglet objectifs
      fireEvent.click(screen.getByTestId('tab-goals'));

      // Vérifier que l'onglet objectifs est maintenant actif
      expect(screen.getByTestId('tab-content-goals')).toBeInTheDocument();
    });
  });

  describe('Création de profil', () => {
    it('crée un profil si aucun n\'existe', async () => {
      const mockCreateProfile = vi.fn().mockResolvedValue(undefined);
      mockUseUserProfile.mockReturnValue({
        profile: null,
        isLoading: false,
        isError: false,
        error: null,
        updateProfile: mockCreateProfile,
        isUpdating: false,
        updateError: null,
      });

      render(
        <TestWrapper>
          <ProfilePage />
        </TestWrapper>
      );

      // Passer en mode édition
      fireEvent.click(screen.getByText('Modifier'));

      // Remplir les champs
      const firstNameInput = screen.getByPlaceholderText('Votre prénom');
      fireEvent.change(firstNameInput, { target: { value: 'John' } });

      // Sauvegarder
      fireEvent.click(screen.getByText('Sauvegarder'));

      await waitFor(() => {
        expect(mockCreateProfile).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });
});
