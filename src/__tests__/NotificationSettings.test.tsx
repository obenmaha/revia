// Tests unitaires pour NotificationSettings - FR9
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationSettings } from '../components/notifications/NotificationSettings';

// Mock des hooks
const mockUseNotifications = {
  preferences: {
    id: '1',
    user_id: 'test-user',
    email_enabled: false,
    push_enabled: false,
    reminder_time: '18:00',
    reminder_days: [1, 2, 3, 4, 5],
    reminder_frequency: 'twice_weekly' as const,
    timezone: 'Europe/Paris'
  },
  isLoading: false,
  isError: false,
  updatePreferences: vi.fn(),
  isUpdating: false,
  updateError: null,
  requestPermission: vi.fn(),
  permission: 'default' as NotificationPermission,
  isSupported: true,
};

vi.mock('../hooks/useNotifications', () => ({
  useNotifications: () => mockUseNotifications
}));

// Mock des composants UI
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: any) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <div data-testid="card-title">{children}</div>
}));

vi.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled, ...props }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      {...props}
    />
  )
}));

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} {...props}>{children}</label>
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <select value={value} onChange={(e) => onValueChange?.(e.target.value)}>
      {children}
    </select>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: () => <div>Select value</div>
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span data-variant={variant} {...props}>{children}</span>
  )
}));

vi.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>
}));

vi.mock('../components/notifications/NotificationPermissionModal', () => ({
  NotificationPermissionModal: ({ isOpen, onClose, onPermissionGranted }: any) => 
    isOpen ? (
      <div data-testid="permission-modal">
        <button onClick={onClose}>Close</button>
        <button onClick={onPermissionGranted}>Grant Permission</button>
      </div>
    ) : null
}));

// Helper pour wrapper avec QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('NotificationSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render notification settings form', () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Notifications par email')).toBeInTheDocument();
    expect(screen.getByText('Notifications push')).toBeInTheDocument();
    expect(screen.getByText('Heure des rappels')).toBeInTheDocument();
    expect(screen.getByText('Fréquence des rappels')).toBeInTheDocument();
    expect(screen.getByText('Jours de rappel')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    const loadingMock = { ...mockUseNotifications, isLoading: true };
    vi.mocked(require('../hooks/useNotifications').useNotifications).mockReturnValue(loadingMock);

    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Chargement des préférences...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    const errorMock = { ...mockUseNotifications, isError: true };
    vi.mocked(require('../hooks/useNotifications').useNotifications).mockReturnValue(errorMock);

    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Erreur')).toBeInTheDocument();
    expect(screen.getByText(/Impossible de charger les préférences/)).toBeInTheDocument();
  });

  it('should toggle email notifications', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const emailSwitch = screen.getByLabelText('Notifications par email');
    expect(emailSwitch).not.toBeChecked();

    fireEvent.click(emailSwitch);
    expect(emailSwitch).toBeChecked();
  });

  it('should toggle push notifications and show permission modal', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const pushSwitch = screen.getByLabelText('Notifications push');
    expect(pushSwitch).not.toBeChecked();

    fireEvent.click(pushSwitch);
    
    await waitFor(() => {
      expect(screen.getByTestId('permission-modal')).toBeInTheDocument();
    });
  });

  it('should handle permission granted', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const pushSwitch = screen.getByLabelText('Notifications push');
    fireEvent.click(pushSwitch);

    await waitFor(() => {
      expect(screen.getByTestId('permission-modal')).toBeInTheDocument();
    });

    const grantButton = screen.getByText('Grant Permission');
    fireEvent.click(grantButton);

    await waitFor(() => {
      expect(screen.queryByTestId('permission-modal')).not.toBeInTheDocument();
    });

    expect(pushSwitch).toBeChecked();
  });

  it('should change reminder time', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const timeSelect = screen.getByDisplayValue('18:00');
    fireEvent.change(timeSelect, { target: { value: '19:00' } });

    expect(timeSelect).toHaveValue('19:00');
  });

  it('should change reminder frequency', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const frequencySelect = screen.getByDisplayValue('twice_weekly');
    fireEvent.change(frequencySelect, { target: { value: 'daily' } });

    expect(frequencySelect).toHaveValue('daily');
  });

  it('should toggle reminder days', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const mondayButton = screen.getByText('Lun');
    expect(mondayButton).toHaveAttribute('data-variant', 'default');

    fireEvent.click(mondayButton);
    expect(mondayButton).toHaveAttribute('data-variant', 'outline');

    fireEvent.click(mondayButton);
    expect(mondayButton).toHaveAttribute('data-variant', 'default');
  });

  it('should save preferences when save button clicked', async () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const emailSwitch = screen.getByLabelText('Notifications par email');
    fireEvent.click(emailSwitch);

    const saveButton = screen.getByText('Sauvegarder');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUseNotifications.updatePreferences).toHaveBeenCalled();
    });
  });

  it('should disable save button when no changes', () => {
    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    const saveButton = screen.getByText('Sauvegarder');
    expect(saveButton).toBeDisabled();
  });

  it('should show update error', () => {
    const errorMock = { 
      ...mockUseNotifications, 
      updateError: new Error('Update failed') 
    };
    vi.mocked(require('../hooks/useNotifications').useNotifications).mockReturnValue(errorMock);

    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText(/Erreur lors de la sauvegarde/)).toBeInTheDocument();
  });

  it('should show unsupported browser message', () => {
    const unsupportedMock = { ...mockUseNotifications, isSupported: false };
    vi.mocked(require('../hooks/useNotifications').useNotifications).mockReturnValue(unsupportedMock);

    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Non supporté')).toBeInTheDocument();
  });

  it('should show blocked notifications message', () => {
    const blockedMock = { ...mockUseNotifications, permission: 'denied' as NotificationPermission };
    vi.mocked(require('../hooks/useNotifications').useNotifications).mockReturnValue(blockedMock);

    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Bloqué')).toBeInTheDocument();
    expect(screen.getByText(/Les notifications sont bloquées/)).toBeInTheDocument();
  });

  it('should show granted permission badge', () => {
    const grantedMock = { ...mockUseNotifications, permission: 'granted' as NotificationPermission };
    vi.mocked(require('../hooks/useNotifications').useNotifications).mockReturnValue(grantedMock);

    render(<NotificationSettings userId="test-user" />, {
      wrapper: createWrapper()
    });

    expect(screen.getByText('Autorisé')).toBeInTheDocument();
  });
});
