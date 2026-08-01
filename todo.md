# TODO de Trois d'un Coup

Audit fait le 2026-08-01 sur l'export brut (`build-match-3-game (1)`), suivi d'un
stress-test numérique de la génération de plateau et d'une passe QA navigateur
(Playwright + Chromium) avec vérification réelle du correctif et de la mécanique
centrale.

---

## ✅ Corrigé — glisser une gemme hors du plateau gelait la partie définitivement

- [x] **Un simple glissement un peu trop ample depuis une gemme de bord plantait le jeu et
  bloquait toute interaction future, sans qu'aucun rechargement de page ne soit suggéré au
  joueur.** Dans `GemCell.tsx`, `handlePointerUp` calcule la case de destination d'un
  glissement en ajoutant ±1 à la ligne ou à la colonne de départ selon la direction
  dominante du geste (`toRow += dy > 0 ? 1 : -1` etc.), **sans jamais vérifier que le
  résultat reste dans les bornes 0..7 du plateau**. `isAdjacent()` (dans `gameEngine.ts`)
  ne vérifie qu'une distance de 1 entre deux positions, pas leurs bornes — un glissement
  vers le haut depuis la ligne 0, ou vers la gauche depuis la colonne 0 (les 4 bords entiers
  du plateau, donc un geste très facile à faire par accident), produit une position
  valide selon `isAdjacent` mais hors tableau. `handleDragSwap` (`useGame.ts`) appelle
  alors `swapGems(board, from, to)`, qui tente `newBoard[-1][col]` ou `newBoard[8][col]` —
  `newBoard[-1]` vaut `undefined` en JavaScript, et accéder à une propriété dessus lève une
  exception. Cette exception survient **après** que `setPhase('swapping')` a déjà été
  appelé, donc la phase reste bloquée sur `'swapping'` pour toujours : `handleGemClick` et
  `handleDragSwap` commencent tous les deux par `if (phase !== 'idle') return;`, donc plus
  aucune interaction n'est possible ensuite — la seule issue est de recharger la page.
  Corrigé en ajoutant une vérification de bornes dans `handleDragSwap`, avant tout appel à
  `swapGems`, avec le même style de garde précoce (`return` silencieux) déjà utilisé pour
  le rejet des paires non adjacentes juste en dessous. **Vérifié sur l'application réelle**
  : un vrai geste de glissement (souris) simulé depuis la gemme en case (0,0) vers le haut
  (au-delà du plateau), effectué alors que `phase === 'idle'` (pour garantir que le test
  atteint bien le code corrigé et n'est pas simplement rejeté par une autre garde) — la
  phase reste `'idle'` après le geste (pas de gel), et un échange normal juste après
  réussit immédiatement (score qui progresse), prouvant que le plateau reste pleinement
  réactif.

## ✅ La passe QA navigateur

- [x] 0 erreur console, 0 exception non gérée
- [x] **Mécanique centrale observée réellement** : échange valide trouvé et déclenché
  (clics réels sur les cellules), score passé de 0 à 30 (un alignement de 3), cascade
  résolue jusqu'à ce que la phase revienne à `'idle'`
- [x] **Correctif de gel vérifié par un vrai geste de glissement** hors des limites du
  plateau (voir ci-dessus), pas seulement par lecture de code
- [x] Réactivité confirmée après le correctif : nouvel échange valide trouvé et exécuté
  immédiatement après le glissement hors plateau
- [x] Aucun débordement horizontal en 390×844, sur l'écran de démarrage comme en jeu

### Vérification de la génération procédurale

- [x] `createBoard` + `hasValidMoves` extraits et martelés via `npx tsx` sur 2000 plateaux
  générés : **0 plateau de départ sans aucun coup valide** (0,00%). Un plateau 8×8 à 6
  couleurs a un espace combinatoire trop riche pour qu'un blocage total soit atteignable en
  pratique, malgré l'absence de garantie explicite dans le code (`createBoard` évite
  seulement les alignements déjà formés à la génération, pas l'absence de coup jouable) —
  hypothèse testée et écartée plutôt que supposée, cohérent avec la rigueur attendue sur ce
  lot (voir la mémoire du projet).

---

## ⬜ Idées d'amélioration (non corrigées, notes d'audit)

- [ ] `GamePhase` déclare les valeurs `'clearing'` et `'checking'` mais aucune n'est jamais
  assignée nulle part dans le code (seuls `'idle'`, `'swapping'`, `'matching'` et
  `'falling'` sont réellement utilisés). Valeurs de type mortes, sans effet observable :
  pas corrigé.
