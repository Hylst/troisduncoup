# Fonctionnalités de Trois d'un Coup

## Gameplay

- ✅ Plateau 8×8, 6 types de gemmes, échange tap ou glisser
- ✅ **Échange vers l'extérieur du plateau désormais sans risque** (bug corrigé — voir
  todo.md) : glisser une gemme de bord au-delà du plateau n'a plus d'effet, au lieu de
  planter et geler définitivement la partie
- ✅ Cascades en chaîne avec multiplicateur de combo (+50% par palier)
- ✅ Gemmes spéciales : rayée (4 alignées), arc-en-ciel (5 alignées), bombe (forme en L/T)
- ✅ Activation en chaîne des gemmes spéciales déjà sur le plateau si reprises dans un
  nouveau match
- ✅ Niveaux progressifs (seuil de score croissant), +5 coups par palier
- ✅ Détection de plateau bloqué (aucun coup valide) après une cascade : régénération
  automatique
- ✅ Record de score sauvegardé (localStorage)

## Interface

- ✅ Écran de démarrage (déblocage audio), HUD (score, niveau, coups, record)
- ✅ Barre de progression vers le niveau suivant
- ✅ Popups de score flottants, particules d'explosion, tremblement du plateau sur gros
  combo
- ✅ Overlay de fin de partie avec statistiques
- ✅ Jouable au clic (tap-tap) ou au glisser-déposer, souris comme tactile
- ✅ Aucun débordement horizontal en 390×844

## Audio

- ✅ Musique de fond et effets sonores (échange, match, cascade, gemme spéciale, palier,
  game over) synthétisés en Web Audio
- ✅ Coupure indépendante de la musique et des effets

## Technique

- ✅ Build en un seul fichier (~272 Ko), fonctionne hors ligne
- ✅ TypeScript strict, `tsc --noEmit` propre (0 avertissement)
- ✅ Logique de jeu pure testée par script (génération de plateau martelée sur 2000
  tirages : 0% de plateau de départ sans coup valide)
- ✅ Bloc SEO complet, favicon, og-image (capture réelle du jeu)
- ⬜ Pas de tests automatisés embarqués
