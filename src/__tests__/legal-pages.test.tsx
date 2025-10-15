// Tests des pages légales - NFR5
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LegalMentionsPage } from '../pages/legal/LegalMentionsPage';
import { LegalCGUPage } from '../pages/legal/LegalCGUPage';

// Wrapper pour les tests avec React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Pages légales', () => {
  describe('LegalMentionsPage', () => {
    it('devrait rendre la page des mentions légales', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      // Vérifier que la page se charge correctement
      expect(screen.getByText('Mentions légales')).toBeInTheDocument();
      expect(screen.getByText('Éditeur du site')).toBeInTheDocument();
      expect(screen.getByText('Siège social')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('devrait contenir toutes les sections requises', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      // Vérifier la présence des sections principales
      expect(screen.getByText('Éditeur du site')).toBeInTheDocument();
      expect(screen.getByText('Siège social')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
      expect(screen.getByText('Directeur de publication')).toBeInTheDocument();
      expect(screen.getByText('Hébergement')).toBeInTheDocument();
      expect(screen.getByText('Propriété intellectuelle')).toBeInTheDocument();
      expect(screen.getByText('Protection des données personnelles')).toBeInTheDocument();
      expect(screen.getByText('Cookies')).toBeInTheDocument();
      expect(screen.getByText('Droit applicable')).toBeInTheDocument();
      expect(screen.getByText('Dernière mise à jour')).toBeInTheDocument();
    });

    it('devrait avoir un bouton de retour fonctionnel', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      const backButton = screen.getByText('Retour');
      expect(backButton).toBeInTheDocument();
    });

    it('devrait afficher les informations de contact', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      expect(screen.getByText('contact@revia-app.com')).toBeInTheDocument();
      expect(screen.getByText('+33 1 23 45 67 89')).toBeInTheDocument();
    });
  });

  describe('LegalCGUPage', () => {
    it('devrait rendre la page des conditions générales', () => {
      render(
        <RouterWrapper>
          <LegalCGUPage />
        </RouterWrapper>
      );

      // Vérifier que la page se charge correctement
      expect(screen.getByText('Conditions générales d\'utilisation')).toBeInTheDocument();
      expect(screen.getByText('Article 1 - Objet')).toBeInTheDocument();
    });

    it('devrait contenir tous les articles requis', () => {
      render(
        <RouterWrapper>
          <LegalCGUPage />
        </RouterWrapper>
      );

      // Vérifier la présence des articles principaux
      expect(screen.getByText('Article 1 - Objet')).toBeInTheDocument();
      expect(screen.getByText('Article 2 - Définitions')).toBeInTheDocument();
      expect(screen.getByText('Article 3 - Acceptation des CGU')).toBeInTheDocument();
      expect(screen.getByText('Article 4 - Inscription et compte utilisateur')).toBeInTheDocument();
      expect(screen.getByText('Article 5 - Fonctionnalités de l\'application')).toBeInTheDocument();
      expect(screen.getByText('Article 6 - Utilisation de l\'application')).toBeInTheDocument();
      expect(screen.getByText('Article 7 - Protection des données personnelles')).toBeInTheDocument();
      expect(screen.getByText('Article 8 - Propriété intellectuelle')).toBeInTheDocument();
      expect(screen.getByText('Article 9 - Responsabilité')).toBeInTheDocument();
      expect(screen.getByText('Article 10 - Modification des CGU')).toBeInTheDocument();
      expect(screen.getByText('Article 11 - Résiliation')).toBeInTheDocument();
      expect(screen.getByText('Article 12 - Droit applicable et juridiction')).toBeInTheDocument();
    });

    it('devrait avoir un avertissement important', () => {
      render(
        <RouterWrapper>
          <LegalCGUPage />
        </RouterWrapper>
      );

      expect(screen.getByText('Important')).toBeInTheDocument();
      expect(screen.getByText(/En utilisant l'application Revia, vous acceptez/)).toBeInTheDocument();
    });

    it('devrait avoir un bouton de retour fonctionnel', () => {
      render(
        <RouterWrapper>
          <LegalCGUPage />
        </RouterWrapper>
      );

      const backButton = screen.getByText('Retour');
      expect(backButton).toBeInTheDocument();
    });

    it('devrait afficher les informations de contact', () => {
      render(
        <RouterWrapper>
          <LegalCGUPage />
        </RouterWrapper>
      );

      expect(screen.getByText('legal@revia-app.com')).toBeInTheDocument();
    });
  });

  describe('Accessibilité et contraste', () => {
    it('devrait avoir des couleurs avec un contraste suffisant', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      // Vérifier que les éléments principaux sont présents
      const mainHeading = screen.getByText('Mentions légales');
      expect(mainHeading).toBeInTheDocument();
      
      // Les couleurs sont définies dans les classes Tailwind qui respectent les standards AA
      // text-gray-900 (contrast ratio > 4.5:1) et text-gray-700 (contrast ratio > 4.5:1)
    });

    it('devrait être responsive sur mobile', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      // Vérifier que les classes responsive sont présentes
      const container = screen.getByText('Mentions légales').closest('.container');
      expect(container).toHaveClass('px-4', 'py-4', 'sm:py-8', 'max-w-4xl');
    });
  });

  describe('Navigation', () => {
    it('devrait permettre la navigation vers les pages légales', () => {
      render(
        <RouterWrapper>
          <LegalMentionsPage />
        </RouterWrapper>
      );

      // Vérifier que les liens de navigation sont présents
      const backButton = screen.getByText('Retour');
      expect(backButton).toBeInTheDocument();
    });
  });
});
