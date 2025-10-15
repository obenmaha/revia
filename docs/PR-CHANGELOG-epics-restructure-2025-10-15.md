# PR: Restructuration des Épiques et Ajustements Stories

## Contexte

- Demande: Mise à jour de la structure des épiques et ajustements des stories.
- Objectifs:
  - Epic 1 = FR1→FR7
  - Epic 2 = FR10 + NFR1→7 + Mentions/CGU (et Story 1.7 sans export)
  - Epic 3 = FR8 + FR9 (rappels avancés) + FR11 (export avancé)
  - Retirer l'export de la Story 1.5
  - Créer la Story 3.2 « Export avancé »
  - Déplacer « Système de Rappels Avancé » en Epic 3 (hors MVP)

## Files modifiés

- docs/prd/05-epic-structure.md
- docs/stories/1.5.story.md
- docs/stories/1.7.story.md
- docs/stories/3.2.story.md (nouveau)

## Détails des changements

### 1) docs/prd/05-epic-structure.md
- Restructuration de 1 épique → 3 épiques.
- Epic 1: FR1→FR7 (Story 1.5 sans export)
- Epic 2: FR10 + NFR1→7 + Mentions/CGU (1.7 sans export)
- Epic 3: FR8 + FR9 + FR11 (inclut Story 2.2 Rappels Avancé et 3.2 Export Avancé)

### 2) docs/stories/1.5.story.md
- Suppression de l'AC relatif à l'export et des sous-tâches d’export.
- Maintien des AC d’historique/statistiques et visualisation.

### 3) docs/stories/1.7.story.md
- Renommage en « Mode Guest (sans export) ».
- Suppression de toutes les tâches/mentions d’export.
- Conservation onboarding, bannière conversion, migration (RGPD) si applicable.

### 4) docs/stories/3.2.story.md (nouvelle)
- Création de la story « Export Avancé » couvrant CSV/PDF, filtres, RGPD.

## Rationnels

- Séparation claire MVP vs avancé: l’export et les rappels avancés ne sont pas requis pour le MVP, ce qui réduit le risque et la charge.
- Alignement FR/NFR: Epic 2 concentre le mode Guest (FR10) et la conformité (NFR1→7, mentions/CGU) pour sécuriser le MVP.
- Traçabilité: Story 1.5 conserve l’historique/statistiques sans exporter; l’export est formalisé en Story 3.2.
- Simplicité du planning: Les fonctionnalités avancées (FR8, FR9, FR11) sont regroupées en Epic 3.

## Impact sur le MVP

- Réduction du périmètre MVP aux fonctionnalités essentielles (FR1→FR7, FR10 + conformité de base).
- Moins de risques techniques (PDF, traitements lourds) et meilleur time-to-market.

## Points d’attention

- Vérifier cohérence des références aux exports dans docs/architecture et tests.
- Mettre à jour, si nécessaire, les gates QA pour 1.5 et 1.7 (sans export).

## Validation demandée

- Merci de confirmer que cette structuration répond aux attentes. Une fois validée, on pourra ajuster les liens internes (si présents) et ouvrir la PR officielle.



