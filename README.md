# App-Kine - Application de Gestion de Cabinet de Kinésithérapie

## 📋 Description

App-Kine est une application web moderne destinée aux kinésithérapeutes pour gérer efficacement leurs patients, planifier leurs séances, et suivre les progrès thérapeutiques. L'application vise à digitaliser et optimiser la gestion quotidienne des cabinets de kinésithérapie.

## 🎯 Objectifs

- **Réduire de 50%** le temps administratif des kinésithérapeutes
- **Améliorer la qualité** du suivi patient grâce à une documentation structurée
- **Offrir une expérience utilisateur** intuitive et mobile-first
- **Assurer la conformité RGPD** pour la gestion des données médicales

## 🚀 Fonctionnalités Principales

### 👥 Gestion des Patients
- Fiche patient complète (informations personnelles, médicales)
- Historique des séances et traitements
- Photos et documents joints
- Recherche et filtrage avancés

### 📅 Planification des Séances
- Calendrier interactif
- Gestion des créneaux disponibles
- Rappels automatiques
- Gestion des annulations

### 📝 Suivi Thérapeutique
- Évaluation initiale et de suivi
- Objectifs de traitement
- Progression des exercices
- Notes de séance

### 💰 Facturation et Administration
- Génération de factures
- Suivi des paiements
- Statistiques de fréquentation
- Export des données

## 🛠️ Stack Technologique

### Frontend
- **React 19** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **React Hook Form + Zod** pour les formulaires

### Backend
- **Node.js** avec Express.js
- **PostgreSQL** avec Prisma ORM
- **JWT** pour l'authentification
- **Zod** pour la validation

### DevOps
- **Vercel** pour le déploiement frontend
- **Railway/Supabase** pour le backend
- **CloudFlare** pour le CDN
- **Sentry** pour le monitoring

## 📚 Documentation

- [Project Brief](./docs/project-brief.md) - Vision et objectifs du produit
- [PRD](./docs/prd.md) - Spécifications détaillées des fonctionnalités
- [Technical Guidance](./docs/technical-guidance.md) - Architecture et directives techniques
- [Development Setup](./docs/development-setup.md) - Guide de configuration du développement

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 15+ (ou Supabase)
- Git

### Installation

```bash
# Cloner le projet
git clone <repository-url>
cd app-kine

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Configurer la base de données
npx prisma generate
npx prisma migrate dev

# Démarrer le serveur de développement
npm run dev
```

### Scripts Disponibles

```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build de production
npm run test         # Lancer les tests
npm run lint         # Linter le code
npm run format       # Formater le code
npm run type-check   # Vérifier les types TypeScript
```

## 🏗️ Architecture

L'application suit une architecture monolithique modulaire avec séparation claire des couches :

- **Présentation** : React components et pages
- **Logique métier** : Services et hooks personnalisés
- **Données** : Prisma ORM avec PostgreSQL

## 🔒 Sécurité et Conformité

- **RGPD** : Conformité complète pour les données médicales
- **Chiffrement** : AES-256 pour les données au repos, TLS 1.3 en transit
- **Authentification** : JWT avec refresh tokens
- **Audit** : Trail complet des actions utilisateur

## 📊 Métriques de Succès

- **Performance** : Temps de chargement < 2 secondes
- **Disponibilité** : 99.9% uptime
- **Sécurité** : Zéro violation de données
- **Satisfaction** : NPS > 50

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commiter les changements (`git commit -m 'feat: ajouter nouvelle fonctionnalité'`)
4. Pousser vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou support :
- 📧 Email : support@app-kine.fr
- 📱 Documentation : [docs.app-kine.fr](https://docs.app-kine.fr)
- 🐛 Issues : [GitHub Issues](https://github.com/app-kine/issues)

---

**Développé avec ❤️ pour les kinésithérapeutes français**
