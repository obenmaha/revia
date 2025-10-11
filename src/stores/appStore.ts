import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // UI State
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';

  // Navigation
  currentPage: string;
  breadcrumbs: Array<{ label: string; href?: string }>;

  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setCurrentPage: (page: string) => void;
  setBreadcrumbs: (
    breadcrumbs: Array<{ label: string; href?: string }>
  ) => void;

  // Notifications
  addNotification: (
    notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>
  ) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Internal
  _generateId: () => string;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: true,
      theme: 'system',
      currentPage: 'dashboard',
      breadcrumbs: [{ label: 'Tableau de bord' }],
      notifications: [],

      // UI Actions
      toggleSidebar: () => {
        set(state => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      setTheme: (theme: 'light' | 'dark' | 'system') => {
        set({ theme });

        // Appliquer le thème au document
        const root = document.documentElement;
        if (theme === 'system') {
          const prefersDark = window.matchMedia(
            '(prefers-color-scheme: dark)'
          ).matches;
          root.classList.toggle('dark', prefersDark);
        } else {
          root.classList.toggle('dark', theme === 'dark');
        }
      },

      setCurrentPage: (page: string) => {
        set({ currentPage: page });
      },

      setBreadcrumbs: (
        breadcrumbs: Array<{ label: string; href?: string }>
      ) => {
        set({ breadcrumbs });
      },

      // Notification Actions
      addNotification: notification => {
        const id = get()._generateId();
        const newNotification = {
          ...notification,
          id,
          timestamp: new Date(),
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications].slice(0, 50), // Limite à 50 notifications
        }));
      },

      removeNotification: (id: string) => {
        set(state => ({
          notifications: state.notifications.filter(n => n.id !== id),
        }));
      },

      markNotificationAsRead: (id: string) => {
        set(state => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearAllNotifications: () => {
        set({ notifications: [] });
      },

      // Internal utilities
      _generateId: () => {
        return Math.random().toString(36).substr(2, 9);
      },
    }),
    {
      name: 'app-storage',
      partialize: state => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
