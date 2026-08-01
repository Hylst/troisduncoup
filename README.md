# Trois d'un Coup

**Ça fait des étincelles. Alignez, enchaînez, explosez.**

Joue ici : [games.hylst.fr/troisduncoup/](https://games.hylst.fr/troisduncoup/)

![Trois d'un Coup](og-image.png)

## Comment on joue

Cliquez ou glissez une gemme vers une case voisine pour l'échanger. Si l'échange aligne 3
gemmes identiques ou plus, elles explosent et rapportent des points ; les gemmes du dessus
tombent pour combler le vide, ce qui peut déclencher de nouvelles cascades (combo). Un
alignement de 4 crée une gemme rayée (efface toute la ligne/colonne), un alignement de 5
crée un arc-en-ciel (efface toutes les gemmes d'une couleur), une forme en L ou en T crée
une bombe (explose en carré 3×3).

## Contrôles

| Action | Effet |
|--------|-------|
| Clic sur une gemme, puis clic sur une voisine | Échanger |
| Glisser une gemme vers une voisine | Échanger |

## Ce qu'il y a dedans

- Plateau 8×8, 6 types de gemmes
- Gemmes spéciales : rayée (ligne/colonne), bombe (zone), arc-en-ciel (couleur entière)
- Cascades et combos avec multiplicateur de score
- Niveaux progressifs, coups bonus à chaque palier
- Record de score sauvegardé (localStorage)

## L'arborescence

```
trois-dun-coup-game-development/
├── index.html          # template + bloc SEO
├── vite.config.ts      # base '/troisduncoup/' + singlefile
├── public/
│   ├── favicon.png
│   ├── og-image.png / og-image.webp
│   └── icon.webp        # carte du menu, 128x128
└── src/
    ├── main.tsx
    ├── types.ts          # types + constantes (BOARD_SIZE, couleurs)
    ├── gameEngine.ts      # logique pure : matches, gravité, score
    ├── useGame.ts         # hook d'état + orchestration des cascades
    ├── GemCell.tsx         # rendu d'une gemme (SVG) + geste tap/glisser
    ├── App.tsx             # écrans, HUD, plateau
    └── utils/cn.ts
```

## Dev

```bash
npm install
npm run dev       # http://localhost:5173/
npm run build     # dist/index.html, un seul fichier
npm run preview
```

## Stack

React 19, TypeScript 5.9 (strict), Tailwind CSS 4, Vite 7, vite-plugin-singlefile.

## Licence

MIT, Geoffroy Streit (Hylst)
