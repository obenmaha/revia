# Architecture Technique - App-Kine

## Vue d'Ensemble

App-Kine est une application web moderne de gestion de cabinet de kinésithérapie, conçue avec une architecture monolithique modulaire évolutive, optimisée pour la performance, la sécurité et l'expérience utilisateur mobile-first.

## Principes Architecturaux

### 1. Architecture Monolithique Modulaire

- **Avantage** : Simplicité de développement et déploiement initial
- **Évolutivité** : Modules indépendants permettant migration vers microservices
- **Cohésion** : Logique métier centralisée et cohérente

### 2. Mobile-First Design

- **Interface responsive** : Optimisée pour smartphones et tablettes
- **Performance** : Chargement rapide sur connexions mobiles
- **UX native** : Gestures et interactions mobiles naturelles

### 3. Sécurité par Conception

- **RGPD** : Conformité dès la conception
- **Chiffrement** : Données sensibles protégées en transit et au repos
- **Authentification** : JWT avec refresh tokens sécurisés

## Stack Technologique

### Frontend

- **Framework** : React 19 avec TypeScript
- **Build Tool** : Vite (performance optimisée)
- **State Management** : Zustand (léger et performant)
- **Routing** : React Router v6
- **UI Components** : Radix UI + Tailwind CSS
- **Forms** : React Hook Form + Zod validation
- **Charts** : Recharts (légers et accessibles)
- **Calendar** : FullCalendar.js
- **File Upload** : React Dropzone

### Backend

- **Runtime** : Node.js 20 LTS
- **Framework** : Express.js avec TypeScript
- **ORM** : Prisma (type-safe, performant)
- **Validation** : Zod (cohérence frontend/backend)
- **Authentication** : JWT + bcrypt
- **File Storage** : AWS S3 ou Cloudinary
- **Email** : Resend ou SendGrid
- **PDF Generation** : Puppeteer

### Base de Données

- **Primary** : PostgreSQL 15+
- **Cache** : Redis (sessions, cache de requêtes)
- **Search** : PostgreSQL Full-Text Search (puissant et simple)
- **Backup** : Automatique quotidien + point-in-time recovery

### Infrastructure

- **Hosting** : Vercel (frontend) + Railway/Render (backend)
- **CDN** : CloudFlare (performance globale)
- **Monitoring** : Sentry (erreurs) + Vercel Analytics
- **Security** : CloudFlare WAF + DDoS protection
- **SSL** : Let's Encrypt (automatique)

## Architecture des Couches

### 1. Couche Présentation (Frontend)

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base
│   ├── forms/          # Composants de formulaires
│   └── features/       # Composants métier
├── pages/              # Pages de l'application
├── hooks/              # Hooks React personnalisés
├── stores/             # État global (Zustand)
├── services/           # Services API
├── utils/              # Utilitaires
└── types/              # Types TypeScript
```

### 2. Couche API (Backend)

```
src/
├── controllers/        # Contrôleurs des routes
├── services/           # Logique métier
├── repositories/       # Accès aux données
├── middleware/         # Middleware Express
├── routes/             # Définition des routes
├── models/             # Modèles Prisma
├── utils/              # Utilitaires
└── types/              # Types TypeScript
```

### 3. Couche Données

```
prisma/
├── schema.prisma       # Schéma de base de données
├── migrations/         # Migrations
└── seed.ts            # Données de test
```

## Modèle de Données

### Entités Principales

#### User (Utilisateur)

```typescript
interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'PRACTITIONER' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Patient

```typescript
interface Patient {
  id: string;
  practitionerId: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  phone: string;
  email?: string;
  address: Address;
  medicalInfo: MedicalInfo;
  emergencyContact: EmergencyContact;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Session (Séance)

```typescript
interface Session {
  id: string;
  patientId: string;
  practitionerId: string;
  scheduledAt: Date;
  duration: number;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes: string;
  objectives: Objective[];
  exercises: Exercise[];
  evaluation: Evaluation;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Invoice (Facture)

```typescript
interface Invoice {
  id: string;
  patientId: string;
  practitionerId: string;
  sessions: Session[];
  amount: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE';
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

## Architecture de Sécurité

### 1. Authentification et Autorisation

- **JWT Tokens** : Access token (15min) + Refresh token (7 jours)
- **Hachage** : bcrypt avec salt rounds = 12
- **Sessions** : Stockées en Redis avec expiration
- **RBAC** : Rôles et permissions granulaires

### 2. Protection des Données

- **Chiffrement** : AES-256 pour données sensibles
- **HTTPS** : Obligatoire (TLS 1.3)
- **Headers** : Security headers complets
- **CORS** : Configuration restrictive
- **Rate Limiting** : Protection contre les attaques

### 3. Conformité RGPD

- **Consentement** : Gestion explicite du consentement
- **Droit à l'oubli** : Suppression complète des données
- **Portabilité** : Export des données utilisateur
- **Audit** : Logs de toutes les actions sensibles
- **DPO** : Délégué à la protection des données

## Performance et Scalabilité

### 1. Optimisations Frontend

- **Code Splitting** : Lazy loading des routes
- **Bundle Optimization** : Tree shaking, minification
- **Caching** : Service Worker pour assets statiques
- **Images** : WebP, lazy loading, responsive images
- **CDN** : CloudFlare pour distribution globale

### 2. Optimisations Backend

- **Database Indexing** : Index optimisés pour requêtes fréquentes
- **Query Optimization** : Prisma avec requêtes optimisées
- **Caching** : Redis pour sessions et données fréquentes
- **Connection Pooling** : Pool de connexions PostgreSQL
- **Compression** : Gzip/Brotli pour les réponses API

### 3. Monitoring et Observabilité

- **Error Tracking** : Sentry pour erreurs frontend/backend
- **Performance** : Vercel Analytics + custom metrics
- **Uptime** : Monitoring 24/7 avec alertes
- **Logs** : Centralisés et structurés (JSON)

## Déploiement et DevOps

### 1. Environnements

- **Development** : Local avec Docker Compose
- **Staging** : Vercel Preview + Railway Staging
- **Production** : Vercel + Railway Production

### 2. CI/CD Pipeline

```yaml
# GitHub Actions
- Lint & Type Check
- Unit Tests (Vitest)
- Integration Tests
- Build & Deploy Staging
- E2E Tests (Playwright)
- Deploy Production
```

### 3. Infrastructure as Code

- **Terraform** : Infrastructure provisioning
- **Docker** : Containerisation des services
- **Environment Variables** : Gestion sécurisée des secrets

## Migration et Évolutivité

### 1. Migration vers Microservices

L'architecture modulaire permet une migration progressive :

- **Phase 1** : Extraction des modules indépendants
- **Phase 2** : API Gateway pour orchestration
- **Phase 3** : Services autonomes avec bases de données dédiées

### 2. Scaling Horizontal

- **Load Balancing** : Distribution des requêtes
- **Database Sharding** : Partitionnement par praticien
- **Caching** : Redis Cluster pour haute disponibilité
- **CDN** : Distribution mondiale des assets

## Sécurité et Conformité

### 1. Audit de Sécurité

- **Penetration Testing** : Tests de sécurité réguliers
- **Code Review** : Revue de code obligatoire
- **Dependency Scanning** : Scan des vulnérabilités
- **Security Headers** : OWASP compliance

### 2. Backup et Récupération

- **Backup Automatique** : Quotidien avec rétention 30 jours
- **Point-in-Time Recovery** : Récupération à tout moment
- **Disaster Recovery** : Plan de continuité d'activité
- **Testing** : Tests de restauration réguliers

## Métriques et KPIs Techniques

### 1. Performance

- **Core Web Vitals** : LCP < 2.5s, FID < 100ms, CLS < 0.1
- **API Response Time** : P95 < 500ms
- **Database Query Time** : P95 < 100ms
- **Uptime** : 99.9% SLA

### 2. Sécurité

- **Vulnerability Score** : 0 vulnérabilités critiques
- **Security Incidents** : 0 incidents majeurs
- **Compliance** : 100% RGPD compliant
- **Audit Score** : A+ sur securityheaders.com

## Roadmap Technique

### Phase 1 - MVP (Mois 1-3)

- Architecture de base avec React + Node.js
- Authentification et gestion des utilisateurs
- CRUD patients et séances
- Interface mobile optimisée

### Phase 2 - Fonctionnalités Avancées (Mois 4-6)

- Calendrier interactif
- Facturation automatique
- Rapports et analytics
- Optimisations de performance

### Phase 3 - Évolutivité (Mois 7-12)

- API publique
- Intégrations tierces
- Fonctionnalités collaboratives
- Migration vers microservices

---

**Architecte** : Winston (BMad-Method)  
**Date** : 2024-12-19  
**Version** : 1.0
