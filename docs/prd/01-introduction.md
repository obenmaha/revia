# PRD Sport MVP - Introduction

## Vue d'Ensemble

Revia Sport MVP est une transformation de l'application Revia d'un outil de gestion de cabinet vers une application sport-first pour les sportifs et patients autonomes.

## Contexte du Projet

### Existing Project Overview

**Analysis Source**: IDE-based fresh analysis

**Current Project State**:
Revia est une application web de gestion de cabinet de kinésithérapie existante, construite avec une architecture serverless "Full Supabase + Edge Functions". L'application actuelle se concentre sur la gestion des patients, séances, et facturation pour les kinésithérapeutes.

### Available Documentation Analysis

**Available Documentation**:

- ✅ Tech Stack Documentation (React 19 + Vite + TypeScript + Tailwind + Zustand + TanStack Query)
- ✅ Source Tree/Architecture (Architecture serverless Supabase documentée)
- ✅ Coding Standards (Standards de développement définis)
- ✅ API Documentation (Supabase Auth, Postgres, Storage)
- ✅ External API Documentation (Supabase Edge Functions)
- ⚠️ UX/UI Guidelines (Partiellement documentées)
- ✅ Technical Debt Documentation (Identifiée dans l'architecture)
- ✅ Other: PRD v1.0, Architecture technique, Spécifications techniques

### Enhancement Scope Definition

**Enhancement Type**:

- ✅ New Feature Addition
- ✅ Major Feature Modification
- ✅ UI/UX Overhaul

**Enhancement Description**:
Transformation de l'application Revia d'un outil de gestion de cabinet vers une application sport-first pour les sportifs et patients autonomes, avec focus sur la programmation, réalisation et validation de séances d'exercices.

**Impact Assessment**:

- ✅ Major Impact (architectural changes required)

## Goals and Background Context

**Goals**:

- Aider les sportifs (et patients autonomes) à programmer, réaliser, valider leurs séances, simplement
- Augmenter l'adhérence aux exercices (baseline actuelle : 40% → objectif : 60% = +20 pts)
- Motiver via une gamification basique mais solide (streaks, badges light)
- Mobile-first, friction minimale (Guest), partage simple (CSV/PDF léger) à V1
- RGPD by design (data minimization, consentement explicite, RLS Supabase)

**Success Metrics (MVP) - Baseline Définie**:

- **Adhérence 30j** : % d'utilisateurs avec ≥2 séances/sem (baseline : 40% → objectif : 60%)
- **Activation D7** : % créent ≥1 séance + valident ≥1 séance (baseline : 25% → objectif : 45%)
- **Streak médian** : jours consécutifs (baseline : 3 jours → objectif : 7 jours)
- **Conversion Guest** : % Guest → compte permanent (baseline : 0% → objectif : 30%)

**Background Context**:
L'application Revia actuelle est conçue pour les kinésithérapeutes gérant leurs cabinets. Cette amélioration majeure transforme l'application en une solution sport-first pour les sportifs et patients autonomes, en conservant l'architecture technique existante mais en refocalisant complètement l'expérience utilisateur et les fonctionnalités métier.

### Change Log

| Date       | Version | Description                                                | Author            |
| ---------- | ------- | ---------------------------------------------------------- | ----------------- |
| 2024-12-19 | 1.0     | Création initiale du PRD                                   | John (PM)         |
| 2024-12-19 | 2.0     | Refocus patient/sportif                                    | John (PM)         |
| 2025-01-14 | 1.1     | Sport MVP – suppression Offline-first, Cabinet → V2        | BMad Orchestrator |
| 2025-01-14 | 1.2     | Alignement Revia: sport-first, brownfield, tech simplifiée | Oussama/PM        |
