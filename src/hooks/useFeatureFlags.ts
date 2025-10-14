import { useMemo } from 'react';

export interface FeatureFlags {
  SPORT_MODE: boolean;
  CABINET_MODE: boolean;
  MOBILE_NAVIGATION: boolean;
  GAMIFICATION: boolean;
  GUEST_MODE: boolean;
}

export function useFeatureFlags(): FeatureFlags {
  return useMemo(() => {
    // Lecture des variables d'environnement avec fallbacks
    const sportMode =
      import.meta.env.VITE_SPORT_MODE === 'true' ||
      import.meta.env.VITE_APP_MODE === 'sport';
    const cabinetMode =
      import.meta.env.VITE_CABINET_MODE === 'true' ||
      import.meta.env.VITE_APP_MODE === 'cabinet';

    return {
      SPORT_MODE: sportMode,
      CABINET_MODE: cabinetMode || (!sportMode && !cabinetMode), // Par défaut cabinet si rien n'est défini
      MOBILE_NAVIGATION:
        import.meta.env.VITE_MOBILE_NAVIGATION === 'true' || sportMode,
      GAMIFICATION: import.meta.env.VITE_GAMIFICATION === 'true' || sportMode,
      GUEST_MODE: import.meta.env.VITE_GUEST_MODE === 'true',
    };
  }, []);
}

// Hook pour détecter si on est sur mobile
export function useIsMobile(): boolean {
  return useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768; // Tailwind md breakpoint
  }, []);
}

// Hook pour obtenir le mode actuel de l'application
export function useAppMode(): 'sport' | 'cabinet' {
  const { SPORT_MODE, CABINET_MODE } = useFeatureFlags();

  if (SPORT_MODE) return 'sport';
  if (CABINET_MODE) return 'cabinet';

  // Par défaut, mode cabinet pour préserver l'existant
  return 'cabinet';
}
