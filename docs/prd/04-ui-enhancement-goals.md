# PRD Sport MVP - Objectifs d'Amélioration UI

## User Interface Enhancement Goals

### Integration with Existing UI

L'interface sport-first s'intègre avec le système de design existant en utilisant les composants Radix UI + Tailwind CSS déjà en place, mais en refocalisant la navigation sur un barre d'onglets mobile-first (Accueil / Nouvelle séance / Historique / Profil).

**Principes d'intégration** :
- Réutilisation maximale des composants existants
- Conservation de la cohérence visuelle
- Adaptation mobile-first sans casser le desktop
- Extension progressive des fonctionnalités

### Modified/New Screens and Views

#### Écrans Modifiés
- **Dashboard principal** : Transformation en dashboard sportif avec statistiques et prochaines séances
- **Navigation** : Refactoring vers barre d'onglets mobile-first
- **Authentification** : Ajout du mode Guest sans authentification

#### Nouveaux Écrans
- **Écran d'accueil sport** : Dashboard avec streaks, badges et prochaines séances
- **Nouvelle séance** : Création et duplication de séances avec picker calendrier
- **Historique sport** : Liste chronologique des séances avec filtres
- **Profil sportif** : Gestion du profil utilisateur et préférences
- **Mode Guest** : Interface simplifiée sans authentification
- **Gamification** : Écran des statistiques, streaks et badges

### UI Consistency Requirements

#### Navigation Mobile-First
- **Barre d'onglets en bas** : Accueil / Nouvelle séance / Historique / Profil
- **Gestes tactiles** : Swipe, tap, long press optimisés
- **États actifs** : Indicateurs visuels clairs pour l'onglet actif
- **Transitions fluides** : Animations légères entre les écrans

#### Flux Central Sport
- **Programmer → Faire → Valider** : Parcours principal en 3 étapes
- **Écrans dédiés** : Chaque étape a son écran spécialisé
- **CTA clairs** : Boutons d'action évidents et accessibles
- **Feedback immédiat** : Confirmation des actions importantes

#### Création Express + Duplication
- **Création rapide** : Formulaire simplifié en 2-3 étapes
- **Duplication multi-dates** : Picker calendrier pour sélection multiple
- **Templates** : Séances prédéfinies pour accélérer la création
- **Sauvegarde automatique** : Brouillons sauvegardés localement

#### Mode Guest Optimisé
- **Onboarding 1 clic** : Aucune inscription requise
- **Interface simplifiée** : Fonctionnalités essentielles uniquement
- **Bannière de conversion** : "Sauvegarder mes progrès" visible
- **Migration fluide** : Passage vers compte permanent sans perte de données

### Design Patterns Sport

#### Composants Spécialisés
- **StreakCounter** : Affichage des streaks avec progression visuelle
- **BadgeSystem** : Système de badges avec états (obtenu/verrouillé)
- **RPEScale** : Échelles RPE et douleur interactives
- **SessionCard** : Cartes de séances avec actions contextuelles

#### Couleurs et Thèmes
- **Couleurs sport** : Bleu sport, vert succès, orange énergie
- **Gamification** : Feu streak, or/argent/bronze badges
- **RPE** : Dégradé vert → jaune → orange → rouge
- **États** : Succès (vert), en cours (bleu), erreur (rouge)

#### Typographie et Espacement
- **Mobile-first** : Tailles de police adaptées au mobile
- **Hiérarchie claire** : Titres, sous-titres, corps de texte
- **Espacement cohérent** : Système d'espacement uniforme
- **Lisibilité** : Contraste suffisant, interlignage optimal

### Responsive Design

#### Mobile (< 640px)
- **Navigation onglets** : Barre en bas avec 4 onglets
- **Cartes pleine largeur** : Utilisation optimale de l'espace
- **Boutons tactiles** : Taille minimum 44px
- **Texte lisible** : Pas de zoom nécessaire

#### Tablet (640px - 1024px)
- **Navigation hybride** : Onglets + sidebar selon le contexte
- **Grille 2 colonnes** : Cartes en grille pour les listes
- **Espacement optimisé** : Équilibre entre mobile et desktop
- **Interactions tactiles** : Optimisées pour les doigts

#### Desktop (> 1024px)
- **Sidebar complète** : Navigation étendue avec toutes les options
- **Grille 3 colonnes** : Utilisation optimale de l'espace large
- **Hover states** : Interactions souris avancées
- **Navigation clavier** : Support complet du clavier

### Accessibilité

#### WCAG AA Compliance
- **Contraste** : Ratio minimum 4.5:1 pour le texte
- **Focus** : Indicateurs de focus visibles et cohérents
- **Navigation** : Navigation clavier complète
- **Écrans lecteurs** : Labels et descriptions appropriés
- **Couleurs** : Information non dépendante de la couleur uniquement

#### Bonnes Pratiques
- **Labels explicites** : "Commencer la séance" vs "Bouton"
- **États clairs** : Visuellement distincts (actif, inactif, en cours)
- **Feedback** : Confirmation des actions importantes
- **Erreurs** : Messages d'erreur clairs et actionables
- **Chargement** : Indicateurs de progression visibles
