import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';

// Mock Supabase Client pour tous les tests
vi.mock('@supabase/supabase-js', () => {
  const mockAuth = {
    signInWithPassword: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signUp: vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    getSession: vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
    getUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    signInWithOAuth: vi.fn().mockResolvedValue({
      data: { provider: 'google', url: 'mock-url' },
      error: null,
    }),
    signInWithOtp: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
    resetPasswordForEmail: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    updateUser: vi.fn().mockResolvedValue({
      data: { user: null },
      error: null,
    }),
  };

  return {
    createClient: vi.fn(() => ({
      auth: mockAuth,
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        containedBy: vi.fn().mockReturnThis(),
        rangeGt: vi.fn().mockReturnThis(),
        rangeGte: vi.fn().mockReturnThis(),
        rangeLt: vi.fn().mockReturnThis(),
        rangeLte: vi.fn().mockReturnThis(),
        rangeAdjacent: vi.fn().mockReturnThis(),
        overlaps: vi.fn().mockReturnThis(),
        textSearch: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        abortSignal: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        csv: vi.fn().mockResolvedValue({ data: null, error: null }),
        geojson: vi.fn().mockResolvedValue({ data: null, error: null }),
        explain: vi.fn().mockResolvedValue({ data: null, error: null }),
        rollback: vi.fn().mockResolvedValue({ data: null, error: null }),
        returns: vi.fn().mockReturnThis(),
        then: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
      storage: {
        from: vi.fn(() => ({
          upload: vi.fn().mockResolvedValue({ data: null, error: null }),
          download: vi.fn().mockResolvedValue({ data: null, error: null }),
          remove: vi.fn().mockResolvedValue({ data: null, error: null }),
          list: vi.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: vi
            .fn()
            .mockReturnValue({ data: { publicUrl: 'mock-url' } }),
          createSignedUrl: vi.fn().mockResolvedValue({
            data: { signedUrl: 'mock-signed-url' },
            error: null,
          }),
          createSignedUrls: vi
            .fn()
            .mockResolvedValue({ data: [], error: null }),
          update: vi.fn().mockResolvedValue({ data: null, error: null }),
          move: vi.fn().mockResolvedValue({ data: null, error: null }),
          copy: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      },
      rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
      realtime: {
        channel: vi.fn(() => ({
          on: vi.fn().mockReturnThis(),
          subscribe: vi
            .fn()
            .mockResolvedValue({ status: 'SUBSCRIBED', error: null }),
          unsubscribe: vi
            .fn()
            .mockResolvedValue({ status: 'CLOSED', error: null }),
        })),
        removeChannel: vi
          .fn()
          .mockResolvedValue({ status: 'CLOSED', error: null }),
        removeAllChannels: vi
          .fn()
          .mockResolvedValue({ status: 'CLOSED', error: null }),
      },
    })),
  };
});

// Configuration des timers pour des tests stables
beforeAll(() => {
  // Utiliser des timers fake pour des tests prévisibles
  vi.useFakeTimers();
});

afterEach(() => {
  // Nettoyer les mocks après chaque test
  vi.clearAllMocks();
  // Avancer les timers pour éviter les timeouts
  vi.advanceTimersByTime(0);
});

afterAll(() => {
  // Restaurer les timers réels
  vi.useRealTimers();
});

// Polyfills pour les tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock pour les animations
Object.defineProperty(window, 'requestAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation(cb => setTimeout(cb, 0)),
});

Object.defineProperty(window, 'cancelAnimationFrame', {
  writable: true,
  value: vi.fn().mockImplementation(id => clearTimeout(id)),
});

// Mock pour les animations CSS
Object.defineProperty(window, 'getComputedStyle', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    transform: 'none',
    transition: 'none',
    animation: 'none',
  })),
});

// Mock pour les événements de transition
Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: vi.fn(),
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: vi.fn(),
});

// Mock pour les propriétés de style
Object.defineProperty(HTMLElement.prototype, 'style', {
  writable: true,
  value: {
    transform: '',
    transition: '',
    animation: '',
    opacity: '',
    scale: '',
    translateX: '',
    translateY: '',
  },
});

// Mock pour les propriétés de géométrie
Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 100,
    height: 100,
    x: 0,
    y: 0,
  })),
});

// Mock pour les propriétés de scroll
Object.defineProperty(window, 'scrollX', {
  writable: true,
  value: 0,
});

Object.defineProperty(window, 'scrollY', {
  writable: true,
  value: 0,
});

Object.defineProperty(document.documentElement, 'scrollTop', {
  writable: true,
  value: 0,
});

Object.defineProperty(document.documentElement, 'scrollLeft', {
  writable: true,
  value: 0,
});
