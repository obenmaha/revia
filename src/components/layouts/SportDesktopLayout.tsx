import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ReviaButton } from '../ui/revia-button';
import { ReviaCard, ReviaCardContent } from '../ui/revia-card';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, 
  Plus, 
  BarChart3, 
  User, 
  Calendar,
  Target,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';

// Configuration de la navigation desktop sport
const sportNavigation = [
  {
    id: 'home',
    label: 'Accueil',
    icon: Home,
    href: '/sport/dashboard',
    description: 'Tableau de bord principal'
  },
  {
    id: 'new-session',
    label: 'Nouvelle séance',
    icon: Plus,
    href: '/sport/session/new',
    description: 'Créer une nouvelle séance'
  },
  {
    id: 'history',
    label: 'Historique',
    icon: BarChart3,
    href: '/sport/history',
    description: 'Voir l\'historique des séances'
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: User,
    href: '/sport/profile',
    description: 'Gérer votre profil'
  },
];

export function SportDesktopLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
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

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header desktop selon design Revia */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-lg bg-[var(--revia-gradient-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-xl font-montserrat">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--revia-text)] font-montserrat uppercase tracking-wide">
                Revia Sport
              </h1>
              <p className="text-sm text-[var(--revia-text)] opacity-70 font-inter">
                Move Smarter - Votre coach personnel
              </p>
            </div>
          </div>

          {/* Badge de mode sport et actions rapides selon design Revia */}
          <div className="flex items-center space-x-4">
            {GAMIFICATION && (
              <div className="text-sm bg-[var(--revia-accent)] text-white px-4 py-2 rounded-full flex items-center space-x-2 font-roboto font-medium uppercase tracking-wide">
                <Target className="h-4 w-4" />
                <span>Mode Sport</span>
              </div>
            )}
            <ReviaButton variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Calendrier
            </ReviaButton>
            <ReviaButton variant="outline" size="sm">
              <TrendingUp className="h-4 w-4 mr-2" />
              Statistiques
            </ReviaButton>
            <ReviaButton 
              variant="outline" 
              size="sm"
              onClick={logout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </ReviaButton>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar navigation desktop */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-2">
            {sportNavigation.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    isActive 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:text-gray-900'
                  )}
                  aria-label={`${tab.label} - ${tab.description}`}
                  title={tab.description}
                >
                  <Icon className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {tab.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Section d'informations rapides selon design Revia */}
          <div className="p-4 border-t border-gray-200">
            <ReviaCard className="bg-[var(--revia-gradient-primary)] text-white">
              <ReviaCardContent className="text-center">
                <div className="text-2xl font-bold font-montserrat mb-1">7</div>
                <div className="text-sm font-inter opacity-90">Jours de streak</div>
                <div className="text-xs font-inter opacity-70 mt-1">Continuez comme ça !</div>
              </ReviaCardContent>
            </ReviaCard>
          </div>

          {/* Bouton de déconnexion dans la sidebar */}
          <div className="p-4 border-t border-gray-200">
            <ReviaButton 
              variant="outline" 
              size="sm"
              onClick={logout}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </ReviaButton>
          </div>
        </aside>

        {/* Contenu principal */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
