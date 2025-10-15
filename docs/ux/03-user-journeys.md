# UX Design Sport MVP - Parcours Utilisateur

## Parcours Utilisateur

### 1. Parcours Guest (Premier Usage)

```
1. Arrivée sur l'app
   ↓
2. Écran d'accueil Guest
   ↓
3. [Commencer sans compte] → Mode Guest
   ↓
4. Création rapide d'une séance
   ↓
5. Réalisation de la séance
   ↓
6. Validation et feedback
   ↓
7. Bannière "Sauvegarder mes progrès"
   ↓
8. [Créer un compte] → Migration des données
```

#### Détails du Parcours Guest

**Étape 1 : Arrivée sur l'app**

- Landing page avec présentation des fonctionnalités
- CTA principal : "Commencer sans compte"
- CTA secondaire : "Créer un compte"

**Étape 2 : Écran d'accueil Guest**

- Interface simplifiée sans authentification
- Accès direct aux fonctionnalités principales
- Bannière de conversion visible

**Étape 3 : Mode Guest**

- Aucune inscription requise
- Données stockées localement
- Fonctionnalités limitées mais essentielles

**Étape 4 : Création rapide d'une séance**

- Formulaire simplifié en 2-3 étapes
- Templates de séances prédéfinis
- Sauvegarde automatique locale

**Étape 5 : Réalisation de la séance**

- Interface optimisée mobile
- Enregistrement des exercices
- Échelles RPE et douleur

**Étape 6 : Validation et feedback**

- Validation de la séance
- Feedback de félicitations
- Calcul automatique des statistiques

**Étape 7 : Bannière de conversion**

- "Sauvegarder mes progrès" visible
- Avantages du compte permanent
- Processus de migration simple

**Étape 8 : Migration des données**

- Création de compte en 1 clic
- Migration automatique des données
- Conservation de l'historique

### 2. Parcours Utilisateur Authentifié

```
1. Connexion
   ↓
2. Dashboard avec statistiques
   ↓
3. [Nouvelle séance] → Création
   ↓
4. [Dupliquer] → Sélection des dates
   ↓
5. [Commencer] → Réalisation
   ↓
6. Enregistrement des exercices
   ↓
7. Évaluation RPE/Douleur
   ↓
8. Validation → Mise à jour des stats
   ↓
9. Retour au dashboard
```

#### Détails du Parcours Authentifié

**Étape 1 : Connexion**

- Authentification Supabase
- Mémorisation de la session
- Redirection vers dashboard

**Étape 2 : Dashboard avec statistiques**

- Vue d'ensemble des progrès
- Prochaines séances programmées
- Streaks et badges actuels

**Étape 3 : Création de séance**

- Formulaire complet de création
- Sélection du type et des objectifs
- Planification de la date et heure

**Étape 4 : Duplication de séance**

- Sélection de la séance à dupliquer
- Picker de calendrier pour les dates
- Options de récurrence

**Étape 5 : Réalisation de séance**

- Interface de suivi en temps réel
- Enregistrement des exercices
- Sauvegarde automatique

**Étape 6 : Enregistrement des exercices**

- Ajout/modification des exercices
- Saisie des séries et répétitions
- Notes personnalisées

**Étape 7 : Évaluation RPE/Douleur**

- Échelles interactives
- Validation des données
- Notes de séance

**Étape 8 : Validation et mise à jour**

- Validation finale de la séance
- Mise à jour des statistiques
- Calcul des streaks et badges

**Étape 9 : Retour au dashboard**

- Affichage des nouvelles statistiques
- Prochaines séances mises à jour
- Feedback de progression

### 3. Parcours Gamification

```
1. Réalisation d'une séance
   ↓
2. Validation
   ↓
3. Calcul automatique du streak
   ↓
4. Vérification des badges
   ↓
5. Attribution des nouveaux badges
   ↓
6. Animation de félicitations
   ↓
7. Mise à jour des statistiques
```

#### Détails du Parcours Gamification

**Étape 1 : Réalisation d'une séance**

- Utilisateur complète une séance
- Données enregistrées en temps réel
- Sauvegarde automatique

**Étape 2 : Validation**

- Utilisateur valide la séance
- Données finalisées et sauvegardées
- Déclenchement des calculs

**Étape 3 : Calcul automatique du streak**

- Vérification de la continuité
- Mise à jour du compteur
- Historique des streaks

**Étape 4 : Vérification des badges**

- Analyse des critères de badges
- Comparaison avec les seuils
- Identification des nouveaux badges

**Étape 5 : Attribution des nouveaux badges**

- Création des nouveaux badges
- Association à l'utilisateur
- Sauvegarde en base

**Étape 6 : Animation de félicitations**

- Notification de nouveau badge
- Animation de célébration
- Affichage des détails

**Étape 7 : Mise à jour des statistiques**

- Recalcul des statistiques globales
- Mise à jour du dashboard
- Synchronisation des données

## Parcours d'Erreur et Récupération

### Erreurs de Connexion

1. **Problème de réseau** : Message d'erreur + bouton de retry
2. **Session expirée** : Redirection vers login + sauvegarde des données
3. **Serveur indisponible** : Mode offline avec données locales

### Erreurs de Données

1. **Validation échouée** : Messages d'erreur contextuels
2. **Sauvegarde échouée** : Retry automatique + notification
3. **Données corrompues** : Restauration depuis backup

### Erreurs d'Interface

1. **Composant non chargé** : Skeleton + retry
2. **Animation bloquée** : Fallback statique
3. **Responsive cassé** : Mode de compatibilité

## Parcours d'Accessibilité

### Navigation Clavier

1. **Tab** : Navigation séquentielle
2. **Entrée** : Activation des éléments
3. **Échap** : Fermeture des modales
4. **Flèches** : Navigation dans les listes

### Lecteurs d'Écran

1. **Labels explicites** : Description des actions
2. **États annoncés** : Changements d'état
3. **Hiérarchie** : Structure logique
4. **Focus** : Position actuelle

### Contraste et Visibilité

1. **Ratio 4.5:1** : Texte lisible
2. **États visuels** : Différenciation claire
3. **Couleurs** : Information non dépendante
4. **Taille** : Éléments tactiles 44px min

## Métriques UX

### Temps de Tâche

- **Création de séance** : < 30 secondes
- **Duplication de séance** : < 15 secondes
- **Validation de séance** : < 10 secondes
- **Navigation entre écrans** : < 2 secondes

### Taux d'Erreur

- **Actions critiques** : < 5%
- **Formulaires** : < 10%
- **Navigation** : < 2%
- **Sauvegarde** : < 1%

### Satisfaction

- **Score SUS** : > 70
- **NPS** : > 50
- **Retention D7** : > 60%
- **Adoption Guest** : > 80%

### Performance

- **TTFB** : < 1 seconde
- **Bundle** : < 300 KB
- **LCP** : < 2.5 secondes
- **CLS** : < 0.1
