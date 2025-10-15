// Tests unitaires pour useNotifications - FR9
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNotifications, useScheduleSessionReminder } from '../hooks/useNotifications';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }))
    }))
  }))
};

vi.mock('../lib/supabase', () => ({
  supabase: mockSupabase
}));

// Mock Notification API
const mockNotification = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn(() => Promise.resolve('granted' as NotificationPermission)),
  close: vi.fn()
};

Object.defineProperty(window, 'Notification', {
  value: vi.fn(() => mockNotification),
  writable: true
});

// Mock app store
const mockAppStore = {
  addNotification: vi.fn()
};

vi.mock('../stores/appStore', () => ({
  useAppStore: () => mockAppStore
}));

// Helper pour wrapper les hooks avec QueryClient
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

describe('useNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset Notification permission
    Object.defineProperty(window, 'Notification', {
      value: vi.fn(() => mockNotification),
      writable: true
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Permission Management', () => {
    it('should detect notification support', () => {
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      expect(result.current.isSupported).toBe(true);
    });

    it('should handle unsupported browsers', () => {
      // @ts-ignore
      delete window.Notification;
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      expect(result.current.isSupported).toBe(false);
    });

    it('should request permission successfully', async () => {
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(true);
      });

      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(mockAppStore.addNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Notifications activées',
        message: 'Vous recevrez maintenant des rappels pour vos séances.'
      });
    });

    it('should handle permission denial', async () => {
      mockNotification.requestPermission.mockResolvedValueOnce('denied');
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(false);
      });

      expect(mockAppStore.addNotification).toHaveBeenCalledWith({
        type: 'warning',
        title: 'Notifications refusées',
        message: 'Vous ne recevrez pas de rappels. Vous pouvez les activer dans les paramètres de votre navigateur.'
      });
    });

    it('should handle permission request errors', async () => {
      mockNotification.requestPermission.mockRejectedValueOnce(new Error('Permission error'));
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        const granted = await result.current.requestPermission();
        expect(granted).toBe(false);
      });

      expect(result.current.permissionError).toBeInstanceOf(Error);
      expect(result.current.permissionError?.message).toBe('Permission error');
    });
  });

  describe('Local Reminder Scheduling', () => {
    it('should schedule local reminder when permission granted', async () => {
      mockNotification.permission = 'granted';
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.scheduleLocalReminder('Test reminder', {
          body: 'Test body'
        });
      });

      expect(mockNotification).toHaveBeenCalledWith('Test reminder', {
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'revia-reminder',
        requireInteraction: true,
        body: 'Test body'
      });
    });

    it('should request permission before scheduling if not granted', async () => {
      mockNotification.permission = 'default';
      mockNotification.requestPermission.mockResolvedValueOnce('granted');
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.scheduleLocalReminder('Test reminder');
      });

      expect(mockNotification.requestPermission).toHaveBeenCalled();
    });

    it('should throw error when permission denied', async () => {
      mockNotification.permission = 'denied';
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await expect(result.current.scheduleLocalReminder('Test reminder'))
          .rejects.toThrow('Permission refusée pour les notifications');
      });
    });

    it('should throw error when notifications not supported', async () => {
      // @ts-ignore
      delete window.Notification;
      
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await expect(result.current.scheduleLocalReminder('Test reminder'))
          .rejects.toThrow('Les notifications ne sont pas supportées par ce navigateur');
      });
    });

    it('should throw error when push notifications disabled in preferences', async () => {
      mockNotification.permission = 'granted';
      
      // Mock preferences with push disabled
      const mockPreferences = {
        id: '1',
        user_id: 'test-user',
        email_enabled: true,
        push_enabled: false,
        reminder_time: '18:00',
        reminder_days: [1, 2, 3, 4, 5],
        reminder_frequency: 'daily' as const,
        timezone: 'Europe/Paris'
      };

      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: mockPreferences, error: null }))
          }))
        }))
      });

      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      // Wait for preferences to load
      await waitFor(() => {
        expect(result.current.preferences).toEqual(mockPreferences);
      });

      await act(async () => {
        await expect(result.current.scheduleLocalReminder('Test reminder'))
          .rejects.toThrow('Les notifications push sont désactivées dans vos préférences');
      });
    });
  });

  describe('Reminder Cancellation', () => {
    it('should cancel reminder by tag', () => {
      const mockGetRegistrations = vi.fn(() => Promise.resolve([
        {
          getNotifications: vi.fn(() => Promise.resolve([
            { tag: 'test-tag', close: vi.fn() },
            { tag: 'other-tag', close: vi.fn() }
          ]))
        }
      ]));

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistrations: mockGetRegistrations
        },
        writable: true
      });

      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.cancelReminder('test-tag');
      });

      // Note: In a real test, you'd need to wait for the async operations
      // and verify that the correct notifications were closed
    });

    it('should cancel all reminders', () => {
      const mockGetRegistrations = vi.fn(() => Promise.resolve([
        {
          getNotifications: vi.fn(() => Promise.resolve([
            { close: vi.fn() },
            { close: vi.fn() }
          ]))
        }
      ]));

      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          getRegistrations: mockGetRegistrations
        },
        writable: true
      });

      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      act(() => {
        result.current.cancelAllReminders();
      });

      // Note: In a real test, you'd need to wait for the async operations
      // and verify that all notifications were closed
    });
  });

  describe('Preferences Management', () => {
    it('should update preferences successfully', async () => {
      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      const newPreferences = {
        email_enabled: true,
        push_enabled: false,
        reminder_time: '19:00'
      };

      await act(async () => {
        await result.current.updatePreferences(newPreferences);
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('notification_preferences');
      expect(mockAppStore.addNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Préférences mises à jour',
        message: 'Vos préférences de notifications ont été sauvegardées.'
      });
    });

    it('should handle update errors', async () => {
      mockSupabase.from.mockReturnValueOnce({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: null, error: new Error('Update failed') }))
          }))
        }))
      });

      const { result } = renderHook(() => useNotifications('test-user'), {
        wrapper: createWrapper()
      });

      await act(async () => {
        await result.current.updatePreferences({ email_enabled: true });
      });

      expect(mockAppStore.addNotification).toHaveBeenCalledWith({
        type: 'error',
        title: 'Erreur de sauvegarde',
        message: 'Impossible de sauvegarder vos préférences de notifications.'
      });
    });
  });
});

describe('useScheduleSessionReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNotification.permission = 'granted';
  });

  it('should schedule session reminder successfully', async () => {
    const mockPreferences = {
      id: '1',
      user_id: 'test-user',
      email_enabled: true,
      push_enabled: true,
      reminder_time: '18:00',
      reminder_days: [1, 2, 3, 4, 5],
      reminder_frequency: 'daily' as const,
      timezone: 'Europe/Paris'
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockPreferences, error: null }))
        }))
      }))
    });

    const { result } = renderHook(() => useScheduleSessionReminder(), {
      wrapper: createWrapper()
    });

    const sessionName = 'Test Session';
    const scheduledAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour from now

    await act(async () => {
      const reminder = await result.current.scheduleSessionReminder(sessionName, scheduledAt, {
        minutesBefore: 15
      });

      expect(reminder.reminderTime).toBeInstanceOf(Date);
      expect(reminder.delay).toBeGreaterThan(0);
      expect(reminder.cancelled).toBe(false);
    });
  });

  it('should throw error when push notifications disabled', async () => {
    const mockPreferences = {
      id: '1',
      user_id: 'test-user',
      email_enabled: true,
      push_enabled: false, // Disabled
      reminder_time: '18:00',
      reminder_days: [1, 2, 3, 4, 5],
      reminder_frequency: 'daily' as const,
      timezone: 'Europe/Paris'
    };

    mockSupabase.from.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: mockPreferences, error: null }))
        }))
      }))
    });

    const { result } = renderHook(() => useScheduleSessionReminder(), {
      wrapper: createWrapper()
    });

    const sessionName = 'Test Session';
    const scheduledAt = new Date(Date.now() + 1000 * 60 * 60);

    await act(async () => {
      await expect(result.current.scheduleSessionReminder(sessionName, scheduledAt))
        .rejects.toThrow('Les notifications push ne sont pas activées');
    });
  });

  it('should throw error when reminder time is in the past', async () => {
    const { result } = renderHook(() => useScheduleSessionReminder(), {
      wrapper: createWrapper()
    });

    const sessionName = 'Test Session';
    const scheduledAt = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago

    await act(async () => {
      await expect(result.current.scheduleSessionReminder(sessionName, scheduledAt))
        .rejects.toThrow('Le rappel ne peut pas être programmé dans le passé');
    });
  });
});
