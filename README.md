# Revia - Application Sportive de Suivi d'Exercices

## 📋 Description

Revia est une application web moderne destinée aux **patients en rééducation** et aux **sportifs** pour suivre leurs sessions d'exercices, documenter leur progression, et optimiser leurs performances. L'application vise à motiver et engager les utilisateurs dans leur parcours de rééducation ou d'entraînement sportif.

## 🎯 Objectifs

- **Améliorer l'adhésion** aux programmes d'exercices (cible : 80% vs 40% actuellement)
- **Optimiser les performances** sportives grâce au suivi personnalisé
- **Offrir une expérience utilisateur** intuitive et mobile-first
- **Assurer la conformité RGPD** pour la gestion des données de santé

## 🚀 Fonctionnalités Principales

### 🏃‍♂️ Mode Sportif

- Suivi des sessions d'entraînement
- Enregistrement des exercices, séries et répétitions
- Métriques de performance (RPE, douleur, progression)
- Historique des performances et tendances

### 🏥 Mode Rééducation

- Suivi des exercices prescrits
- Enregistrement des séances de rééducation
- Suivi de la douleur et de la progression
- Partage avec le kinésithérapeute

### 📊 Analytics et Progression

- Graphiques de progression personnalisés
- Statistiques détaillées des performances
- Détection des tendances et patterns
- Alertes de surcharge ou de régression

### 👤 Mode Guest

- Essai sans inscription requise
- Fonctionnalités complètes en mode temporaire
- Conversion facile vers compte permanent
- Sauvegarde des données

## 🔐 Sécurité

### Variables d'Environnement
- **Configuration sécurisée** des variables d'environnement
- **Protection des secrets** avec garde-fous automatiques
- **Documentation complète** : [docs/security/env.md](docs/security/env.md)

### Règles pour les Agents
- **Règles strictes** pour éviter les fuites de données
- **Documentation** : [docs/agent-rules.md](docs/agent-rules.md)

## 🛠️ Stack Technologique

### Frontend

- **React 19** avec TypeScript
- **Vite** pour le build
- **Tailwind CSS** pour le styling
- **Zustand** pour la gestion d'état
- **React Hook Form + Zod** pour les formulaires

### Backend

- **Supabase** pour l'authentification et la base de données
- **PostgreSQL** avec Row Level Security (RLS)
- **JWT** pour l'authentification
- **Zod** pour la validation

### DevOps

- **Vercel** pour le déploiement frontend
- **Supabase** pour le backend et la base de données
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
cd revia

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env.local
# Éditer .env.local avec vos configurations

# Configurer Supabase
npm run init:supabase

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

L'application suit une architecture moderne avec séparation claire des couches :

- **Présentation** : React components et pages
- **Logique métier** : Services et hooks personnalisés
- **Données** : Supabase avec PostgreSQL et RLS
- **Authentification** : Supabase Auth avec JWT

## 🔒 Sécurité et Conformité

- **RGPD** : Conformité complète pour les données de santé
- **Chiffrement** : Chiffrement des données sensibles
- **Authentification** : Supabase Auth avec JWT
- **Sécurité** : Row Level Security (RLS) pour la protection des données

## 📊 Métriques de Succès

- **Performance** : Temps de chargement < 2 secondes
- **Disponibilité** : 99.9% uptime
- **Adhésion** : 80% des utilisateurs continuent leurs exercices
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

- 📧 Email : support@revia.app
- 📱 Documentation : [docs.revia.app](https://docs.revia.app)
- 🐛 Issues : [GitHub Issues](https://github.com/revia/app/issues)

---

**Développé avec ❤️ pour les sportifs et patients en rééducation**
