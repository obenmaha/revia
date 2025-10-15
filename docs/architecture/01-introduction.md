# Architecture Sport MVP - Introduction

## Vue d'Ensemble

Ce document décrit l'architecture pour la transformation de l'application Revia d'un outil de gestion de cabinet vers une application sport-first pour les sportifs et patients autonomes. Cette transformation conserve l'architecture serverless Supabase existante tout en refocalisant complètement l'expérience utilisateur et les fonctionnalités métier.

## Relationship to Existing Architecture

Ce document complète l'architecture existante en définissant comment les nouveaux composants sport s'intègrent avec les systèmes actuels. Les conflits entre nouveaux et anciens patterns sont résolus en maintenant la cohérence tout en implémentant les améliorations.

### Existing Project Analysis

**Current Project State:**

- **Primary Purpose:** Application de gestion de cabinet de kinésithérapie avec gestion des patients, séances et facturation
- **Current Tech Stack:** React 19 + Vite + TypeScript + Tailwind + Zustand + TanStack Query + Supabase
- **Architecture Style:** Serverless "Full Supabase + Edge Functions" avec architecture modulaire
- **Deployment Method:** Vercel (Frontend) + Supabase (Backend)

**Available Documentation:**

- Architecture technique existante (docs/architecture-technique.md)
- PRD v1.0 et v1.1 avec spécifications détaillées
- Spécifications techniques complètes
- Standards de développement définis
- Types TypeScript et modèles de données Supabase

**Identified Constraints:**

- Architecture Supabase existante à préserver
- RLS (Row Level Security) déjà implémenté
- Structure de base de données cabinet existante
- Système d'authentification Supabase en place
- Déploiement Vercel + Supabase opérationnel

### Change Log

| Change   | Date       | Version | Description            | Author            |
| -------- | ---------- | ------- | ---------------------- | ----------------- |
| Création | 2025-01-14 | 1.0     | Architecture Sport MVP | BMad Orchestrator |
