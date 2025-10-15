import { useFeatureFlags, useAppMode } from '../../hooks/useFeatureFlags';

export function ModeDebugInfo() {
  const appMode = useAppMode();
  const { SPORT_MODE, CABINET_MODE, MOBILE_NAVIGATION, GAMIFICATION, GUEST_MODE } = useFeatureFlags();

  // Afficher seulement en mode développement
  if (import.meta.env.PROD || import.meta.env.MODE === 'production') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs p-2 rounded-lg font-mono z-50">
      <div className="font-bold mb-1">Mode Debug Info</div>
      <div>Mode App: <span className="text-yellow-400">{appMode}</span></div>
      <div>Sport: <span className={SPORT_MODE ? 'text-green-400' : 'text-red-400'}>{SPORT_MODE ? 'ON' : 'OFF'}</span></div>
      <div>Cabinet: <span className={CABINET_MODE ? 'text-green-400' : 'text-red-400'}>{CABINET_MODE ? 'ON' : 'OFF'}</span></div>
      <div>Mobile: <span className={MOBILE_NAVIGATION ? 'text-green-400' : 'text-red-400'}>{MOBILE_NAVIGATION ? 'ON' : 'OFF'}</span></div>
      <div>Gamification: <span className={GAMIFICATION ? 'text-green-400' : 'text-red-400'}>{GAMIFICATION ? 'ON' : 'OFF'}</span></div>
      <div>Guest: <span className={GUEST_MODE ? 'text-green-400' : 'text-red-400'}>{GUEST_MODE ? 'ON' : 'OFF'}</span></div>
      <div className="mt-1 text-gray-400">
        URL: {window.location.pathname}
      </div>
    </div>
  );
}
