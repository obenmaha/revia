# PRD Sport MVP - Exigences Fonctionnelles

## Functional Requirements

### FR1 - Profil Utilisateur Sportif

**FR1** : L'application doit permettre la création d'un profil léger avec prénom/pseudo, objectifs simples (texte), et préférences utilisateur.

**Détails** :
- Nom d'affichage ou pseudo (obligatoire)
- Objectifs sportifs en texte libre (optionnel)
- Préférences utilisateur (notifications, thème, etc.)
- Profil minimal pour réduire la friction d'inscription

### FR2 - Programmation de Séances

**FR2** : L'application doit permettre de programmer une séance avec date, type, et objectifs rapides.

**Détails** :
- Sélection de date et heure
- Type de séance (cardio, musculation, yoga, autre)
- Objectifs de la séance en texte libre
- Interface simple et rapide

### FR3 - Duplication de Séances (Fonctionnalité Clé)

**FR3** : L'application doit permettre de dupliquer une séance sur dates multiples (fonctionnalité clé UX MVP).

**Détails** :
- Duplication d'une séance existante
- Sélection de dates multiples
- Options de récurrence (quotidien, tous les 2 jours, hebdomadaire)
- Picker de calendrier pour faciliter la sélection

### FR4 - Enregistrement des Exercices

**FR4** : L'application doit permettre d'enregistrer les exercices de la séance (nom, séries/répétitions/temps au besoin), RPE & douleur (échelle simple), et note rapide.

**Détails** :
- Nom de l'exercice
- Nombre de séries et répétitions
- Poids ou durée selon le type d'exercice
- Échelle RPE (Rate of Perceived Exertion) de 1 à 10
- Échelle de douleur de 1 à 10
- Notes libres pour chaque exercice

### FR5 - Validation de Séance

**FR5** : L'application doit permettre de valider la séance (mise à jour des statistiques + feedback).

**Détails** :
- Validation finale de la séance
- Mise à jour automatique des statistiques
- Feedback de félicitations
- Calcul automatique du streak

### FR6 - Historique Chronologique

**FR6** : L'application doit fournir un historique chronologique avec filtres par période.

**Détails** :
- Liste chronologique des séances
- Filtres par période (semaine, mois, année)
- Filtres par type de séance
- Recherche dans l'historique

### FR7 - Statistiques Simples

**FR7** : L'application doit afficher des statistiques simples : fréquence/semaine, durée totale, tendance RPE.

**Détails** :
- Fréquence d'entraînement par semaine
- Durée totale des séances
- Tendance du RPE dans le temps
- Graphiques simples et clairs

### FR8 - Gamification Basique

**FR8** : L'application doit implémenter une gamification basique : streaks + quelques badges (paliers).

**Détails** :
- Système de streaks (jours consécutifs)
- Badges de progression (première séance, régularité, etc.)
- Paliers de récompenses
- Animations de félicitations

### FR9 - Système de Rappels

**FR9** : L'application doit envoyer des rappels (notifications locales/email simples ; opt-in).

**Détails** :
- Notifications locales pour les séances programmées
- Emails de rappel (optionnel)
- Paramètres de notification personnalisables
- Respect du consentement utilisateur

### FR10 - Mode Guest

**FR10** : L'application doit proposer un mode Guest avec données locales temporaires et onboarding en 1 clic.

**FR10.1** : Le mode Guest doit stocker les données localement (localStorage) avec expiration automatique après 30 jours.

**FR10.2** : L'application doit proposer une migration sécurisée des données Guest vers un compte permanent avec consentement explicite.

**FR10.3** : Les données Guest doivent être chiffrées localement et supprimées automatiquement après migration ou expiration.

**Détails** :
- Aucune inscription requise
- Données stockées localement
- Onboarding en 1 clic
- Migration vers compte permanent
- Chiffrement des données sensibles

### FR11 - Export Léger

**FR11** : L'application doit permettre un export léger : CSV/PDF récap basique (séances validées).

**FR11.1** : L'export doit inclure les mentions légales RGPD et le consentement explicite de l'utilisateur.

**FR11.2** : L'export doit permettre la suppression des données personnelles conformément au RGPD.

**FR11.3** : L'export doit être limité aux données strictement nécessaires (principe de minimisation).

**Détails** :
- Export CSV des séances validées
- Export PDF avec graphiques basiques
- Mentions légales RGPD incluses
- Droit à la suppression des données
