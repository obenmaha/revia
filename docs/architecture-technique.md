# Architecture Technique - App-Kine

## Vue d'Ensemble

App-Kine est une application web moderne de gestion de cabinet de kinésithérapie, conçue avec une **architecture serverless "Full Supabase + Edge Functions"**, optimisée pour la performance, la sécurité RGPD et l'expérience utilisateur mobile-first.

## Principes Architecturaux

### 1. Architecture Serverless Modulaire

- **Avantage** : Simplicité de développement et déploiement, coût optimisé
- **Évolutivité** : Edge Functions modulaires permettant scaling automatique
- **Cohésion** : Logique métier centralisée via Supabase + Edge Functions

### 2. Mobile-First Design

- **Interface responsive** : Optimisée pour smartphones et tablettes
- **Performance** : Chargement rapide sur connexions mobiles
- **UX native** : Gestures et interactions mobiles naturelles
- **PWA Ready** : Support offline et installation native

### 3. Sécurité par Conception (RGPD-Native)

- **RGPD** : Conformité native via Row Level Security (RLS)
- **Chiffrement** : Données sensibles protégées en transit et au repos
- **Authentification** : Supabase Auth avec RLS automatique
- **Isolation** : Séparation stricte des données par praticien

## Stack Technologique

### Frontend

- **Framework** : React 19 avec TypeScript
- **Build Tool** : Vite (performance optimisée)
- **State Management** : TanStack Query v5 (server state) + Zustand (client state)
- **Routing** : React Router v6
- **UI Components** : Radix UI + Tailwind CSS
- **Forms** : React Hook Form + Zod validation
- **Charts** : Recharts (légers et accessibles)
- **Calendar** : FullCalendar.js
- **File Upload** : React Dropzone
- **Monitoring** : Sentry (erreurs frontend)

### Backend (Serverless)

- **Platform** : Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Runtime** : Deno (Edge Functions)
- **Language** : TypeScript
- **Authentication** : Supabase Auth (JWT natif)
- **Authorization** : Row Level Security (RLS)
- **File Storage** : Supabase Storage (avec RLS)
- **Email** : Edge Functions + Resend/SendGrid
- **PDF Generation** : Edge Functions + Puppeteer
- **Cache** : Upstash Redis (optionnel, facturation à l'usage)

### Base de Données

- **Primary** : PostgreSQL 15+ (via Supabase)
- **Security** : Row Level Security (RLS) natif
- **Search** : PostgreSQL Full-Text Search + Supabase API
- **Backup** : Automatique Supabase + point-in-time recovery
- **Realtime** : Supabase Realtime (WebSockets)

### Infrastructure

- **Frontend Hosting** : Vercel (Edge Network)
- **Backend Platform** : Supabase (Global Edge)
- **CDN** : CloudFlare (performance globale)
- **Monitoring** : Sentry (frontend + Edge Functions)
- **Security** : CloudFlare WAF + DDoS protection + RLS
- **SSL** : Automatique (Vercel + Supabase)

## Architecture des Couches

### 1. Couche Présentation (Frontend)

```
src/
├── components/          # Composants réutilisables
│   ├── ui/             # Composants UI de base (Radix UI)
│   ├── forms/          # Composants de formulaires
│   ├── layouts/        # Layouts de pages
│   └── features/       # Composants métier
├── pages/              # Pages de l'application
├── hooks/              # Hooks React personnalisés
├── stores/             # État client (Zustand)
├── services/           # Services Supabase
├── utils/              # Utilitaires
└── types/              # Types TypeScript
```

### 2. Couche API (Edge Functions)

```
supabase/functions/
├── generate-invoice/   # Génération de factures
├── send-email/         # Envoi d'emails
├── daily-report/       # Rapports quotidiens
├── upload-document/    # Upload de documents
└── business-logic/     # Logique métier complexe
```

### 3. Couche Données (Supabase)

```
supabase/
├── migrations/         # Migrations SQL
├── seed.sql           # Données de test
└── policies/          # Politiques RLS
    ├── patients.sql
    ├── sessions.sql
    ├── invoices.sql
    └── documents.sql
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

- **Supabase Auth** : JWT natif avec refresh automatique
- **Row Level Security (RLS)** : Isolation automatique par praticien
- **Sessions** : Gérées automatiquement par Supabase
- **RBAC** : Rôles intégrés (PRACTITIONER, ADMIN)

### 2. Protection des Données

- **Chiffrement** : Automatique (TLS 1.3 + chiffrement au repos)
- **HTTPS** : Obligatoire (Vercel + Supabase)
- **Headers** : Security headers automatiques
- **CORS** : Configuration restrictive Supabase
- **Rate Limiting** : Intégré Supabase + CloudFlare

### 3. Conformité RGPD (Native)

- **RLS Stricte** : Isolation automatique des données par praticien
- **Audit Logs** : Logs d'accès automatiques Supabase
- **Droit à l'oubli** : Suppression en cascade via RLS
- **Portabilité** : Export via Supabase API
- **Consentement** : Gestion via Supabase Auth
- **Chiffrement** : Données sensibles chiffrées automatiquement

## Performance et Scalabilité

### 1. Optimisations Frontend

- **Code Splitting** : Lazy loading des routes (Vite)
- **Bundle Optimization** : Tree shaking, minification automatique
- **Caching** : TanStack Query + Service Worker
- **Images** : WebP, lazy loading, responsive images
- **CDN** : CloudFlare + Vercel Edge Network

### 2. Optimisations Backend (Serverless)

- **Edge Functions** : Exécution proche des utilisateurs
- **Database Indexing** : Index optimisés + RLS
- **Query Optimization** : Supabase API optimisée
- **Caching** : Upstash Redis (optionnel, facturation à l'usage)
- **Connection Pooling** : Automatique Supabase
- **Compression** : Automatique (Vercel + Supabase)

### 3. Monitoring et Observabilité

- **Error Tracking** : Sentry (frontend + Edge Functions)
- **Performance** : Vercel Analytics + Supabase Metrics
- **Uptime** : Monitoring 24/7 automatique
- **Logs** : Centralisés Supabase + Sentry

## Déploiement et DevOps

### 1. Environnements

- **Development** : Local avec Supabase CLI
- **Staging** : Vercel Preview + Supabase Staging
- **Production** : Vercel + Supabase Production

### 2. CI/CD Pipeline

```yaml
# GitHub Actions
- Lint & Type Check
- Unit Tests (Vitest)
- Integration Tests (RLS)
- Build & Deploy Staging
- E2E Tests (Playwright)
- Deploy Production (Vercel + Supabase)
```

### 3. Infrastructure as Code

- **Supabase CLI** : Migrations et Edge Functions
- **Vercel CLI** : Déploiement frontend
- **Environment Variables** : Gestion sécurisée Vercel + Supabase

## Migration et Évolutivité

### 1. Scaling Serverless

L'architecture Edge Functions permet un scaling automatique :

- **Phase 1** : Edge Functions modulaires (actuel)
- **Phase 2** : Edge Functions spécialisées par domaine
- **Phase 3** : Microservices Edge Functions autonomes

### 2. Scaling Horizontal (Automatique)

- **Load Balancing** : Automatique (Vercel + Supabase)
- **Database Scaling** : Automatique Supabase
- **Caching** : Upstash Redis (facturation à l'usage)
- **CDN** : CloudFlare + Vercel Edge (global)

## Sécurité et Conformité

### 1. Audit de Sécurité

- **Penetration Testing** : Tests de sécurité réguliers
- **Code Review** : Revue de code obligatoire
- **Dependency Scanning** : Scan des vulnérabilités (GitHub + Vercel)
- **Security Headers** : OWASP compliance (automatique)
- **RLS Audit** : Vérification des politiques de sécurité

### 2. Backup et Récupération

- **Backup Automatique** : Supabase (quotidien + point-in-time)
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

- Architecture serverless avec React + Supabase
- Authentification et RLS par praticien
- CRUD patients et séances (RLS native)
- Interface mobile optimisée + PWA

### Phase 2 - Fonctionnalités Avancées (Mois 4-6)

- Edge Functions pour logique métier
- Calendrier interactif + Realtime
- Facturation automatique (PDF + Email)
- Rapports et analytics

### Phase 3 - Évolutivité (Mois 7-12)

- Edge Functions spécialisées
- Intégrations tierces (Stripe, etc.)
- Fonctionnalités collaboratives
- Scaling automatique

---

**Architecte** : Winston (BMad-Method)  
**Date** : 2024-12-19  
**Version** : 2.0 (Serverless)
