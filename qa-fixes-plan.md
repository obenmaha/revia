# Plan de Correction QA - MVP Sport NFR PASS

## Problèmes Critiques à Corriger (P0)

### 1. Bundle Size Optimization (708KB → <300KB)

#### Actions Immédiates
- [ ] **Code Splitting par Routes**
  - Implémenter lazy loading pour les pages
  - Séparer les composants lourds
  - Optimiser les imports dynamiques

- [ ] **Optimisation des Dépendances**
  - Audit des imports inutilisés
  - Tree shaking des librairies
  - Remplacement des dépendances lourdes

- [ ] **Optimisation des Assets**
  - Compression des images
  - Optimisation des icônes
  - Minification CSS/JS

#### Estimation : 2-3 jours

### 2. Correction des Tests Unitaires (107 échecs)

#### Problèmes Identifiés
- **Mocks manquants** : lucide-react, useNotifications
- **Timeouts** : Tests d'intégration (10s)
- **Validation errors** : guestStore data format
- **ResizeObserver** : Erreurs de polyfill

#### Actions Immédiates
- [ ] **Corriger les mocks**
  ```typescript
  // src/__mocks__/lucide-react.ts
  export const FileText = () => <div data-testid="file-text" />;
  // ... autres icônes
  ```

- [ ] **Créer useNotifications mock**
  ```typescript
  // src/__mocks__/useNotifications.ts
  export const useNotifications = () => ({
    isSupported: true,
    permission: 'granted',
    // ... autres propriétés
  });
  ```

- [ ] **Corriger les timeouts**
  - Augmenter timeout à 30s pour tests d'intégration
  - Optimiser les tests lents
  - Paralléliser les tests indépendants

- [ ] **Corriger guestStore validation**
  - Format des dates ISO
  - Types des statistiques
  - Validation des données

#### Estimation : 1-2 jours

### 3. Configuration Environnement

#### Actions Immédiates
- [ ] **Variables Supabase**
  ```bash
  # .env.local
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key-here
  VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
  ```

- [ ] **Configuration Playwright**
  ```typescript
  // playwright.config.ts
  export default defineConfig({
    testDir: './playwright',
    use: {
      baseURL: 'http://localhost:5173',
    },
  });
  ```

#### Estimation : 0.5 jour

## Problèmes Secondaires (P1)

### 4. Tests d'Accessibilité
- [ ] **Démarrage application** pour tests Playwright
- [ ] **Configuration ResizeObserver** polyfill
- [ ] **Tests de contraste** automatisés

### 5. Stabilité des Tests
- [ ] **Optimisation performance** tests
- [ ] **Isolation** des tests
- [ ] **Cleanup** automatique

## Plan d'Exécution

### Phase 1 : Bundle Size (J+1)
1. Audit des dépendances
2. Implémentation code splitting
3. Optimisation imports
4. Validation <300KB

### Phase 2 : Tests Unitaires (J+2)
1. Correction mocks
2. Fix validation errors
3. Optimisation timeouts
4. Validation 95%+ pass rate

### Phase 3 : Configuration (J+3)
1. Variables environnement
2. Configuration Playwright
3. Tests RLS/A11y
4. Validation complète

## Critères de Validation

### Bundle Size
- [ ] Bundle principal < 300KB
- [ ] Bundle UI < 10KB
- [ ] Total < 320KB

### Tests
- [ ] Tests unitaires > 95% pass rate
- [ ] Tests RLS PASS
- [ ] Tests A11y PASS
- [ ] Temps d'exécution < 5min

### Configuration
- [ ] Variables Supabase configurées
- [ ] Playwright fonctionnel
- [ ] Application démarrable

## Risques et Mitigation

### Risque : Bundle size difficile à réduire
- **Mitigation** : Audit détaillé, alternatives légères
- **Fallback** : Augmenter limite à 400KB temporairement

### Risque : Tests instables
- **Mitigation** : Isolation, mocks robustes
- **Fallback** : Tests manuels pour validation

### Risque : Configuration complexe
- **Mitigation** : Documentation, scripts d'aide
- **Fallback** : Configuration minimale

## Suivi et Monitoring

### Métriques Quotidiennes
- Bundle size (KB)
- Tests pass rate (%)
- Temps d'exécution (s)

### Rapports Hebdomadaires
- Progression corrections
- Nouveaux problèmes
- Recommandations

---
*Plan généré par Quinn - Test Architect & Quality Advisor*
