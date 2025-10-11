import { useState, useRef, useCallback, useEffect } from 'react';

export function useFocusVisible<T extends HTMLElement = HTMLElement>() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const ref = useRef<T>(null);

  const handleFocus = useCallback((event: FocusEvent) => {
    if (event.target instanceof HTMLElement) {
      setIsFocusVisible(event.target.matches(':focus-visible'));
    }
  }, []);

  const handleBlur = useCallback(() => setIsFocusVisible(false), []);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('focus', handleFocus);
      element.addEventListener('blur', handleBlur);

      return () => {
        element.removeEventListener('focus', handleFocus);
        element.removeEventListener('blur', handleBlur);
      };
    }
  }, [handleFocus, handleBlur]);

  return [ref, isFocusVisible] as const;
}
