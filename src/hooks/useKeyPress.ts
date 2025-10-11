import { useEffect, useCallback } from 'react';

export function useKeyPress(targetKey: string, handler: () => void) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === targetKey) {
        handler();
      }
    },
    [targetKey, handler]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
}
