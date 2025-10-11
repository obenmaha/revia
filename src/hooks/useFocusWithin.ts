import { useState, useRef, useCallback } from 'react';

export function useFocusWithin<T extends HTMLElement = HTMLElement>() {
  const [isFocusWithin, setIsFocusWithin] = useState(false);
  const ref = useRef<T>(null);

  const handleFocusIn = useCallback(() => setIsFocusWithin(true), []);
  const handleFocusOut = useCallback(() => setIsFocusWithin(false), []);

  useEffect(() => {
    const element = ref.current;
    if (element) {
      element.addEventListener('focusin', handleFocusIn);
      element.addEventListener('focusout', handleFocusOut);

      return () => {
        element.removeEventListener('focusin', handleFocusIn);
        element.removeEventListener('focusout', handleFocusOut);
      };
    }
  }, [handleFocusIn, handleFocusOut]);

  return [ref, isFocusWithin] as const;
}
