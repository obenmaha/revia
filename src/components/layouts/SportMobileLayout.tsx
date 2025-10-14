import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { MobileTabNavigation, type NavigationTab } from '../navigation/MobileTabNavigation';
import { useFeatureFlags, useIsMobile } from '../../hooks/useFeatureFlags';

// Configuration de la navigation sport
const sportNavigation: NavigationTab[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: '🏠',
    href: '/sport/dashboard',
  },
  {
    id: 'new-session',
    label: 'Nouvelle séance',
    icon: '➕',
    href: '/sport/session/new',
  },
  {
    id: 'history',
    label: 'Historique',
    icon: '📊',
    href: '/sport/history',
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: '👤',
    href: '/sport/profile',
  },
];

export function SportMobileLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { GAMIFICATION } = useFeatureFlags();

  // Déterminer l'onglet actif basé sur la route
  const getActiveTab = (): string => {
    const path = location.pathname;
    if (path.startsWith('/sport/dashboard')) return 'home';
    if (path.startsWith('/sport/session/new')) return 'new-session';
    if (path.startsWith('/sport/history')) return 'history';
    if (path.startsWith('/sport/profile')) return 'profile';
    return 'home';
  };

  const handleTabChange = (tabId: string) => {
    const tab = sportNavigation.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.href);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header mobile */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Revia Sport</h1>
          </div>

          {/* Badge de mode sport */}
          <div className="flex items-center space-x-2">
            {GAMIFICATION && (
              <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                🏆 Mode Sport
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding pour la navigation mobile */}
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>

      {/* Navigation mobile uniquement sur mobile */}
      {isMobile && (
        <MobileTabNavigation
          tabs={sportNavigation}
          activeTab={getActiveTab()}
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}
