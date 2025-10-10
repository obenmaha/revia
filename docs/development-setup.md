# Guide de Configuration du Développement - App-Kine

## Prérequis

### Outils Requis

- **Node.js** : Version 20+ (recommandé : 20.10+)
- **npm** : Version 10+ (inclus avec Node.js)
- **Git** : Version 2.30+
- **PostgreSQL** : Version 15+ (ou utiliser Supabase)
- **VS Code** : Éditeur recommandé avec extensions

### Extensions VS Code Recommandées

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json"
  ]
}
```

## Configuration Initiale

### 1. Cloner et Installer

```bash
# Cloner le projet (si pas déjà fait)
git clone <repository-url>
cd app-kine

# Installer les dépendances
npm install
```

### 2. Configuration de l'Environnement

Créer le fichier `.env.local` :

```env
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/app_kine_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# API
API_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Email (optionnel pour le développement)
SMTP_HOST="localhost"
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""

# Upload (optionnel pour le développement)
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE="10485760" # 10MB
```

### 3. Configuration de la Base de Données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Seeder la base de données
npx prisma db seed
```

### 4. Configuration des Tests

```bash
# Installer les dépendances de test
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest jsdom

# Lancer les tests
npm run test
```

## Scripts de Développement

### Scripts Disponibles

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  }
}
```

### Commandes de Développement

```bash
# Démarrer le serveur de développement
npm run dev

# Lancer les tests en mode watch
npm run test

# Vérifier les types TypeScript
npm run type-check

# Linter le code
npm run lint

# Formater le code
npm run format

# Ouvrir Prisma Studio
npm run db:studio
```

## Structure des Dossiers

```
app-kine/
├── public/                 # Assets statiques
├── src/
│   ├── components/         # Composants React
│   │   ├── ui/            # Composants UI de base
│   │   ├── forms/         # Composants de formulaires
│   │   ├── layout/        # Composants de mise en page
│   │   └── features/      # Composants par fonctionnalité
│   ├── pages/             # Pages de l'application
│   ├── hooks/             # Hooks personnalisés
│   ├── services/          # Services API
│   ├── stores/            # Stores Zustand
│   ├── types/             # Types TypeScript
│   ├── utils/             # Utilitaires
│   ├── constants/         # Constantes
│   └── styles/            # Styles globaux
├── prisma/                # Schéma et migrations Prisma
├── tests/                 # Tests
├── docs/                  # Documentation
└── .github/               # GitHub Actions
```

## Configuration des Outils

### ESLint Configuration

```javascript
// eslint.config.js
import { defineConfig } from 'eslint-define-config'

export default defineConfig({
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended'
  ],
  rules: {
    // Règles personnalisées
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
    'prefer-const': 'error'
  }
})
```

### Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## Workflow de Développement

### 1. Créer une Nouvelle Fonctionnalité

```bash
# Créer une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite

# Développer la fonctionnalité
# - Créer les composants
# - Ajouter les tests
# - Mettre à jour la documentation

# Commiter les changements
git add .
git commit -m "feat: ajouter la fonctionnalité X"

# Pousser la branche
git push origin feature/nom-de-la-fonctionnalite
```

### 2. Processus de Code Review

1. **Créer une Pull Request**
   - Description détaillée
   - Liens vers les issues
   - Screenshots si UI

2. **Review Checklist**
   - [ ] Code respecte les standards
   - [ ] Tests passent
   - [ ] Documentation mise à jour
   - [ ] Pas de breaking changes
   - [ ] Performance acceptable

3. **Merge**
   - Squash et merge
   - Supprimer la branche feature
   - Mettre à jour la documentation

### 3. Déploiement

```bash
# Déploiement automatique sur push vers main
# Vérifier les déploiements sur Vercel/Railway
```

## Debugging et Troubleshooting

### Problèmes Courants

1. **Erreurs de Base de Données**
   ```bash
   # Vérifier la connexion
   npx prisma db pull
   
   # Réinitialiser la base
   npx prisma migrate reset
   ```

2. **Erreurs TypeScript**
   ```bash
   # Vérifier les types
   npm run type-check
   
   # Nettoyer le cache
   rm -rf node_modules/.cache
   npm install
   ```

3. **Problèmes de Build**
   ```bash
   # Nettoyer et rebuilder
   rm -rf dist node_modules/.vite
   npm install
   npm run build
   ```

### Outils de Debug

1. **React DevTools** : Extension navigateur
2. **Prisma Studio** : `npm run db:studio`
3. **Network Tab** : DevTools navigateur
4. **Console Logs** : Logs structurés

## Ressources Utiles

### Documentation

- [React 19 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide)

### Outils en Ligne

- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Tailwind Play](https://play.tailwindcss.com)
- [Prisma Studio](https://www.prisma.io/studio)

---

**Version** : 1.0
**Date** : 2024-12-19
**Auteur** : Product Manager (John)
