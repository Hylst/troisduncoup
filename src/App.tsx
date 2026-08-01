import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useGame } from './useGame';
import GemCell from './GemCell';
import { BOARD_SIZE, CELL_SIZE, GEM_COLORS } from './types';
import {
  initAudio,
  startMusic,
  stopMusic,
  setMusicEnabled,
  setSfxEnabled,
  isMusicOn,
  isSfxOn,
  playClick,
} from './audio';

// Fond auroral animé
const AuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Couleurs de fond profond */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950" />

      {/* Orbes d'aurore */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px',
          animation: 'auroraShift 20s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.35) 0%, transparent 70%)',
          bottom: '-200px',
          right: '-200px',
          animation: 'auroraShift2 25s ease-in-out infinite',
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(34, 211, 238, 0.3) 0%, transparent 70%)',
          top: '30%',
          left: '40%',
          animation: 'auroraShift 30s ease-in-out infinite',
        }}
      />

      {/* Étoiles scintillantes */}
      <Stars count={80} />
    </div>
  );
};

// Étoiles scintillantes
const Stars: React.FC<{ count: number }> = ({ count }) => {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
    })), [count]);

  return (
    <div className="absolute inset-0">
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            boxShadow: `0 0 ${s.size * 2}px rgba(255,255,255,0.8)`,
          }}
        />
      ))}
    </div>
  );
};

// Particules qui explosent quand une gemme est détruite
const BurstParticles: React.FC<{ positions: { x: number; y: number; color: string }[] }> = ({ positions }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {positions.map((pos, idx) => (
        <BurstBurst key={idx} x={pos.x} y={pos.y} color={pos.color} />
      ))}
    </div>
  );
};

const BurstBurst: React.FC<{ x: number; y: number; color: string }> = ({ x, y, color }) => {
  const particles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const distance = 30 + Math.random() * 30;
      return {
        id: i,
        px: Math.cos(angle) * distance,
        py: Math.sin(angle) * distance,
        size: 3 + Math.random() * 3,
      };
    }), []);

  return (
    <>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: x,
            top: y,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 10px ${color}`,
            ['--px' as string]: `${p.px}px`,
            ['--py' as string]: `${p.py}px`,
            animation: 'particleBurst 600ms ease-out forwards',
          }}
        />
      ))}
    </>
  );
};



const ScoreDisplay: React.FC<{
  score: number;
  highScore: number;
  moves: number;
  combo: number;
  level: number;
  targetScore: number;
  totalCleared: number;
  onToggleMusic: () => void;
  onToggleSfx: () => void;
  musicOn: boolean;
  sfxOn: boolean;
}> = ({ score, highScore, moves, combo, level, targetScore, totalCleared, onToggleMusic, onToggleSfx, musicOn, sfxOn }) => {
  return (
    <div className="flex flex-col items-center gap-3 mb-4 w-full">
      {/* Logo */}
      <div className="relative">
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent tracking-tight animate-title-glow">
          💎 Trois d'un Coup
        </h1>
        <div className="text-center text-[10px] text-white/50 font-medium tracking-widest uppercase mt-1">
          Par Hylst
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 md:gap-3">
        <StatCard label="Score" value={score.toLocaleString('fr-FR')} color="text-white" large />
        <StatCard label="Niveau" value={level.toString()} color="text-yellow-300" />
        <StatCard label="Coups" value={moves.toString()} color={moves <= 5 ? 'text-red-400' : 'text-white'} pulse={moves <= 5} />
        <StatCard label="Record" value={highScore.toLocaleString('fr-FR')} color="text-amber-300" />
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[500px] px-2">
        <div className="flex justify-between text-[10px] text-white/60 mb-1 font-medium uppercase tracking-wider">
          <span>Niveau {level} → {level + 1}</span>
          <span>{score} / {targetScore}</span>
        </div>
        <div className="h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10 relative">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-full transition-all duration-500 relative overflow-hidden"
            style={{ width: `${Math.min((score / targetScore) * 100, 100)}%` }}
          >
            <div className="absolute inset-0 board-shine" />
          </div>
        </div>
        <div className="text-[10px] text-white/40 mt-1 text-center">
          {totalCleared.toLocaleString('fr-FR')} gemmes détruites
        </div>
      </div>

      {/* Combo indicator */}
      {combo > 1 && (
        <div className="absolute top-2 right-2 md:static pointer-events-none z-30">
          <div
            key={combo}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full px-5 py-1.5 text-white font-black text-lg shadow-[0_0_30px_rgba(255,100,0,0.8)] score-bump"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            COMBO ×{combo} 🔥
          </div>
        </div>
      )}

      {/* Contrôles audio */}
      <div className="absolute top-2 left-2 flex gap-1.5">
        <button
          onClick={onToggleMusic}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center text-base hover:scale-110 active:scale-95"
          title={musicOn ? 'Couper la musique' : 'Activer la musique'}
        >
          {musicOn ? '🎵' : '🔇'}
        </button>
        <button
          onClick={onToggleSfx}
          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all flex items-center justify-center text-base hover:scale-110 active:scale-95"
          title={sfxOn ? 'Couper les sons' : 'Activer les sons'}
        >
          {sfxOn ? '🔊' : '🔈'}
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color: string; large?: boolean; pulse?: boolean }> = ({
  label, value, color, large, pulse,
}) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 text-center shadow-lg"
       style={{ minWidth: large ? 110 : 75 }}>
    <div className="text-[9px] uppercase tracking-wider text-white/60 font-semibold">{label}</div>
    <div className={`font-black tabular-nums ${color} ${large ? 'text-2xl' : 'text-xl'} ${pulse ? 'animate-pulse' : ''}`}>
      {value}
    </div>
  </div>
);

const GameOverModal: React.FC<{
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  level: number;
  totalCleared: number;
  onRestart: () => void;
}> = ({ score, highScore, isNewHighScore, level, totalCleared, onRestart }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
    <div className="bg-gradient-to-br from-purple-900/95 to-indigo-900/95 rounded-3xl p-8 mx-4 max-w-sm w-full border border-white/20 shadow-2xl text-center"
         style={{ animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
      <div className="text-6xl mb-3" style={{ filter: 'drop-shadow(0 0 20px rgba(255,200,50,0.8))' }}>🏆</div>
      <h2 className="text-3xl font-black text-white mb-2">Partie terminée !</h2>
      {isNewHighScore && (
        <div className="text-yellow-300 font-bold text-lg mb-2 animate-pulse">
          🎉 Nouveau record ! 🎉
        </div>
      )}
      <div className="space-y-2 my-5">
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-white/60 text-sm">Score final</div>
          <div className="text-4xl font-black text-white tabular-nums">{score.toLocaleString('fr-FR')}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/10 rounded-xl p-2">
            <div className="text-white/60 text-[10px] uppercase">Niveau</div>
            <div className="text-xl font-black text-yellow-300">{level}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <div className="text-white/60 text-[10px] uppercase">Gemmes</div>
            <div className="text-xl font-black text-cyan-300">{totalCleared}</div>
          </div>
        </div>
        <div className="bg-white/10 rounded-xl p-3">
          <div className="text-white/60 text-sm">Meilleur score</div>
          <div className="text-2xl font-black text-amber-300 tabular-nums">{highScore.toLocaleString('fr-FR')}</div>
        </div>
      </div>
      <button
        onClick={onRestart}
        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl text-lg hover:from-pink-600 hover:to-purple-700 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50"
      >
        Rejouer ✨
      </button>
      <div className="mt-4 text-white/30 text-[10px] tracking-widest uppercase">
        Hylst
      </div>
    </div>
  </div>
);

// Écran de démarrage pour débloquer l'audio
const StartScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-950/95 backdrop-blur-md">
    <div className="text-center p-8 max-w-md" style={{ animation: 'scaleIn 0.6s ease-out' }}>
      <div className="text-8xl mb-4 animate-bounce" style={{ filter: 'drop-shadow(0 0 30px rgba(255,200,50,0.8))' }}>💎</div>
      <h1 className="text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3 animate-title-glow">
        Trois d'un Coup
      </h1>
      <div className="text-white/60 text-sm tracking-[0.3em] uppercase mb-8 font-medium">
        Par Hylst
      </div>
      <p className="text-white/80 mb-8 leading-relaxed">
        Échangez les gemmes pour aligner 3 pièces ou plus.<br />
        Combinez les cascades pour des scores explosifs !
      </p>
      <button
        onClick={onStart}
        className="group relative px-10 py-4 bg-gradient-to-r from-pink-500 via-purple-600 to-cyan-500 text-white font-black text-xl rounded-2xl shadow-2xl shadow-purple-500/50 hover:scale-110 active:scale-95 transition-transform overflow-hidden"
      >
        <span className="relative z-10">▶ Commencer</span>
        <div className="absolute inset-0 board-shine" />
      </button>
      <div className="mt-6 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-2xl mb-1">4️⃣</div>
          <div className="text-white/70">Gemme rayée</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-2xl mb-1">💥</div>
          <div className="text-white/70">Bombe</div>
        </div>
        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
          <div className="text-2xl mb-1">🌈</div>
          <div className="text-white/70">Arc-en-ciel</div>
        </div>
      </div>
    </div>
  </div>
);

export default function App() {
  const game = useGame();
  const {
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
  } = game;

  const [started, setStarted] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);

  // Burst particles pour chaque gemme détruite
  const [bursts, setBursts] = useState<{ id: string; x: number; y: number; color: string }[]>([]);
  const prevMatchedRef = useRef<Set<string>>(new Set());

  // Détecte quand des gemmes sont marquées comme matched et déclenche des particules
  useEffect(() => {
    const newMatches: typeof bursts = [];
    matchedPositions.forEach(key => {
      if (!prevMatchedRef.current.has(key)) {
        const [r, c] = key.split(',').map(Number);
        const gem = board[r]?.[c];
        if (gem) {
          const colors = GEM_COLORS[gem.type];
          newMatches.push({
            id: `${key}-${Date.now()}-${Math.random()}`,
            x: c * CELL_SIZE + CELL_SIZE / 2,
            y: r * CELL_SIZE + CELL_SIZE / 2,
            color: colors.glow,
          });
        }
      }
    });

    if (newMatches.length > 0) {
      setBursts(prev => [...prev, ...newMatches]);
      // Nettoyer après l'animation
      setTimeout(() => {
        setBursts(prev => prev.filter(b => !newMatches.find(n => n.id === b.id)));
      }, 700);
    }

    prevMatchedRef.current = new Set(matchedPositions);
  }, [matchedPositions, board]);

  const handleStart = useCallback(async () => {
    await initAudio();
    startMusic();
    setStarted(true);
  }, []);

  const handleToggleMusic = useCallback(() => {
    const newState = !musicOn;
    setMusicOn(newState);
    setMusicEnabled(newState);
    if (newState) startMusic();
  }, [musicOn]);

  const handleToggleSfx = useCallback(() => {
    const newState = !sfxOn;
    setSfxOn(newState);
    setSfxEnabled(newState);
    if (newState) playClick();
  }, [sfxOn]);

  // Sync audio state on mount
  useEffect(() => {
    setMusicOn(isMusicOn());
    setSfxOn(isSfxOn());
  }, []);

  // Cleanup music when component unmounts
  useEffect(() => {
    return () => stopMusic();
  }, []);

  const boardPixelSize = BOARD_SIZE * CELL_SIZE;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 md:p-4 relative overflow-hidden select-none">
      <AuroraBackground />

      <div className="relative z-10 flex flex-col items-center w-full max-w-[560px]">
        <ScoreDisplay
          score={score}
          highScore={highScore}
          moves={moves}
          combo={combo}
          level={level}
          targetScore={targetScore}
          totalCleared={totalCleared}
          onToggleMusic={handleToggleMusic}
          onToggleSfx={handleToggleSfx}
          musicOn={musicOn}
          sfxOn={sfxOn}
        />

        {/* Plateau de jeu */}
        <div
          className="relative rounded-2xl overflow-hidden border-2 border-white/20"
          style={{
            width: boardPixelSize,
            height: boardPixelSize,
            background: 'linear-gradient(135deg, rgba(30,15,60,0.92), rgba(15,5,35,0.98))',
            boxShadow: combo > 2
              ? `0 0 80px rgba(255, 150, 50, ${0.3 + combo * 0.1}), inset 0 0 40px rgba(139, 92, 246, 0.15)`
              : '0 0 60px rgba(139, 92, 246, 0.4), inset 0 0 40px rgba(139, 92, 246, 0.1)',
            animation: boardShake ? 'shake 0.4s' : undefined,
          }}
        >
          {/* Motif de fond en grille */}
          <div className="absolute inset-0" style={{ opacity: 0.15 }}>
            {Array.from({ length: BOARD_SIZE }, (_, r) =>
              Array.from({ length: BOARD_SIZE }, (_, c) => (
                <div
                  key={`bg-${r}-${c}`}
                  className="absolute"
                  style={{
                    left: c * CELL_SIZE + 2,
                    top: r * CELL_SIZE + 2,
                    width: CELL_SIZE - 4,
                    height: CELL_SIZE - 4,
                    background: (r + c) % 2 === 0
                      ? 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent)'
                      : 'radial-gradient(circle, rgba(236, 72, 153, 0.12), transparent)',
                    borderRadius: 4,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                />
              ))
            )}
          </div>

          {/* Effet de brillance */}
          <div className="absolute inset-0 board-shine pointer-events-none z-15" />

          {/* Gemmes */}
          {board.map(row =>
            row.map(gem => {
              const isSelected =
                selected?.row === gem.row && selected?.col === gem.col;
              const isMatched = matchedPositions.has(`${gem.row},${gem.col}`);

              let swapOffset: { x: number; y: number } | undefined;
              if (swapAnim) {
                if (swapAnim.from.row === gem.row && swapAnim.from.col === gem.col) {
                  swapOffset = {
                    x: (swapAnim.to.col - swapAnim.from.col) * CELL_SIZE,
                    y: (swapAnim.to.row - swapAnim.from.row) * CELL_SIZE,
                  };
                } else if (swapAnim.to.row === gem.row && swapAnim.to.col === gem.col) {
                  swapOffset = {
                    x: (swapAnim.from.col - swapAnim.to.col) * CELL_SIZE,
                    y: (swapAnim.from.row - swapAnim.to.row) * CELL_SIZE,
                  };
                }
              }

              return (
                <GemCell
                  key={gem.id}
                  gem={gem}
                  isSelected={isSelected}
                  isMatched={isMatched}
                  swapOffset={swapOffset}
                  onClick={handleGemClick}
                  onDragSwap={handleDragSwap}
                />
              );
            })
          )}

          {/* Particules d'explosion */}
          <BurstParticles positions={bursts} />

          {/* Popups de score */}
          {scorePopups.map(popup => (
            <div
              key={popup.id}
              className="absolute pointer-events-none z-30"
              style={{
                left: popup.x,
                top: popup.y,
                animation: 'scorePopup 1.5s ease-out forwards',
              }}
            >
              <div className={`
                font-black text-center whitespace-nowrap
                ${popup.combo > 2 ? 'text-2xl text-yellow-300' : popup.combo > 1 ? 'text-xl text-orange-300' : 'text-lg text-white'}
              `}
              style={{
                textShadow: '0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,200,100,0.6), 0 2px 4px rgba(0,0,0,0.8)',
              }}
              >
                +{popup.score}
                {popup.combo > 1 && (
                  <span className="text-sm ml-1">×{popup.combo}</span>
                )}
              </div>
            </div>
          ))}

          {/* Overlay pour bloquer les clics pendant les animations */}
          {phase !== 'idle' && phase !== 'swapping' && (
            <div className="absolute inset-0 z-20" style={{ pointerEvents: 'all' }} />
          )}
        </div>

        {/* Contrôles */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={resetGame}
            className="bg-white/10 backdrop-blur-md text-white font-semibold py-2 px-5 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-sm hover:scale-105 active:scale-95"
          >
            🔄 Nouvelle partie
          </button>
        </div>

        {/* Légende */}
        <div className="mt-3 text-white/50 text-[11px] text-center max-w-[480px] leading-relaxed">
          <p className="mb-1">Cliquez ou glissez les gemmes pour échanger. Alignez 3 pièces ou plus !</p>
          <p className="flex flex-wrap justify-center gap-x-2 gap-y-0.5 text-[10px]">
            <span><span className="text-blue-300">4 alignées</span> → Rayée</span>
            <span>•</span>
            <span><span className="text-orange-300">Forme L/T</span> → Bombe</span>
            <span>•</span>
            <span><span className="text-purple-300">5 alignées</span> → Arc-en-ciel</span>
          </p>
        </div>

        {/* Crédit discret */}
        <div className="mt-3 text-white/30 text-[10px] tracking-widest uppercase">
          Créé par Hylst
        </div>
      </div>

      {/* Écran de démarrage pour débloquer l'audio */}
      {!started && <StartScreen onStart={handleStart} />}

      {/* Game over */}
      {isGameOver && started && (
        <GameOverModal
          score={score}
          highScore={highScore}
          isNewHighScore={score >= highScore && score > 0}
          level={level}
          totalCleared={totalCleared}
          onRestart={resetGame}
        />
      )}
    </div>
  );
}
