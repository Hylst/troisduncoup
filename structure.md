# Structure de Trois d'un Coup

## Arborescence

```
trois-dun-coup-game-development/
├── index.html              # template Vite + bloc SEO (lang=fr)
├── package.json            # troisduncoup v0.0.0
├── vite.config.ts          # base '/troisduncoup/', react + tailwind + singlefile
├── tsconfig.json
├── .gitignore                 # deps, secrets, fichiers d'agents IA
├── about.md / README.md / structure.md / features.md / todo.md / changelog.md
├── public/
│   ├── favicon.png
│   ├── og-image.png / og-image.webp
│   └── icon.webp             # carte du menu, 128x128
└── src/
    ├── main.tsx
    ├── index.css
    ├── types.ts                # Gem, SpecialType, BOARD_SIZE=8, CELL_SIZE=60
    ├── gameEngine.ts             # createBoard, findMatches, markMatches, applyGravity...
    ├── useGame.ts                 # hook : state React + orchestration (cascades, tours)
    ├── GemCell.tsx                 # une gemme : SVG + geste tap/glisser (pointer events)
    ├── audio.ts                    # sons synthétisés Web Audio
    ├── App.tsx                     # écrans (démarrage, jeu, game over), HUD, plateau
    └── utils/cn.ts
```

## Séparation logique / rendu

`gameEngine.ts` est un module pur (aucune dépendance React/DOM) : génération du plateau,
détection des alignements, création des gemmes spéciales, gravité, score. `useGame.ts`
orchestre ces fonctions pures via du state React et gère la boucle de résolution des
cascades (`processMatches`, une boucle `while` asynchrone avec des `delay()` entre chaque
étape pour laisser les animations CSS respirer). `GemCell.tsx` traduit les gestes
pointer (tap vs glisser, avec un seuil de `CELL_SIZE / 3`) en positions de départ/arrivée.

## Détection des alignements

`findMatches` scanne les lignes puis les colonnes pour des runs de 3+ gemmes identiques.
Un alignement de 4 crée une gemme rayée (horizontale ou verticale selon l'axe du match),
un alignement de 5+ crée un arc-en-ciel. Une passe supplémentaire recherche les
intersections entre un match horizontal et un match vertical (forme en L/T) pour y créer
une bombe à la place des specials individuels. `markMatches` active ensuite les effets des
gemmes spéciales déjà présentes sur le plateau qui se retrouvent prises dans un nouveau
match (chaîne de déclenchements via l'itération native d'un `Set` qui continue de visiter
les entrées ajoutées pendant son propre parcours).

## Geste tap / glisser (bug corrigé)

`GemCell` calcule la case de destination d'un glissement en ajoutant ±1 à la ligne ou à la
colonne de la gemme d'origine, selon la direction dominante du geste — **sans jamais
vérifier que le résultat reste dans les bornes du plateau** (voir le bug corrigé dans
`todo.md`). `isAdjacent()` ne vérifie qu'une distance de 1, pas des bornes 0..7 ; la borne
est maintenant vérifiée dans `handleDragSwap` (`useGame.ts`) avant tout appel à
`swapGems`.

## Build

`vite-plugin-singlefile` inline le JS et le CSS dans `index.html` (~272 Ko). Le `dist/`
contient en plus `favicon.png`, `og-image.png/webp` et `icon.webp` copiés depuis `public/`.
`base: '/troisduncoup/'` fait résoudre ces assets sous `https://games.hylst.fr/troisduncoup/`.
