import {
  useFeatureFlags,
  useIsMobile,
  useAppMode,
} from '../../hooks/useFeatureFlags';
import { SportMobileLayout } from './SportMobileLayout';
import { SportDesktopLayout } from './SportDesktopLayout';
import { DashboardLayout } from './DashboardLayout';
import { ModeDebugInfo } from '../debug/ModeDebugInfo';

export function AppLayout() {
  const appMode = useAppMode();
  const isMobile = useIsMobile();
  const { MOBILE_NAVIGATION } = useFeatureFlags();

  // Logique de sélection du layout
  if (appMode === 'sport' && (isMobile || MOBILE_NAVIGATION)) {
    return (
      <>
        <SportMobileLayout />
        <ModeDebugInfo />
      </>
    );
  }

  if (appMode === 'sport' && !isMobile) {
    return (
      <>
        <SportDesktopLayout />
        <ModeDebugInfo />
      </>
    );
  }

  // Mode cabinet (existant)
  return (
    <>
      <DashboardLayout />
      <ModeDebugInfo />
    </>
  );
}
