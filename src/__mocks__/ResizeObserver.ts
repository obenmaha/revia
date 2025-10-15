import { vi } from 'vitest';

// Mock pour ResizeObserver
export class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// Mock global ResizeObserver
(global as any).ResizeObserver = ResizeObserver;
