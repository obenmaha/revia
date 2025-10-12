# 🔐 Sécurité des Variables d'Environnement

## 🚨 Règles Critiques

### ❌ INTERDICTIONS ABSOLUES
- **JAMAIS** de vraies clés dans des fichiers versionnés
- **JAMAIS** de `SERVICE_ROLE_KEY` côté frontend
- **JAMAIS** de committer `.env.local` ou `.env.*.local`
- **JAMAIS** de clés dans les tests ou la documentation

### ✅ AUTORISATIONS
- Placeholders sécurisés dans les templates (`.example`)
- Clés `ANON` uniquement côté frontend
- `SERVICE_ROLE_KEY` uniquement dans Edge Functions/CI

## 📁 Structure des Fichiers

```
.env.local.example     # Template sécurisé (versionné)
.env.local            # Vraies clés (ignoré par Git)
.env                  # Ignoré par Git
.env.*.local          # Ignoré par Git
```

## 🔧 Configuration Locale

### 1. Copier le template
```bash
cp env.local.example .env.local
```

### 2. Remplacer les placeholders
```bash
# Dans .env.local
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-vraie-clé-anon
```

### 3. Protéger le fichier (optionnel)
```bash
# Windows
attrib +R .env.local

# Unix/Linux/macOS
chmod 400 .env.local
```

## 🔄 Rotation des Clés

### Processus de rotation
1. Aller dans Supabase Dashboard > Settings > API
2. Cliquer sur "Reset" pour la clé concernée
3. Mettre à jour `.env.local` avec la nouvelle clé
4. Redémarrer l'application

### Clés à faire tourner régulièrement
- `VITE_SUPABASE_ANON_KEY` (tous les 3 mois)
- `SERVICE_ROLE_KEY` (tous les 6 mois)

## 🛡️ Où Stocker les Clés

### ✅ Frontend (Vite)
```bash
# .env.local (local uniquement)
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### ✅ Backend/CI
```bash
# Variables d'environnement serveur
SUPABASE_SERVICE_ROLE_KEY=sk_...
SUPABASE_URL=https://...
```

### ✅ Edge Functions
```typescript
// Dans vos Edge Functions
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)
```

## 🔍 Vérifications de Sécurité

### Tests automatiques
```bash
# Scanner les secrets
npm run scan:secrets

# Tests de sécurité
npm run test src/test/env-security.test.ts
```

### CI/CD Automatique
- **Scan sur chaque push** vers main/develop/staging
- **Scan sur chaque PR** vers main/develop/staging  
- **Scan quotidien** à 2h du matin
- **Validation des variables** d'environnement
- **Tests de build** avec vérifications de sécurité

### Vérifications manuelles
- [ ] Aucune vraie clé dans les fichiers versionnés
- [ ] `.env.local` dans `.gitignore`
- [ ] Templates avec placeholders uniquement
- [ ] Pas de `SERVICE_ROLE_KEY` côté frontend

## 🚨 En Cas de Fuite

### 1. Rotation immédiate
```bash
# Dans Supabase Dashboard
# Settings > API > Reset (pour toutes les clés)
```

### 2. Nettoyage du repo
```bash
# Supprimer l'historique (si nécessaire)
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env.local' \
  --prune-empty --tag-name-filter cat -- --all
```

### 3. Audit complet
```bash
# Scanner tout le repo
npm run scan:secrets
```

## 📋 Checklist Pré-Commit

- [ ] Aucune vraie clé dans les fichiers modifiés
- [ ] `.env.local` non modifié ou ignoré
- [ ] Tests de sécurité passent
- [ ] Build fonctionne sans erreurs

## 🔗 Liens Utiles

- [Documentation Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
