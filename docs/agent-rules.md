# 🤖 Règles pour les Agents BMad

## 🚨 RÈGLES CRITIQUES DE SÉCURITÉ

### ❌ INTERDICTIONS ABSOLUES

1. **JAMAIS supprimer `.env.local`**
   - Ce fichier contient les vraies clés de l'utilisateur
   - Il est déjà protégé par `.gitignore`
   - Seul l'utilisateur peut le modifier

2. **JAMAIS écrire de vraies clés dans des fichiers versionnés**
   - Utiliser uniquement des placeholders (`YOUR-PROJECT-ID`, `YOUR-ANON-KEY-HERE`)
   - Les vraies clés vont dans `.env.local` (ignoré par Git)

3. **JAMAIS exposer `SERVICE_ROLE_KEY` côté frontend**
   - Cette clé ne doit exister que dans Edge Functions/CI
   - Côté frontend, utiliser uniquement `VITE_SUPABASE_ANON_KEY`

### ✅ AUTORISATIONS

1. **Modifier les templates d'environnement**
   - `env.local.example`
   - `env.example`
   - `env.preview.example`
   - `env.rollback.example`

2. **Mettre à jour la documentation**
   - `docs/security/env.md`
   - `docs/agent-rules.md`
   - README files

3. **Configurer les garde-fous**
   - Hooks Git (Husky)
   - Workflows CI
   - Tests de sécurité

## 🔧 Actions Recommandées

### Si une vraie clé est détectée dans un fichier versionné :

1. **NE PAS inclure la vraie clé dans la PR**
2. **Remplacer par un placeholder sécurisé**
3. **Ajouter un commentaire d'avertissement**
4. **Documenter la procédure de configuration**

### Exemple de correction :
```diff
- VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
+ VITE_SUPABASE_ANON_KEY=YOUR-ANON-KEY-HERE
+ # ⚠️  Remplacez par votre vraie clé dans .env.local
```

## 📋 Checklist pour les Agents

### Avant de modifier des fichiers d'environnement :
- [ ] Vérifier que le fichier est un template (`.example`)
- [ ] S'assurer qu'aucune vraie clé n'est présente
- [ ] Utiliser des placeholders explicites
- [ ] Ajouter des commentaires d'avertissement

### Avant de créer une PR :
- [ ] Scanner les secrets : `npm run scan:secrets`
- [ ] Vérifier que les tests passent
- [ ] S'assurer que `.env.local` n'est pas modifié
- [ ] Documenter les changements de sécurité

## 🛡️ Tests de Sécurité

### Tests obligatoires :
```bash
# Scanner les secrets
npm run scan:secrets

# Tests de validation des variables d'environnement
npm run test src/test/env-security.test.ts

# Vérifier que le build fonctionne
npm run build
```

## 📚 Ressources

- [Documentation de sécurité](./security/env.md)
- [Configuration Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Security](https://supabase.com/docs/guides/auth/row-level-security)

## 🚨 En Cas de Doute

Si vous n'êtes pas sûr de la sécurité d'une action :
1. **ARRÊTER** l'action
2. **CONSULTER** cette documentation
3. **DEMANDER** clarification si nécessaire
4. **PRÉFÉRER** la sécurité à la fonctionnalité

---

**Rappel : La sécurité est la priorité absolue. Mieux vaut une fonctionnalité qui ne marche pas qu'une fuite de données.**
