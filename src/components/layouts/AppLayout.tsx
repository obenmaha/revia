import {
  useFeatureFlags,
  useIsMobile,
  useAppMode,
} from '../../hooks/useFeatureFlags';
import { SportMobileLayout } from './SportMobileLayout';
import { DashboardLayout } from './DashboardLayout';

export function AppLayout() {
  const appMode = useAppMode();
  const isMobile = useIsMobile();
  const { MOBILE_NAVIGATION } = useFeatureFlags();

  // Logique de sélection du layout
  if (appMode === 'sport' && (isMobile || MOBILE_NAVIGATION)) {
    return <SportMobileLayout />;
  }

  if (appMode === 'sport' && !isMobile) {
    // TODO: Créer SportDesktopLayout pour les écrans desktop en mode sport
    return <SportMobileLayout />; // Temporaire
  }

  // Mode cabinet (existant)
  return <DashboardLayout />;
}
