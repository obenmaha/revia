import { Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';

// État d'authentification simplifié
function useSimpleAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string) => {
    console.log('🔐 Tentative de connexion avec:', email);
    setIsLoading(true);
    
    try {
      // Simulation d'une connexion
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Connexion réussie');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Déconnexion');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
}

// Page de connexion
function LoginPage() {
  const { login, isLoading } = useSimpleAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Soumission du formulaire:', { email, password });
    try {
      await login(email, password);
      console.log('✅ Login terminé');
    } catch (error) {
      console.error('❌ Erreur dans handleSubmit:', error);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '12px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ color: '#2563eb', marginBottom: '30px', textAlign: 'center' }}>🔐 Connexion</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px'
              }}
              placeholder="votre@email.com"
            />
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '16px'
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
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6b7280', fontSize: '14px' }}>
          Version de démonstration - Tous les emails/mots de passe fonctionnent
        </p>
      </div>
    </div>
  );
}

// Route protégée
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useSimpleAuth();

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Dashboard principal
function Dashboard() {
  const { logout } = useSimpleAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: '📊 Vue d\'ensemble', icon: '📊' },
    { id: 'patients', label: '👥 Patients', icon: '👥' },
    { id: 'sessions', label: '📅 Sessions', icon: '📅' },
    { id: 'invoices', label: '💰 Factures', icon: '💰' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return (
          <div>
            <h2 style={{ color: '#2563eb', marginBottom: '20px' }}>👥 Gestion des Patients</h2>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3>Ajouter un nouveau patient</h3>
              <p style={{ color: '#6b7280' }}>Fonctionnalité à venir - Formulaire d'ajout de patient</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>Liste des patients</h3>
              <p style={{ color: '#6b7280' }}>Aucun patient enregistré pour le moment</p>
            </div>
          </div>
        );
      case 'sessions':
        return (
          <div>
            <h2 style={{ color: '#7c3aed', marginBottom: '20px' }}>📅 Planification des Sessions</h2>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3>Nouvelle session</h3>
              <p style={{ color: '#6b7280' }}>Fonctionnalité à venir - Planificateur de sessions</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>Calendrier des sessions</h3>
              <p style={{ color: '#6b7280' }}>Aucune session programmée</p>
            </div>
          </div>
        );
      case 'invoices':
        return (
          <div>
            <h2 style={{ color: '#dc2626', marginBottom: '20px' }}>💰 Gestion des Factures</h2>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              marginBottom: '20px'
            }}>
              <h3>Nouvelle facture</h3>
              <p style={{ color: '#6b7280' }}>Fonctionnalité à venir - Générateur de factures</p>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>Factures en cours</h3>
              <p style={{ color: '#6b7280' }}>Aucune facture en attente</p>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <h2 style={{ color: '#059669', marginBottom: '20px' }}>📊 Vue d'ensemble</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>👥</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>0</div>
                <div style={{ color: '#6b7280' }}>Patients</div>
              </div>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📅</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#7c3aed' }}>0</div>
                <div style={{ color: '#6b7280' }}>Sessions cette semaine</div>
              </div>
              <div style={{ 
                padding: '20px', 
                backgroundColor: 'white', 
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>💰</div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>0€</div>
                <div style={{ color: '#6b7280' }}>Chiffre d'affaires</div>
              </div>
            </div>
            <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3>🚀 Bienvenue dans App-Kine !</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                Votre application de gestion de cabinet de kinésithérapie est maintenant fonctionnelle. 
                Utilisez les onglets ci-dessus pour naviguer entre les différentes sections.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ color: '#059669', margin: 0 }}>🏥 App-Kine</h1>
        <button
          onClick={logout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Déconnexion
        </button>
      </header>

      {/* Navigation */}
      <nav style={{ 
        backgroundColor: 'white', 
        padding: '0 20px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', gap: '0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                borderBottom: activeTab === tab.id ? '3px solid #1d4ed8' : '3px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Contenu principal */}
      <main style={{ padding: '40px' }}>
        {renderContent()}
      </main>
    </div>
  );
}

// Composant principal
function App() {
  return (
    <Routes>
      {/* Route de connexion */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Routes protégées */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      
      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;