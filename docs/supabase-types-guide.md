# Guide de Génération des Types Supabase

## 📚 Vue d'ensemble

Ce guide explique comment générer et maintenir les types TypeScript pour votre base de données Supabase.

---

## 🚀 Génération Rapide

### Commande Simple

```bash
npm run types:generate
```

Cette commande va :
1. ✅ Tenter de générer les types depuis votre projet Supabase distant
2. ✅ En cas d'échec, créer des types de base à partir de vos migrations locales
3. ✅ Créer le fichier `src/types/supabase-generated.ts`

---

## 📋 Prérequis

### Pour la Génération Complète

Pour générer les types depuis votre projet Supabase distant :

```bash
# 1. Installer Supabase CLI globalement
npm install -g supabase

# 2. Se connecter à Supabase
supabase login

# 3. Générer les types
npm run types:generate
```

### Variables d'Environnement Requises

Assurez-vous que `.env.local` contient :

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🔧 Méthodes de Génération

Le script `generate-supabase-types.js` essaie 3 méthodes dans l'ordre :

### Méthode 1: Projet Distant (Recommandée)

```bash
# Nécessite: Supabase CLI + authentification
npx supabase gen types typescript --project-id YOUR_PROJECT_ID
```

**Avantages:**
- ✅ Types toujours à jour avec votre base de données
- ✅ Inclut toutes les fonctions, vues et énumérations
- ✅ Reflète l'état actuel de production

### Méthode 2: Migrations Locales

```bash
# Nécessite: Docker Desktop + Supabase CLI
npx supabase gen types typescript --local
```

**Avantages:**
- ✅ Fonctionne hors ligne
- ✅ Basé sur vos migrations SQL

**Inconvénients:**
- ⚠️ Nécessite Docker Desktop
- ⚠️ Peut différer de la production

### Méthode 3: Types de Base (Fallback)

Le script crée automatiquement des types de base si les méthodes 1 et 2 échouent.

**Avantages:**
- ✅ Toujours fonctionnel
- ✅ Pas de dépendances externes

**Inconvénients:**
- ⚠️ Peut ne pas refléter toutes les colonnes/tables
- ⚠️ Nécessite une mise à jour manuelle

---

## 📁 Fichiers Générés

### `src/types/supabase-generated.ts`

Ce fichier contient :

```typescript
// Type principal de la base de données
export interface Database {
  public: {
    Tables: { ... }
    Views: { ... }
    Functions: { ... }
    Enums: { ... }
  }
}

// Types de convenance
export type Tables<T> = Database['public']['Tables'][T]['Row'];
export type Inserts<T> = Database['public']['Tables'][T]['Insert'];
export type Updates<T> = Database['public']['Tables'][T]['Update'];
```

---

## 🎯 Utilisation dans le Code

### 1. Client Supabase Typé

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase-generated';

export const supabase = createClient<Database>(url, key);
```

### 2. Utiliser les Types dans les Services

```typescript
import type { Database, Tables, Inserts, Updates } from '../types/supabase-generated';

// Type pour une ligne de table
type Patient = Tables<'patients'>;

// Type pour l'insertion
type NewPatient = Inserts<'patients'>;

// Type pour la mise à jour
type PatientUpdate = Updates<'patients'>;

// Utilisation
const { data } = await supabase
  .from('patients')
  .select('*')
  .returns<Patient[]>();
```

---

## 🔄 Quand Régénérer les Types ?

Régénérez les types après chaque modification du schéma :

- ✅ Ajout/suppression de tables
- ✅ Ajout/suppression de colonnes
- ✅ Modification de types de colonnes
- ✅ Ajout de fonctions ou vues
- ✅ Modification des énumérations

```bash
# Après une migration
npm run types:generate
```

---

## 🐛 Dépannage

### Erreur: "Access token not provided"

```bash
# Solution: Se connecter à Supabase
supabase login
```

### Erreur: "Docker Desktop is a prerequisite"

**Option 1:** Utiliser la méthode distante (recommandée)
```bash
supabase login
npm run types:generate
```

**Option 2:** Installer Docker Desktop
```bash
# Télécharger depuis: https://docs.docker.com/desktop
```

### Erreur: "Command not found: supabase"

```bash
# Installer Supabase CLI
npm install -g supabase
```

### Les types ne correspondent pas à ma base de données

```bash
# 1. Vérifier que vous êtes sur le bon projet
cat .env.local | grep SUPABASE_URL

# 2. Régénérer les types
npm run types:generate

# 3. Redémarrer le serveur de développement
npm run dev
```

---

## 📝 Bonnes Pratiques

### 1. Versionner les Types Générés

```bash
# Ajouter au git
git add src/types/supabase-generated.ts
git commit -m "chore: update Supabase types"
```

### 2. CI/CD Integration

Ajoutez la génération des types à votre pipeline CI :

```yaml
# .github/workflows/ci.yml
- name: Generate Supabase Types
  run: npm run types:generate
  env:
    SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

### 3. Pre-commit Hook

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm run types:generate && git add src/types/supabase-generated.ts"
    }
  }
}
```

---

## 🔗 Ressources

- [Documentation Supabase CLI](https://supabase.com/docs/guides/cli)
- [TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)
- [Database Types](https://supabase.com/docs/guides/database/database-types)

---

## ✅ Checklist de Mise en Place

- [ ] Installer Supabase CLI: `npm install -g supabase`
- [ ] Se connecter: `supabase login`
- [ ] Configurer `.env.local` avec VITE_SUPABASE_URL
- [ ] Générer les types: `npm run types:generate`
- [ ] Vérifier le fichier généré: `src/types/supabase-generated.ts`
- [ ] Tester la compilation: `npm run build`
- [ ] Commiter les types: `git add src/types/supabase-generated.ts`

---

**Note:** Le fichier `src/types/supabase-generated.ts` est actuellement généré avec des types de base. Pour une génération complète avec tous les détails de votre schéma, suivez les étapes de la section "Génération Complète" ci-dessus.
