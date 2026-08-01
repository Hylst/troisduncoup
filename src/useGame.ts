import { useState, useCallback, useRef, useEffect } from 'react';
import { Gem, Position, ScorePopup, CELL_SIZE, BOARD_SIZE } from './types';
import {
  createBoard,
  swapGems,
  findMatches,
  markMatches,
  applyGravity,
  isAdjacent,
  hasValidMoves,
  calculateScore,
  generateId,
} from './gameEngine';
import {
  playSwap,
  playMatch,
  playCascade,
  playSpecialCreate,
  playBomb,
  playRainbow,
  playLevelUp,
  playGameOver,
  playClick,
  playInvalid,
} from './audio';

export type GamePhase = 'idle' | 'swapping' | 'matching' | 'clearing' | 'falling' | 'checking';

export function useGame() {
  const [board, setBoard] = useState<Gem[][]>(() => createBoard());
  const [selected, setSelected] = useState<Position | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [moves, setMoves] = useState(30);
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [matchedPositions, setMatchedPositions] = useState<Set<string>>(new Set());
  const [swapAnim, setSwapAnim] = useState<{ from: Position; to: Position } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [boardShake, setBoardShake] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('troisduncoup-high-score') || '0'); } catch { return 0; }
  });
  const [level, setLevel] = useState(1);
  const [targetScore, setTargetScore] = useState(1000);
  const [totalCleared, setTotalCleared] = useState(0);

  const comboRef = useRef(0);
  const processingRef = useRef(false);
  const prevScoreRef = useRef(0);

  const addScorePopup = useCallback((points: number, row: number, col: number, currentCombo: number) => {
    const popup: ScorePopup = {
      id: generateId(),
      score: points,
      x: col * CELL_SIZE + CELL_SIZE / 2,
      y: row * CELL_SIZE + CELL_SIZE / 2,
      combo: currentCombo,
      timestamp: Date.now(),
    };
    setScorePopups(prev => [...prev, popup]);
    setTimeout(() => {
      setScorePopups(prev => prev.filter(p => p.id !== popup.id));
    }, 1500);
  }, []);

  const processMatches = useCallback(async (currentBoard: Gem[][]) => {
    if (processingRef.current) return;
    processingRef.current = true;

    let workingBoard = currentBoard;
    let currentCombo = 0;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    while (true) {
      const matches = findMatches(workingBoard);
      if (matches.length === 0) break;

      currentCombo++;
      comboRef.current = currentCombo;
      setCombo(currentCombo);

      // Son de match ou cascade
      if (currentCombo === 1) {
        playMatch(1);
      } else {
        playCascade(currentCombo);
        // Shake du board pour gros combos
        if (currentCombo >= 3) {
          setBoardShake(true);
          setTimeout(() => setBoardShake(false), 400);
        }
      }

      setPhase('matching');
      const { board: markedBoard, clearedCount, specialsCreated } = markMatches(workingBoard, matches);

      // Son pour les gemmes spéciales créées
      for (const special of specialsCreated) {
        if (special.special === 'bomb') playBomb();
        else if (special.special === 'rainbow') playRainbow();
        else playSpecialCreate();
      }

      const matched = new Set<string>();
      for (const match of matches) {
        for (const pos of match.positions) {
          matched.add(`${pos.row},${pos.col}`);
        }
      }
      setMatchedPositions(matched);
      setBoard(markedBoard);

      const points = calculateScore(clearedCount, currentCombo);
      setScore(prev => prev + points);
      setTotalCleared(prev => prev + clearedCount);

      const allPositions = matches.flatMap(m => m.positions);
      const centerRow = allPositions.reduce((sum, p) => sum + p.row, 0) / allPositions.length;
      const centerCol = allPositions.reduce((sum, p) => sum + p.col, 0) / allPositions.length;
      addScorePopup(points, centerRow, centerCol, currentCombo);

      await delay(400);

      setPhase('falling');
      setMatchedPositions(new Set());
      workingBoard = applyGravity(markedBoard);
      setBoard(workingBoard);

      await delay(350);

      workingBoard = workingBoard.map(row =>
        row.map(gem => ({ ...gem, isNew: false, fallDistance: 0 }))
      );
      setBoard(workingBoard);

      await delay(100);
    }

    setPhase('idle');
    setCombo(0);
    comboRef.current = 0;
    processingRef.current = false;

    if (!hasValidMoves(workingBoard)) {
      const newBoard = createBoard();
      setBoard(newBoard);
    }
  }, [addScorePopup]);

  const handleGemClick = useCallback((pos: Position) => {
    if (phase !== 'idle' || isGameOver) return;

    playClick();

    if (!selected) {
      setSelected(pos);
      return;
    }

    if (selected.row === pos.row && selected.col === pos.col) {
      setSelected(null);
      return;
    }

    if (!isAdjacent(selected, pos)) {
      setSelected(pos);
      return;
    }

    setPhase('swapping');
    setSwapAnim({ from: selected, to: pos });
    setSelected(null);
    playSwap();

    const swappedBoard = swapGems(board, selected, pos);
    const matches = findMatches(swappedBoard);

    if (matches.length > 0) {
      setMoves(prev => prev - 1);
      setTimeout(() => {
        setSwapAnim(null);
        setBoard(swappedBoard);
        processMatches(swappedBoard);
      }, 250);
    } else {
      playInvalid();
      setTimeout(() => {
        setSwapAnim(null);
        setPhase('idle');
      }, 400);
    }
  }, [board, selected, phase, isGameOver, processMatches]);

  const handleDragSwap = useCallback((from: Position, to: Position) => {
    if (phase !== 'idle' || isGameOver) return;
    // Un glisser vers l'exterieur depuis une gemme de bord donne une case hors plateau
    // (-1 ou BOARD_SIZE) : isAdjacent() ne verifie que la distance, pas les bornes.
    if (to.row < 0 || to.row >= BOARD_SIZE || to.col < 0 || to.col >= BOARD_SIZE) return;
    if (!isAdjacent(from, to)) return;

    setPhase('swapping');
    setSelected(null);
    setSwapAnim({ from, to });
    playSwap();

    const swappedBoard = swapGems(board, from, to);
    const matches = findMatches(swappedBoard);

    if (matches.length > 0) {
      setMoves(prev => prev - 1);
      setTimeout(() => {
        setSwapAnim(null);
        setBoard(swappedBoard);
        processMatches(swappedBoard);
      }, 250);
    } else {
      playInvalid();
      setTimeout(() => {
        setSwapAnim(null);
        setPhase('idle');
      }, 400);
    }
  }, [board, phase, isGameOver, processMatches]);

  const resetGame = useCallback(() => {
    setBoard(createBoard());
    setSelected(null);
    setScore(0);
    setCombo(0);
    setMoves(30);
    setPhase('idle');
    setScorePopups([]);
    setMatchedPositions(new Set());
    setSwapAnim(null);
    setIsGameOver(false);
    setLevel(1);
    setTargetScore(1000);
    setTotalCleared(0);
    processingRef.current = false;
    playClick();
  }, []);

  // Game over
  useEffect(() => {
    if (moves <= 0 && phase === 'idle' && !isGameOver) {
      setIsGameOver(true);
      playGameOver();
      if (score > highScore) {
        setHighScore(score);
        try { localStorage.setItem('troisduncoup-high-score', score.toString()); } catch {}
      }
    }
  }, [moves, phase, isGameOver, score, highScore]);

  // Level progression
  useEffect(() => {
    if (score >= targetScore && !isGameOver && score > prevScoreRef.current) {
      setLevel(prev => prev + 1);
      setTargetScore(prev => prev + 1000 + level * 500);
      setMoves(prev => prev + 5);
      playLevelUp();
    }
    prevScoreRef.current = score;
  }, [score, targetScore, isGameOver, level]);

  return {
    board,
    selected,
    score,
    combo,
    moves,
    phase,
    scorePopups,
    matchedPositions,
    swapAnim,
    isGameOver,
    boardShake,
    highScore,
    level,
    targetScore,
    totalCleared,
    handleGemClick,
    handleDragSwap,
    resetGame,
    setSelected,
  };
}
