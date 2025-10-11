import { useState, useRef, useCallback, useEffect } from 'react';

export function useFocus<T extends HTMLElement = HTMLElement>() {
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<T>(null);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

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

  return [ref, isFocused] as const;
}
