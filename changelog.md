# Changelog de Trois d'un Coup

Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/), versionnage
[SemVer](https://semver.org/lang/fr/).

## [1.0.0] 2026-08-01

Première version intégrable à Hylst.Games, partie d'un export brut audité puis corrigé.

### Ajouté
- Bloc SEO complet dans `index.html` (description, keywords, og, twitter, robots,
  canonical) et `lang="fr"`
- `favicon.png` 32×32, `og-image.png` 1024×576 (capture réelle du jeu) et sa variante
  `og-image.webp`, `icon.webp` 128×128 pour la carte du menu
- `base: '/troisduncoup/'` dans `vite.config.ts`
- Vérification de bornes dans `handleDragSwap` (`useGame.ts`)

### Modifié
- Renommé **Gem Crush** en **Trois d'un Coup** (nom trop proche d'une licence connue de
  puzzle à gemmes)
- `package.json` : `react-vite-tailwind` v0.0.0 devenu `troisduncoup` v0.0.0
- Clé `localStorage` renommée de `gem-crush-high-score` vers `troisduncoup-high-score`
- 3 occurrences de tiret long (`—`) dans les mentions d'auteur remplacées (règle du dépôt :
  aucun tiret long, ni dans les titres ni dans le code)

### Corrigé
- **Glisser une gemme de bord vers l'extérieur du plateau plantait le jeu et le gelait
  définitivement.** Le calcul de la case de destination d'un glissement ne vérifiait
  jamais les bornes du plateau (0..7), produisant une position hors tableau que
  `isAdjacent()` acceptait quand même. L'accès hors bornes qui en résultait levait une
  exception après que la phase de jeu avait déjà été mise à `'swapping'`, bloquant cette
  phase pour toujours et donc toute interaction future (tous les gestionnaires d'entrée
  exigent une phase `'idle'`). Corrigé par une vérification de bornes avant l'échange.
  Vérifié par un vrai geste de glissement hors plateau sur l'application réelle : plus de
  gel, le plateau reste pleinement réactif juste après.

### Vérifié
- Génération de plateau martelée sur 2000 tirages (`createBoard` + `hasValidMoves`) : 0%
  de plateau de départ sans coup valide.
- QA Playwright : échange réel déclenché avec succès (score 0 → 30), correctif du gel
  vérifié par un geste de glissement réel hors plateau suivi d'un échange normal réussi,
  aucun débordement horizontal en 390×844.
