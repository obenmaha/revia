# Configuration App-Kine - Guide de Démarrage

## 🚀 Configuration Rapide

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
cp env.local.example .env.local
```

Puis modifiez `.env.local` avec vos identifiants Supabase :

```env
# Configuration App-Kine
VITE_APP_NAME=App-Kine
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Supabase Configuration (OBLIGATOIRE)
VITE_SUPABASE_URL=https://ernzqcqoopqfqmrmcnug.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVybnpxY3Fvb3BxZnFtcm1jbnVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4OTk0NjgsImV4cCI6MjA3NTQ3NTQ2OH0.30Z0GwF5MHBCxu6YLV7xm7ZCzYDxQ0_kpyEKgNnsTMY
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Configuration
VITE_API_TIMEOUT=10000
```

### 2. Installation des dépendances

```bash
npm install
```

### 3. Initialisation de la base de données

**Option A : Via le script automatique (recommandé)**

```bash
# Ajoutez votre SERVICE_ROLE_KEY dans .env.local
npm run init:supabase
```

**Option B : Via l'interface Supabase**

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans "SQL Editor"
4. Copiez-collez le contenu de `supabase/migrations/001_initial_schema.sql`
5. Exécutez la requête

### 4. Démarrage du projet

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📋 Fonctionnalités Implémentées

### ✅ Epic 1 - Infrastructure et Authentification

- [x] Configuration Supabase avec types TypeScript
- [x] Service d'authentification (sign-up, sign-in, sign-out)
- [x] Pages de connexion et inscription avec validation
- [x] Navigation avec React Router v7
- [x] Layout responsive avec sidebar
- [x] Row Level Security (RLS) configuré

### ✅ Epic 2 - Gestion des Patients (Partiel)

- [x] Service CRUD pour les patients
- [x] Page de liste des patients avec recherche
- [x] Formulaire de création/édition de patient
- [x] Validation avec React Hook Form + Zod
- [x] Pagination et filtres

### 🔄 En cours

- [ ] Page de détails patient
- [ ] Upload de documents/photos
- [ ] Epic 3 - Calendrier et séances
- [ ] Epic 4 - Documentation des séances
- [ ] Epic 5 - Facturation
- [ ] Epic 6 - Analytics

## 🛠️ Stack Technique

- **Frontend**: React 19, TypeScript, Vite
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **State**: Zustand, TanStack Query
- **Forms**: React Hook Form, Zod
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router v7

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Preview build
npm run preview

# Linting
npm run lint

# Initialisation Supabase
npm run init:supabase
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants UI réutilisables
│   ├── ui/             # Composants shadcn/ui
│   ├── features/       # Composants métier
│   └── layouts/        # Layouts de pages
├── hooks/              # Hooks personnalisés
├── pages/              # Pages de l'application
├── services/           # Services API
├── stores/             # Stores Zustand
├── types/              # Types TypeScript
└── lib/                # Utilitaires et configuration
```

## 🚨 Problèmes Courants

### Erreur de connexion Supabase

- Vérifiez que `.env.local` existe et contient les bonnes clés
- Vérifiez que la migration a été appliquée
- Vérifiez que RLS est activé sur les tables

### Erreur de build

- Supprimez `node_modules` et `package-lock.json`
- Relancez `npm install`
- Vérifiez que toutes les dépendances sont installées

### Problème de types TypeScript

- Redémarrez le serveur de développement
- Vérifiez que `src/lib/supabase.ts` est correctement configuré

## 📞 Support

Pour toute question ou problème, consultez :

1. Les logs de la console navigateur
2. Les logs du terminal de développement
3. La documentation Supabase
4. Les issues GitHub du projet
