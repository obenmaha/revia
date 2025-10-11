import { useState } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  // Passer une fonction d'état initial à useState pour que la logique ne s'exécute qu'une seule fois
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      // Récupérer depuis le localStorage par clé
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou si aucun retour, retourner la valeur initiale
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Si une erreur, retourner la valeur initiale
      console.log(error);
      return initialValue;
    }
  });

  // Retourner une version enveloppée de la fonction setState de useState qui persiste la nouvelle valeur dans localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre à value d'être une fonction pour avoir la même API que useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Sauvegarder l'état
      setStoredValue(valueToStore);
      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // Une implémentation plus avancée gérerait le cas d'erreur
      console.log(error);
    }
  };

  return [storedValue, setValue] as const;
}
