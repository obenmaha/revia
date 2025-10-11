# Erreurs à Corriger - App-Kine

## 📋 Vue d'Ensemble

Ce document répertorie toutes les erreurs identifiées lors de la vérification QA du projet App-Kine. Les erreurs sont classées par priorité et incluent des instructions de correction détaillées.

**Statut Global** : ⚠️ CONCERNS - 214 erreurs TypeScript + 121 problèmes de linting

**Date de vérification** : 2024-12-19  
**Agent QA** : Quinn (Test Architect)

---

## 🚨 Erreurs Critiques (P0)

### 1. Erreurs TypeScript (214 erreurs)

#### 1.1 Services non instanciés correctement

**Fichiers concernés** :
- `src/hooks/useAuth.ts`
- `src/hooks/useInvoices.ts`
- `src/hooks/usePatients.ts`
- `src/hooks/useSessions.ts`
- `src/hooks/useStats.ts`

**Problème** : Les services sont utilisés comme des classes statiques au lieu d'être instanciés.

**Erreurs** :
```typescript
// ❌ Incorrect
queryFn: authService.getCurrentUser,
mutationFn: authService.signIn,

// ✅ Correct
queryFn: () => authService.getCurrentUser(),
mutationFn: (data) => authService.signIn(data),
```

**Solution** :
1. Modifier les services pour utiliser des méthodes d'instance
2. Instancier les services dans les hooks
3. Ou convertir les services en fonctions statiques

#### 1.2 Types Supabase manquants

**Fichiers concernés** :
- `src/services/authService.ts`
- `src/services/patientsService.ts`
- `src/services/sessionsService.ts`
- `src/services/invoicesService.ts`

**Problème** : Les types Supabase ne sont pas générés, causant des erreurs de type.

**Erreurs** :
```typescript
// ❌ Erreur de type
const { error: profileError } = await supabase.from('users').insert({
  id: string;
  email: string;
  first_name: string;
  // ...
});

// ✅ Solution
// Générer les types Supabase avec : npx supabase gen types typescript
```

**Solution** :
1. Exécuter `npx supabase gen types typescript --local > src/types/supabase.ts`
2. Importer les types générés dans les services
3. Utiliser les types appropriés pour chaque table

#### 1.3 Problèmes de types dans les hooks

**Fichiers concernés** :
- `src/hooks/useAuth.ts`
- `src/hooks/useInvoices.ts`
- `src/hooks/usePatients.ts`
- `src/hooks/useSessions.ts`

**Problèmes** :
- Types `unknown` non typés
- Paramètres de mutation incorrects
- Propriétés manquantes dans les types de réponse

**Solutions** :
```typescript
// ❌ Incorrect
setUser(data.user); // data est de type unknown

// ✅ Correct
setUser((data as { user: User }).user);

// ❌ Incorrect
mutationFn: authService.signIn,

// ✅ Correct
mutationFn: (credentials: LoginForm) => authService.signIn(credentials),
```

#### 1.4 Imports React manquants

**Fichiers concernés** :
- `src/hooks/useFocus.ts`
- `src/hooks/useFocusVisible.ts`
- `src/hooks/useFocusWithin.ts`
- `src/hooks/useHover.ts`

**Problème** : `useEffect` utilisé sans import.

**Solution** :
```typescript
// ❌ Incorrect
useEffect(() => {
  // ...
});

// ✅ Correct
import { useEffect } from 'react';

useEffect(() => {
  // ...
});
```

#### 1.5 Problèmes de types dans les pages

**Fichiers concernés** :
- `src/pages/DashboardPage.tsx`
- `src/pages/InvoicesPage.tsx`
- `src/pages/PatientsPage.tsx`
- `src/pages/SessionsPage.tsx`

**Problèmes** :
- Types `any` implicites
- Propriétés manquantes dans les types
- Imports non utilisés

**Solutions** :
```typescript
// ❌ Incorrect
{patients.map(patient => ( // patient est de type any

// ✅ Correct
{patients.map((patient: Patient) => (

// ❌ Incorrect
import { PageFilters, PageFilter } from '../components/ui/page-filters';

// ✅ Correct
import type { PageFilter } from '../components/ui/page-filters';
```

---

## ⚠️ Erreurs Élevées (P1)

### 2. Problèmes de Linting (121 problèmes)

#### 2.1 Variables non utilisées

**Fichiers concernés** : Tous les fichiers

**Problème** : Variables, imports et paramètres déclarés mais non utilisés.

**Solutions** :
```typescript
// ❌ Incorrect
import { useEffect } from 'react'; // non utilisé
const { data, error } = await supabase; // data non utilisé

// ✅ Correct
// Supprimer l'import non utilisé
const { error } = await supabase; // ou utiliser data
```

#### 2.2 Types `any` explicites

**Fichiers concernés** :
- `src/components/test/TestConnection.tsx`
- `src/components/ui/emoji-picker.tsx`
- `src/components/ui/page-filters.tsx`
- `src/components/ui/page-table.tsx`
- `src/pages/InvoicesPage.tsx`
- `src/pages/SessionsPage.tsx`
- `src/services/invoicesService.ts`
- `src/services/patientsService.ts`
- `src/services/sessionsService.ts`

**Solution** : Remplacer tous les `any` par des types appropriés.

```typescript
// ❌ Incorrect
const handleChange = (value: any) => {

// ✅ Correct
const handleChange = (value: string | number) => {
```

#### 2.3 Imports non utilisés

**Fichiers concernés** : Tous les fichiers

**Solution** : Supprimer tous les imports non utilisés.

```typescript
// ❌ Incorrect
import { Button, Card, CardContent } from '../components/ui/card';
// Seul Card est utilisé

// ✅ Correct
import { Card } from '../components/ui/card';
```

#### 2.4 Problèmes de formatage Prettier

**Fichiers concernés** : Tous les fichiers

**Solution** : Exécuter `npm run format` pour corriger automatiquement.

---

## 🔧 Erreurs Moyennes (P2)

### 3. Problèmes de Configuration

#### 3.1 Configuration Tailwind

**Fichier** : `tailwind.config.js`

**Problème** : Utilisation de `require` dans un fichier ES module.

**Solution** :
```javascript
// ❌ Incorrect
const { fontFamily } = require('tailwindcss/defaultTheme');

// ✅ Correct
import { fontFamily } from 'tailwindcss/defaultTheme';
```

#### 3.2 Scripts Node.js

**Fichier** : `scripts/init-supabase.js`

**Problème** : Fichier JavaScript dans un projet TypeScript.

**Solution** : Convertir en TypeScript ou ajouter des types globaux.

---

## 📋 Plan de Correction Détaillé

### Phase 1 - Stabilisation (Semaine 1)

#### Jour 1-2 : Correction des erreurs TypeScript
1. **Générer les types Supabase**
   ```bash
   npx supabase gen types typescript --local > src/types/supabase.ts
   ```

2. **Corriger les services**
   - Modifier les services pour utiliser des méthodes d'instance
   - Ajouter les types Supabase appropriés
   - Corriger les erreurs de type

3. **Corriger les hooks**
   - Ajouter les imports React manquants
   - Typer correctement les paramètres de mutation
   - Corriger les types de réponse

#### Jour 3-4 : Nettoyage du code
1. **Supprimer les imports non utilisés**
2. **Remplacer les types `any`**
3. **Corriger les variables non utilisées**
4. **Exécuter le formatage Prettier**

#### Jour 5 : Validation
1. **Vérifier la compilation** : `npm run build`
2. **Vérifier le linting** : `npm run lint`
3. **Exécuter les tests** : `npm run test:run`

### Phase 2 - Optimisation (Semaine 2)

#### Jour 1-2 : Amélioration des types
1. **Créer des interfaces TypeScript appropriées**
2. **Ajouter la validation Zod**
3. **Améliorer la gestion d'erreurs**

#### Jour 3-4 : Tests et qualité
1. **Ajouter des tests d'intégration**
2. **Améliorer la couverture de tests**
3. **Ajouter des tests E2E**

#### Jour 5 : Performance
1. **Optimiser les requêtes Supabase**
2. **Implémenter la mise en cache**
3. **Optimiser le bundle**

### Phase 3 - Production (Semaine 3)

#### Jour 1-2 : Finalisation
1. **Audit de sécurité final**
2. **Tests de charge**
3. **Optimisation des performances**

#### Jour 3-4 : Déploiement
1. **Configuration de production**
2. **Déploiement en staging**
3. **Tests de validation**

#### Jour 5 : Mise en production
1. **Déploiement en production**
2. **Monitoring post-déploiement**
3. **Documentation finale**

---

## 🎯 Métriques de Succès

### Objectifs de Correction

| Métrique | Actuel | Cible | Échéance |
|----------|--------|-------|----------|
| Erreurs TypeScript | 214 | 0 | Jour 5 |
| Problèmes Linting | 121 | <10 | Jour 5 |
| Build Success | ❌ | ✅ | Jour 5 |
| Couverture Tests | 9 tests | >80% | Semaine 2 |
| Performance | N/A | <2s | Semaine 3 |

### Critères de Validation

1. **Compilation** : `npm run build` réussit sans erreur
2. **Linting** : `npm run lint` retourne <10 problèmes
3. **Tests** : `npm run test:run` passe tous les tests
4. **Formatage** : `npm run format:check` passe sans erreur

---

## 📚 Ressources et Documentation

### Commandes Utiles

```bash
# Générer les types Supabase
npx supabase gen types typescript --local > src/types/supabase.ts

# Corriger le formatage
npm run format

# Vérifier le linting
npm run lint

# Exécuter les tests
npm run test:run

# Build de production
npm run build
```

### Liens Utiles

- [Documentation Supabase TypeScript](https://supabase.com/docs/guides/api/generating-types)
- [Documentation React Query](https://tanstack.com/query/latest)
- [Documentation TypeScript](https://www.typescriptlang.org/docs/)
- [Documentation ESLint](https://eslint.org/docs/latest/)

---

## 📝 Notes de Correction

### Erreurs Récurrentes

1. **Services non instanciés** : Problème le plus fréquent, nécessite une refactorisation des services
2. **Types Supabase** : Nécessite la génération des types depuis la base de données
3. **Imports non utilisés** : Peut être corrigé automatiquement avec ESLint --fix
4. **Types `any`** : Nécessite une analyse manuelle pour déterminer les types appropriés

### Bonnes Pratiques

1. **Toujours typer les paramètres de fonction**
2. **Utiliser des interfaces plutôt que des types `any`**
3. **Supprimer les imports non utilisés**
4. **Valider les données avec Zod**
5. **Tester les fonctions critiques**

---

**Dernière mise à jour** : 2024-12-19  
**Prochaine révision** : Après correction des erreurs P0

