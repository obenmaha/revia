import { useState, useCallback } from 'react';

export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(v => !v), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);
  const setValueCallback = useCallback((value: boolean) => setValue(value), []);

  return [
    value,
    { toggle, setTrue, setFalse, setValue: setValueCallback },
  ] as const;
}
