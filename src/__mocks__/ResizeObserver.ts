// Mock pour ResizeObserver
export class ResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

// Mock global ResizeObserver
(global as any).ResizeObserver = ResizeObserver;
