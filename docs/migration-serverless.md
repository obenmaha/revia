# Migration vers Architecture Serverless - App-Kine

## Vue d'Ensemble

Ce document décrit la migration d'App-Kine vers une **architecture serverless "Full Supabase + Edge Functions"**, éliminant les doublons techniques et simplifiant la maintenance.

## 🎯 **Objectifs de la Migration**

### **Avant (Architecture Monolithique)**

```
Frontend (React) → Express.js → Prisma → PostgreSQL
                 → JWT Custom → bcrypt
                 → AWS S3 + Redis
```

### **Après (Architecture Serverless)**

```
Frontend (React) → Supabase Client → PostgreSQL + RLS
                 → Edge Functions → Business Logic
                 → Supabase Storage + Auth
```

## 📋 **Plan de Migration - 7 Jours**

### **J1-J2 : Nettoyage Architecture**

#### **Suppression des Doublons**

```bash
# 1. Supprimer le backend Express/Prisma
rm -rf backend/

# 2. Supprimer les packages redondants
npm uninstall prisma @prisma/client jsonwebtoken bcryptjs redis

# 3. Nettoyer les imports
# Remplacer tous les imports Prisma par Supabase Client
```

#### **Migration des Services**

```typescript
// AVANT (Prisma)
const patient = await prisma.patient.create({
  data: { firstName, lastName, practitionerId },
});

// APRÈS (Supabase Client)
const { data: patient } = await supabase
  .from('patients')
  .insert({
    first_name: firstName,
    last_name: lastName,
    practitioner_id: practitionerId,
  })
  .select()
  .single();
```

### **J2-J3 : Configuration RLS**

#### **Policies RLS par Tenant**

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Policy pour patients (isolation par praticien)
CREATE POLICY "Users can only access their own patients" ON patients
  FOR ALL USING (practitioner_id = auth.uid());

-- Policy pour sessions
CREATE POLICY "Users can only access their own sessions" ON sessions
  FOR ALL USING (practitioner_id = auth.uid());

-- Index pour performance
CREATE INDEX idx_patients_practitioner_id ON patients(practitioner_id);
CREATE INDEX idx_sessions_practitioner_id ON sessions(practitioner_id);
```

### **J3-J4 : Edge Functions**

#### **Structure Edge Functions**

```
supabase/functions/
├── generate-invoice/
│   └── index.ts
├── send-email/
│   └── index.ts
├── daily-report/
│   └── index.ts
└── upload-document/
    └── index.ts
```

#### **Exemple Edge Function**

```typescript
// supabase/functions/generate-invoice/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async req => {
  const { sessionIds, patientId } = await req.json();

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Récupérer les sessions (RLS appliqué automatiquement)
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, patients(*)')
    .in('id', sessionIds)
    .eq('patient_id', patientId);

  // Logique métier de facturation...

  return new Response(JSON.stringify({ success: true }));
});
```

### **J4-J5 : Configuration Supabase Storage**

#### **Policies Storage RLS**

```sql
-- Créer le bucket pour les documents patients
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-documents', 'patient-documents', false);

-- Policy pour l'upload (seul le praticien peut uploader)
CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

### **J5-J6 : Tests d'Intégration**

#### **Test Patient Flow avec RLS**

```typescript
// tests/integration/patient-flow.test.ts
describe('Patient Flow with RLS', () => {
  test('Complete patient journey with RLS isolation', async () => {
    // 1. Login as practitioner
    const {
      data: { user },
    } = await supabase.auth.signInWithPassword({
      email: 'practitioner@test.com',
      password: 'password123',
    });

    // 2. Create patient (RLS will ensure it's linked to this practitioner)
    const { data: patient } = await supabase
      .from('patients')
      .insert({ first_name: 'John', last_name: 'Doe' })
      .select()
      .single();

    expect(patient.practitioner_id).toBe(user.id);

    // 3. Verify RLS isolation
    const { data: otherData } = await supabase
      .from('patients')
      .select('*')
      .neq('practitioner_id', user.id);

    expect(otherData).toEqual([]); // Should be empty due to RLS
  });
});
```

### **J6-J7 : Déploiement**

#### **Configuration Vercel**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_SENTRY_DSN": "@sentry-dsn"
  }
}
```

#### **GitHub Actions**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🔄 **Mapping des Fonctionnalités**

### **Authentification**

| Avant               | Après                     |
| ------------------- | ------------------------- |
| JWT Custom + bcrypt | Supabase Auth (JWT natif) |
| Sessions Redis      | Sessions Supabase (auto)  |
| Middleware Express  | RLS automatique           |

### **Base de Données**

| Avant             | Après                |
| ----------------- | -------------------- |
| Prisma ORM        | Supabase Client      |
| Migrations Prisma | Migrations SQL       |
| Validation Zod    | Validation Zod + RLS |

### **Stockage de Fichiers**

| Avant          | Après            |
| -------------- | ---------------- |
| AWS S3         | Supabase Storage |
| Upload custom  | Upload avec RLS  |
| CDN CloudFlare | CDN Supabase     |

### **Logique Métier**

| Avant               | Après          |
| ------------------- | -------------- |
| Services Express    | Edge Functions |
| Contrôleurs Express | Edge Functions |
| Routes Express      | Supabase API   |

## 📊 **Avantages de la Migration**

### **Sécurité Renforcée**

- ✅ **RLS natif** : Isolation automatique par praticien
- ✅ **Auth centralisé** : Un seul point d'authentification
- ✅ **Audit automatique** : Logs d'accès intégrés

### **Performance Optimisée**

- ✅ **Edge Functions** : Logique métier proche des données
- ✅ **CDN global** : CloudFlare + Vercel Edge
- ✅ **Cache intelligent** : TanStack Query + Upstash Redis

### **Maintenance Simplifiée**

- ✅ **Pas de serveur** : Architecture serverless
- ✅ **Un seul client** : Supabase Client partout
- ✅ **Déploiement automatique** : GitHub Actions + Vercel

### **Coût Optimisé**

- ✅ **Pas de serveur Express** : Économies d'infrastructure
- ✅ **Facturation à l'usage** : Edge Functions + Storage
- ✅ **Scaling automatique** : Pas de gestion de capacité

## 🚨 **Points d'Attention**

### **Migration des Données**

- Vérifier que toutes les données existantes respectent le schéma RLS
- Tester les politiques RLS avec les données de production
- Prévoir un rollback si nécessaire

### **Tests de Régression**

- Tester tous les parcours utilisateur
- Vérifier l'isolation des données entre praticiens
- Valider les performances avec RLS

### **Formation Équipe**

- Documenter les nouvelles APIs Supabase
- Former l'équipe sur les Edge Functions
- Mettre à jour les procédures de déploiement

## 📈 **Métriques de Succès**

### **Performance**

- Temps de chargement < 2s (mobile)
- Temps de réponse API < 500ms
- Uptime > 99.9%

### **Sécurité**

- 0 vulnérabilités critiques
- 100% conformité RGPD
- Score A+ sur securityheaders.com

### **Développement**

- Temps de déploiement < 5 minutes
- 0 serveur à maintenir
- Réduction de 70% du code backend

---

**Architecte** : Winston (BMad-Method)  
**Date** : 2024-12-19  
**Version** : 2.0 (Serverless)
