import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';
import { useAuth } from './hooks/useAuth';
import { useAuthStore } from './stores/authStore';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Lazy load layouts and heavy components
const AppLayout = lazy(() => import('./components/layouts/AppLayout').then(m => ({ default: m.AppLayout })));
const ModeToggle = lazy(() => import('./components/features/ModeToggle').then(m => ({ default: m.ModeToggle })));

// Lazy loading des pages pour optimiser le bundle size
const SportDashboardPage = lazy(() => import('./pages/sport/SportDashboardPage').then(m => ({ default: m.SportDashboardPage })));
const SportSessionCreatePage = lazy(() => import('./pages/sport/SportSessionCreatePage').then(m => ({ default: m.SportSessionCreatePage })));
const SportHistoryPage = lazy(() => import('./pages/sport/SportHistoryPage').then(m => ({ default: m.SportHistoryPage })));
const SportProfilePage = lazy(() => import('./pages/sport/SportProfilePage').then(m => ({ default: m.SportProfilePage })));
const GuestDashboardPage = lazy(() => import('./pages/guest/GuestDashboardPage').then(m => ({ default: m.GuestDashboardPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const LegalMentionsPage = lazy(() => import('./pages/legal/LegalMentionsPage').then(m => ({ default: m.LegalMentionsPage })));
const LegalCGUPage = lazy(() => import('./pages/legal/LegalCGUPage').then(m => ({ default: m.LegalCGUPage })));

// Composant de chargement
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    fontSize: '18px',
    color: '#6b7280'
  }}>
    Chargement...
  </div>
);

// Composant pour la redirection par défaut basée sur le mode configuré
function DefaultRedirect() {
  const sportMode = import.meta.env.VITE_SPORT_MODE === 'true' || import.meta.env.VITE_APP_MODE === 'sport';
  const cabinetMode = import.meta.env.VITE_CABINET_MODE === 'true' || import.meta.env.VITE_APP_MODE === 'cabinet';
  const guestMode = import.meta.env.VITE_GUEST_MODE === 'true' || import.meta.env.VITE_APP_MODE === 'guest';
  
  let defaultRoute = '/dashboard'; // Par défaut cabinet
  
  if (sportMode) {
    defaultRoute = '/sport/dashboard';
  } else if (cabinetMode) {
    defaultRoute = '/dashboard';
  } else if (guestMode) {
    defaultRoute = '/guest/dashboard';
  }
  
  console.log('🔄 Redirection par défaut vers:', defaultRoute);
  return <Navigate to={defaultRoute} replace />;
}

// Page de connexion
function LoginPage() {
  const { login, register, isLoading, isAuthenticated } = useAuth();
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Redirection automatique après authentification
  useEffect(() => {
    if (isAuthenticated) {
      // Déterminer le mode par défaut basé sur les variables d'environnement
      const sportMode = import.meta.env.VITE_SPORT_MODE === 'true' || import.meta.env.VITE_APP_MODE === 'sport';
      const cabinetMode = import.meta.env.VITE_CABINET_MODE === 'true' || import.meta.env.VITE_APP_MODE === 'cabinet';
      const guestMode = import.meta.env.VITE_GUEST_MODE === 'true' || import.meta.env.VITE_APP_MODE === 'guest';
      
      let defaultRoute = '/dashboard'; // Par défaut cabinet
      
      if (sportMode) {
        defaultRoute = '/sport/dashboard';
      } else if (cabinetMode) {
        defaultRoute = '/dashboard';
      } else if (guestMode) {
        defaultRoute = '/guest/dashboard';
      }
      
      console.log('✅ Utilisateur authentifié - Redirection vers:', defaultRoute);
      navigate(defaultRoute);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Soumission du formulaire:', { email, password });
    
    // Mode développement temporaire - contourne l'authentification
    if (email === 'dev@test.com' && password === 'dev123') {
      console.log('🔧 Mode développement - Connexion simulée');
      // Simuler une connexion réussie en mettant à jour l'état
      const mockUser = {
        id: 'dev-user-123',
        email: 'dev@test.com',
        firstName: 'Dev',
        lastName: 'User',
        role: 'PRACTITIONER' as const,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      console.log('✅ Connexion développement réussie - État mis à jour');
      return;
    }
    
    try {
      if (isRegistering) {
        await register({ 
          email, 
          password, 
          firstName: 'Test',
          lastName: 'User',
          role: 'PRACTITIONER'
        });
        console.log('✅ Inscription terminée');
      } else {
        await login({ email, password });
        console.log('✅ Login terminé');
      }
    } catch (error) {
      console.error('❌ Erreur dans handleSubmit:', error);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1
          style={{
            color: '#2563eb',
            marginBottom: '30px',
            textAlign: 'center',
          }}
        >
          {isRegistering ? '📝 Inscription' : '🔐 Connexion'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              placeholder="votre@email.com"
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: 'bold',
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#9ca3af' : '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
            }}
          >
            {isLoading ? 'Traitement...' : (isRegistering ? 'S\'inscrire' : 'Se connecter')}
          </button>
          
          <button
            type="button"
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: 'transparent',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {isRegistering ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '20px',
            color: '#6b7280',
            fontSize: '14px',
          }}
        >
          Version de démonstration - Tous les emails/mots de passe fonctionnent
        </p>
        
        <div
          style={{
            textAlign: 'center',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#0369a1',
          }}
        >
          <strong>🔧 Mode Dev :</strong> Utilisez <code>dev@test.com</code> / <code>dev123</code> pour tester sans Supabase
        </div>

        {/* Sélecteur de mode */}
        <div style={{ marginTop: '30px' }}>
          <Suspense fallback={<div>...</div>}>
            <ModeToggle />
          </Suspense>
        </div>
      </div>
    </div>
  );
}


// Dashboard principal
function Dashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: "📊 Vue d'ensemble", icon: '📊' },
    { id: 'patients', label: '👥 Patients', icon: '👥' },
    { id: 'sessions', label: '📅 Sessions', icon: '📅' },
    { id: 'invoices', label: '💰 Factures', icon: '💰' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return (
          <div>
            <h2 style={{ color: '#2563eb', marginBottom: '20px' }}>
              👥 Gestion des Patients
            </h2>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px',
              }}
            >
              <h3>Ajouter un nouveau patient</h3>
              <p style={{ color: '#6b7280' }}>
                Fonctionnalité à venir - Formulaire d'ajout de patient
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3>Liste des patients</h3>
              <p style={{ color: '#6b7280' }}>
                Aucun patient enregistré pour le moment
              </p>
            </div>
          </div>
        );
      case 'sessions':
        return (
          <div>
            <h2 style={{ color: '#7c3aed', marginBottom: '20px' }}>
              📅 Planification des Sessions
            </h2>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px',
              }}
            >
              <h3>Nouvelle session</h3>
              <p style={{ color: '#6b7280' }}>
                Fonctionnalité à venir - Planificateur de sessions
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3>Calendrier des sessions</h3>
              <p style={{ color: '#6b7280' }}>Aucune session programmée</p>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div>
            <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>
              💰 Gestion des Factures
            </h2>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '20px',
              }}
            >
              <h3>Nouvelle facture</h3>
              <p style={{ color: '#6b7280' }}>
                Fonctionnalité à venir - Générateur de factures
              </p>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3>Factures en cours</h3>
              <p style={{ color: '#6b7280' }}>Aucune facture en attente</p>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2 style={{ color: '#059669', marginBottom: '20px' }}>
              📊 Vue d'ensemble
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px',
              }}
            >
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#2563eb',
                  }}
                >
                  0
                </div>
                <div style={{ color: '#6b7280' }}>Patients</div>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#7c3aed',
                  }}
                >
                  0
                </div>
                <div style={{ color: '#6b7280' }}>Sessions cette semaine</div>
              </div>
              <div
                style={{
                  padding: '20px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#dc2626',
                  }}
                >
                  0€
                </div>
                <div style={{ color: '#6b7280' }}>Chiffre d'affaires</div>
              </div>
            </div>
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <h3>🚀 Bienvenue dans App-Kine !</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Votre application de gestion de cabinet de kinésithérapie est
                maintenant fonctionnelle. Utilisez les onglets ci-dessus pour
                naviguer entre les différentes sections.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          backgroundColor: 'white',
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1 style={{ color: '#059669', margin: 0 }}>🏥 App-Kine</h1>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Déconnexion
        </button>
      </header>

      {/* Navigation */}
      <nav
        style={{
          backgroundColor: 'white',
          padding: '0 20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                backgroundColor:
                  activeTab === tab.id ? '#2563eb' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom:
                  activeTab === tab.id
                    ? '3px solid #1d4ed8'
                    : '3px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main style={{ padding: '40px' }}>{renderContent()}</main>
    </div>
  );
}

// Composant principal
function App() {
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<LoginPage />} />

      {/* Routes protégées - Mode Cabinet (existant) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Routes protégées - Mode Sport */}
      <Route
        path="/sport/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SportDashboardPage />
          </Suspense>
        } />
        <Route path="session/new" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SportSessionCreatePage />
          </Suspense>
        } />
        <Route path="history" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SportHistoryPage />
          </Suspense>
        } />
        <Route path="profile" element={
          <Suspense fallback={<LoadingSpinner />}>
            <SportProfilePage />
          </Suspense>
        } />
        <Route path="" element={<Navigate to="/sport/dashboard" replace />} />
      </Route>

      {/* Routes protégées - Mode Guest */}
      <Route
        path="/guest/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={
          <Suspense fallback={<LoadingSpinner />}>
            <GuestDashboardPage />
          </Suspense>
        } />
        <Route path="" element={<Navigate to="/guest/dashboard" replace />} />
      </Route>

      {/* Routes légales - Accessibles sans authentification */}
      <Route path="/legal/mentions" element={
        <Suspense fallback={<LoadingSpinner />}>
          <LegalMentionsPage />
        </Suspense>
      } />
      <Route path="/legal/cgu" element={
        <Suspense fallback={<LoadingSpinner />}>
          <LegalCGUPage />
        </Suspense>
      } />

      {/* Redirection par défaut - basée sur le mode configuré */}
      <Route path="/" element={<DefaultRedirect />} />
      <Route path="*" element={<DefaultRedirect />} />
    </Routes>
  );
}

export default App;
