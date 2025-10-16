import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/query-client';
import App from './App.tsx';

// Gestion d'erreurs robuste
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Element #root non trouvé');
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );

  console.log('✅ Application React chargée avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement de React:', error);

  // Fallback en cas d'erreur
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; color: red; background: #ffe6e6; border: 2px solid red; border-radius: 5px;">
        <h1>❌ Erreur de chargement</h1>
        <p>Une erreur s'est produite lors du chargement de l'application.</p>
        <pre style="background: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto;">${error}</pre>
        <p><strong>Solution :</strong> Vérifiez la console du navigateur pour plus de détails.</p>
      </div>
    `;
  }
}
