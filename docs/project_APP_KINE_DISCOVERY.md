# Project Brief: APP KINE

## Executive Summary

**APP KINE** est une application web PWA (Progressive Web App) conçue pour les patients en rééducation ET les sportifs souhaitant suivre leurs performances. L'application permet de logger et suivre les séances d'exercices avec un focus sur l'enregistrement des exercices, séries, RPE (Rate of Perceived Exertion), niveaux de douleur et historique des progrès. L'authentification se fait par email avec option guest, et l'application sera développée avec Vite pour un déploiement web rapide.

**Problème principal :** Les patients en rééducation et les sportifs manquent d'un outil simple et accessible pour suivre leurs séances d'exercices, mesurer leurs progrès et maintenir la motivation.

**Marché cible :** Patients en rééducation + Sportifs (amateur et professionnel) + Athlètes en prévention/récupération.

**Proposition de valeur clé :** Une solution web simple, accessible et mobile-first pour le suivi personnalisé des exercices, que ce soit pour la rééducation ou l'optimisation des performances sportives.

## Problem Statement

### État actuel et points de douleur

**Pour les patients en rééducation :**

- **Manque de suivi structuré :** Pas d'outil centralisé pour enregistrer les exercices, séries et progrès
- **Difficulté de motivation :** Absence de visualisation des progrès et de rappels
- **Communication limitée :** Peu de moyens pour partager les données avec les kinésithérapeutes
- **Solutions existantes inadéquates :** Les applications généralistes de fitness ne sont pas adaptées aux besoins spécifiques de la rééducation
- **Complexité technique :** Les solutions existantes sont souvent trop complexes ou nécessitent des installations

**Pour les sportifs :**

- **Fragmentation des outils :** Utilisation de multiples applications non connectées
- **Manque de contexte :** Les apps fitness ne capturent pas le RPE et la douleur
- **Sur-engineering :** Solutions trop complexes pour un suivi simple et efficace
- **Pas de vision globale :** Difficulté à voir les tendances sur le long terme

### Impact du problème

- **Non-adhérence aux programmes :** 40-60% des patients abandonnent leur rééducation
- **Récupération prolongée :** Manque de suivi régulier retarde la guérison
- **Coûts supplémentaires :** Séances supplémentaires nécessaires en cas d'abandon
- **Frustration des utilisateurs :** Sentiment d'isolement et de manque de contrôle
- **Perte de performance :** Les sportifs ne peuvent pas optimiser efficacement leur entraînement

### Pourquoi les solutions existantes échouent

- **Applications fitness généralistes :** Non adaptées aux besoins spécifiques de rééducation ou de suivi de performance
- **Solutions complexes :** Interface trop chargée pour des utilisateurs qui veulent de la simplicité
- **Manque de personnalisation :** Pas d'adaptation aux pathologies spécifiques ou aux objectifs sportifs
- **Problèmes d'accessibilité :** Applications natives nécessitant des installations

## Proposed Solution

### Concept central

Une PWA web simple et intuitive permettant aux patients en rééducation et aux sportifs de :

- Enregistrer facilement leurs séances d'exercices
- Suivre leurs progrès avec des métriques claires (RPE, douleur)
- Consulter leur historique d'entraînement
- Accéder à l'application depuis n'importe quel navigateur
- Basculement entre mode "Rééducation" et "Performance"

### Différenciateurs clés

- **Simplicité d'usage :** Interface épurée et intuitive
- **Accessibilité web :** Pas d'installation requise, fonctionne sur tous les appareils
- **Double usage :** Conçu pour la rééducation ET la performance sportive
- **Mode guest :** Permet l'essai sans inscription
- **PWA :** Expérience native sur mobile avec fonctionnalités offline futures
- **Métriques contextuelles :** RPE et douleur pour un suivi complet

### Pourquoi cette solution réussira

- **Marché élargi :** Deux segments complémentaires (rééducation + sport)
- **Simplicité technique :** Développement rapide avec Vite et technologies web modernes
- **Adoption facile :** PWA permet l'essai immédiat sans friction
- **Évolutivité :** Architecture permettant l'ajout de fonctionnalités avancées

## Target Users

### Primary User Segment: Patients en rééducation

**Profil démographique :**

- Âge : 25-75 ans
- Niveau technologique : Débutant à intermédiaire
- Contexte : Blessures sportives, accidents, chirurgies, pathologies chroniques

**Comportements actuels :**

- Utilisation occasionnelle de smartphones/tablettes
- Recherche d'informations santé sur internet
- Préférence pour des solutions simples et intuitives
- Besoin de motivation et de suivi régulier

**Besoins spécifiques :**

- Enregistrement simple des exercices prescrits
- Suivi des progrès et de la douleur
- Rappels pour les séances
- Partage d'informations avec le kinésithérapeute

**Objectifs :**

- Récupérer rapidement et efficacement
- Maintenir la motivation tout au long du processus
- Comprendre leurs progrès
- Adhérer au programme de rééducation

### Primary User Segment: Sportifs et Athlètes

**Profil démographique :**

- Âge : 16-50 ans
- Niveau technologique : Intermédiaire à avancé
- Contexte : Sportifs amateurs, semi-professionnels, athlètes de haut niveau

**Comportements actuels :**

- Utilisation intensive d'applications de suivi (Strava, MyFitnessPal, etc.)
- Recherche constante d'optimisation des performances
- Suivi détaillé des métriques d'entraînement
- Partage des performances sur les réseaux sociaux

**Besoins spécifiques :**

- Enregistrement précis des séances d'entraînement
- Suivi des métriques de performance (RPE, douleur, progression)
- Analyse des tendances et patterns d'entraînement
- Comparaison des performances dans le temps
- Détection précoce de surcharge ou blessures

**Objectifs :**

- Optimiser les performances sportives
- Prévenir les blessures par un suivi attentif
- Maintenir la motivation et la régularité
- Analyser l'efficacité des programmes d'entraînement

## Goals & Success Metrics

### Business Objectives

- **Adoption utilisateur :** 2000 utilisateurs actifs dans les 6 premiers mois (1000 rééducation + 1000 sportifs)
- **Rétention :** 70% des utilisateurs actifs après 30 jours
- **Engagement :** 3+ séances enregistrées par semaine par utilisateur actif
- **Satisfaction :** Note moyenne de 4.5/5 sur les stores d'applications
- **Répartition équilibrée :** 60/40 entre patients rééducation et sportifs

### User Success Metrics

- **Facilité d'usage :** < 2 minutes pour créer un compte et enregistrer la première séance
- **Adhérence :** 80% des utilisateurs complètent leur programme de rééducation
- **Performance tracking :** 90% des sportifs voient une amélioration mesurable sur 8 semaines
- **Prévention des blessures :** 80% des utilisateurs détectent les signaux d'alerte précocement
- **Engagement sportif :** 5+ séances enregistrées par semaine pour les sportifs actifs
- **Satisfaction :** 90% des utilisateurs recommanderaient l'application

### Key Performance Indicators (KPIs)

- **Taux d'inscription :** 60% des visiteurs créent un compte
- **Taux de conversion guest :** 25% des utilisateurs guest s'inscrivent
- **Fréquence d'utilisation :** 4+ sessions par semaine
- **Temps de session :** 3-5 minutes par session d'enregistrement
- **Taux d'abandon :** < 20% après la première semaine
- **Utilisation des modes :** 70% utilisent le mode adapté à leur profil

## MVP Scope

### Core Features (Must Have)

- **Authentification :** Inscription/connexion par email + mode guest
- **Enregistrement de séances :** Interface pour logger exercices, séries, répétitions
- **Métriques de suivi :** RPE (1-10) et niveau de douleur (1-10) par exercice
- **Historique :** Visualisation des séances passées et progrès
- **Profil utilisateur :** Informations de base et préférences
- **Interface responsive :** Optimisée mobile-first avec PWA
- **Modes d'utilisation :** Basculement entre mode "Rééducation" et "Performance"
- **Métriques avancées :** Volume d'entraînement, fréquence, tendances

### Out of Scope for MVP

- Intelligence artificielle et recommandations automatiques
- Fonctionnalités offline complètes
- Intégration avec dispositifs IoT
- Chat/vidéo avec kinésithérapeutes
- Système de paiement ou abonnements
- Notifications push avancées
- Analytics avancés pour les professionnels
- Intégration avec d'autres apps sportives

### MVP Success Criteria

L'application est considérée comme réussie si :

- 80% des utilisateurs peuvent enregistrer une séance complète en moins de 3 minutes
- 70% des utilisateurs reviennent utiliser l'application dans les 7 jours
- L'application fonctionne sur 95% des navigateurs mobiles modernes
- Temps de chargement < 3 secondes sur connexion 3G
- 90% des utilisateurs comprennent la différence entre les modes

## Post-MVP Vision

### Phase 2 Features

- **Fonctionnalités offline :** Synchronisation des données hors ligne
- **Rappels intelligents :** Notifications personnalisées basées sur les habitudes
- **Partage avec professionnels :** Export des données pour les kinésithérapeutes
- **Templates d'exercices :** Bibliothèque d'exercices communs par pathologie et discipline sportive
- **Analytics avancés :** Graphiques de progression et tendances
- **Analytics de performance :** Graphiques avancés pour sportifs
- **Comparaisons temporelles :** Évolution des performances par période
- **Alertes intelligentes :** Détection de surcharge ou de régression
- **Export de données :** Intégration avec d'autres outils sportifs

### Long-term Vision

- **Plateforme complète :** Intégration avec les cabinets de kinésithérapie
- **IA basique :** Recommandations d'exercices basées sur les progrès
- **Communauté :** Forums et groupes de soutien par pathologie et discipline
- **Intégrations :** Connexion avec d'autres applications santé et sportives
- **Monétisation :** Abonnements premium et partenariats professionnels
- **Templates sportifs :** Programmes d'entraînement par discipline

### Expansion Opportunities

- **Marché B2B :** Solutions pour cabinets et cliniques
- **Intégration IoT :** Capteurs de mouvement et dispositifs de mesure
- **Télérééducation :** Fonctionnalités de consultation à distance
- **Marchés internationaux :** Localisation et adaptation culturelle
- **Partnerships sportifs :** Intégration avec fédérations et clubs

## Technical Considerations

### Platform Requirements

- **Target Platforms :** Web (PWA), iOS Safari, Android Chrome
- **Browser/OS Support :** Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- **Performance Requirements :** Chargement < 3s, interaction < 100ms

### Technology Preferences

- **Frontend :** React + TypeScript + Vite
- **Backend :** Node.js + Express ou Next.js API routes
- **Database :** PostgreSQL ou Supabase pour la simplicité
- **Hosting/Infrastructure :** Vercel ou Netlify pour le déploiement rapide

### Architecture Considerations

- **Repository Structure :** Monorepo avec frontend et backend
- **Service Architecture :** API REST simple avec authentification JWT
- **Integration Requirements :** PWA manifest, service workers pour le cache
- **Security/Compliance :** RGPD compliance, chiffrement des données sensibles

## Constraints & Assumptions

### Constraints

- **Budget :** Développement avec ressources limitées (développeur solo ou petite équipe)
- **Timeline :** MVP livrable en 8-12 semaines
- **Resources :** 1 développeur full-stack + 1 designer UX/UI (optionnel)
- **Technical :** PWA web uniquement, pas d'applications natives

### Key Assumptions

- Les utilisateurs préfèrent une solution web à une application native
- L'authentification par email est suffisante pour le MVP
- Les utilisateurs sont prêts à saisir manuellement leurs données
- Le mode guest permettra une adoption rapide
- La simplicité prime sur les fonctionnalités avancées
- Les sportifs et patients peuvent coexister dans la même interface

## Risks & Open Questions

### Key Risks

- **Adoption utilisateur :** Risque que les utilisateurs préfèrent des solutions plus complètes
- **Concurrence :** Applications fitness existantes qui ajoutent des fonctionnalités rééducation
- **Complexité technique :** Défis PWA sur certains navigateurs/appareils
- **Données sensibles :** Responsabilité légale pour les données de santé
- **Confusion des modes :** Risque que les utilisateurs ne comprennent pas la différence entre les modes

### Open Questions

- Quel niveau de personnalisation les utilisateurs attendent-ils ?
- Comment intégrer les recommandations des kinésithérapeutes ?
- Quelles métriques sont les plus importantes pour motiver les utilisateurs ?
- Comment gérer la transition du mode guest vers l'inscription ?
- Comment équilibrer les besoins des deux segments d'utilisateurs ?

### Areas Needing Further Research

- Étude des applications de rééducation existantes
- Étude des applications de suivi sportif existantes
- Interviews avec des patients en rééducation
- Interviews avec des sportifs amateurs et professionnels
- Validation des métriques RPE et douleur
- Analyse des contraintes légales pour les données de santé

## Next Steps

### Immediate Actions

1. **Lancer une session de brainstorming** pour explorer les fonctionnalités et l'expérience utilisateur pour les deux segments
2. **Créer des wireframes** des écrans principaux (authentification, sélection de mode, enregistrement séance, historique)
3. **Définir l'architecture technique** détaillée et choisir la stack technologique
4. **Créer un prototype fonctionnel** des fonctionnalités core avec les deux modes
5. **Tester avec des utilisateurs** potentiels des deux segments pour valider le concept

### PM Handoff

Ce Project Brief fournit le contexte complet pour APP KINE. Veuillez commencer en 'Mode Génération PRD', examiner le brief en détail pour travailler avec l'utilisateur afin de créer la section PRD section par section comme l'indique le template, en demandant toute clarification nécessaire ou en suggérant des améliorations.
