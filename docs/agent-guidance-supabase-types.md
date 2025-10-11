# 🚨 GUIDE AGENT - Types Supabase (À LIRE OBLIGATOIREMENT)

## ⚠️ ERREUR COMMUNE À ÉVITER

**NE JAMAIS** exécuter cette commande qui prend du temps :

```bash
# ❌ NE PAS FAIRE - Prend 5+ minutes et échoue souvent
npx supabase gen types typescript --local > src/types/supabase.ts
```

## ✅ SOLUTION CORRECTE (30 secondes)

### Problème Identifié

- Le projet utilise **Supabase API** (cloud), pas Supabase local
- Les types existent déjà dans `src/lib/supabase.ts`
- Le code importe depuis `src/types/supabase.ts` qui n'existe pas

### Solution Immédiate

```bash
# 1. Copier les types existants (IMMÉDIAT)
cp src/lib/supabase.ts src/types/supabase.ts

# 2. Vérifier que ça marche
npm run build
```

## 📋 CHECKLIST OBLIGATOIRE

Avant de corriger les types Supabase, **TOUJOURS** :

1. ✅ Vérifier si `src/lib/supabase.ts` existe
2. ✅ Vérifier si `src/types/supabase.ts` existe
3. ✅ Si `src/lib/supabase.ts` existe ET `src/types/supabase.ts` n'existe pas → **COPIER**
4. ✅ Si les deux existent → Comparer et utiliser le plus récent
5. ✅ **JAMAIS** utiliser `--local` avec Supabase API

## 🔍 DIAGNOSTIC RAPIDE

### Si vous voyez ces erreurs :

```typescript
// Erreur : Cannot find module './supabase'
import type { Patient as SupabasePatient } from './supabase';
```

### Solution :

```bash
# Vérifier l'existence des fichiers
ls src/lib/supabase.ts
ls src/types/supabase.ts

# Si src/lib/supabase.ts existe et src/types/supabase.ts n'existe pas
cp src/lib/supabase.ts src/types/supabase.ts
```

## 🎯 ARCHITECTURE DU PROJET

### Structure des Types

```
src/
├── lib/
│   └── supabase.ts          # ← Types Supabase originaux (SOURCE)
├── types/
│   ├── supabase.ts          # ← Copie des types (DESTINATION)
│   ├── index.ts             # ← Types personnalisés de l'app
│   └── mapping.ts           # ← Mapping entre Supabase et types app
```

### Flux de Données

```
Supabase API → src/lib/supabase.ts → src/types/supabase.ts → mapping.ts → services
```

## 🚨 ERREURS À ÉVITER

1. **❌ Génération automatique** : `npx supabase gen types` (trop lent)
2. **❌ Types manquants** : Ne pas vérifier l'existence des fichiers
3. **❌ Incompatibilité** : Mélanger `--local` avec API cloud
4. **❌ Duplication** : Créer des types au lieu de copier

## ✅ BONNES PRATIQUES

1. **✅ Toujours copier** : `cp src/lib/supabase.ts src/types/supabase.ts`
2. **✅ Vérifier d'abord** : `ls src/lib/supabase.ts src/types/supabase.ts`
3. **✅ Tester immédiatement** : `npm run build`
4. **✅ Documenter** : Mettre à jour ce guide si nouvelle erreur

## 🔧 COMMANDES DE RÉFÉRENCE

```bash
# Vérification rapide
ls src/lib/supabase.ts src/types/supabase.ts

# Solution standard
cp src/lib/supabase.ts src/types/supabase.ts

# Test de compilation
npm run build

# Si erreur persistante
npm run lint
```

## 📞 ESCALADE

Si le problème persiste après avoir suivi ce guide :

1. Vérifier la configuration Supabase dans `src/config/env.ts`
2. Vérifier les variables d'environnement
3. Contacter l'équipe de développement

---

**Créé le** : 2024-12-19  
**Dernière mise à jour** : 2024-12-19  
**Statut** : ACTIF - À suivre obligatoirement  
**Agent responsable** : Assistant IA
