import { vi } from 'vitest';
import type { UseNotificationsReturn } from '@/hooks/useNotifications';

// Mock pour useNotifications hook
export const useNotifications = vi.fn((): UseNotificationsReturn => ({
  // État des préférences
  preferences: null,
  isLoading: false,
  isError: false,
  error: null,

  // État des permissions
  permission: 'granted' as NotificationPermission,
  isSupported: true,

  // Actions
  updatePreferences: vi.fn().mockResolvedValue(undefined),
  requestPermission: vi.fn().mockResolvedValue(true),
  scheduleLocalReminder: vi.fn().mockResolvedValue(undefined),
  cancelReminder: vi.fn(),
  cancelAllReminders: vi.fn(),

  // États des mutations
  isUpdating: false,
  isRequestingPermission: false,

  // Erreurs des mutations
  updateError: null,
  permissionError: null,

  // Refetch
  refetch: vi.fn(),
}));

// Mock pour useScheduleSessionReminder
export const useScheduleSessionReminder = vi.fn(() => ({
  scheduleSessionReminder: vi.fn().mockResolvedValue({
    reminderTime: new Date(),
    delay: 0,
    cancelled: false,
  }),
}));
