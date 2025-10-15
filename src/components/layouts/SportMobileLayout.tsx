import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  MobileTabNavigation,
  type NavigationTab,
} from '../navigation/MobileTabNavigation';
import { useFeatureFlags, useIsMobile } from '../../hooks/useFeatureFlags';
import { useAuth } from '../../hooks/useAuth';
import { ReviaButton } from '../ui/revia-button';
import { LogOut } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  const { logout } = useAuth();
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
      {/* Header mobile selon design Revia */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-[var(--revia-gradient-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-lg font-montserrat">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--revia-text)] font-montserrat uppercase tracking-wide">
                Revia Sport
              </h1>
              <p className="text-xs text-[var(--revia-text)] opacity-70 font-inter">
                Move Smarter
              </p>
            </div>
          </div>

          {/* Badge de mode sport et déconnexion selon design Revia */}
          <div className="flex items-center space-x-2">
            {GAMIFICATION && (
              <div className="text-xs bg-[var(--revia-accent)] text-white px-3 py-1 rounded-full font-roboto font-medium uppercase tracking-wide">
                🏆 Mode Sport
              </div>
            )}
            <ReviaButton 
              variant="outline" 
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
            >
              <LogOut className="h-4 w-4" />
            </ReviaButton>
          </div>
        </div>
      </header>

      {/* Contenu principal avec padding pour la navigation mobile */}
      <main className="pb-20 min-h-screen">
        <Outlet />
      </main>

      {/* Navigation mobile - toujours visible mais adaptée */}
      <MobileTabNavigation
        tabs={sportNavigation}
        activeTab={getActiveTab()}
        onTabChange={handleTabChange}
        className={isMobile ? '' : 'hidden'}
      />
      
      {/* Navigation desktop alternative pour les écrans moyens */}
      {!isMobile && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-full shadow-lg border border-gray-200 px-4 py-2">
            <div className="flex space-x-2">
              {sportNavigation.map((tab) => {
                const isActive = getActiveTab() === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                      isActive 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:text-gray-900'
                    )}
                    aria-label={`${tab.label} - ${tab.href}`}
                    title={tab.label}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
