import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Mettre à jour la valeur debounced après le délai
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Annuler le timeout si la valeur change (également en cas de démontage du composant)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Se réexécuter seulement si la valeur ou le délai changent

  return debouncedValue;
}
