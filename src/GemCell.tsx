import React, { useRef, useCallback, useMemo } from 'react';
import { Gem, Position, GEM_COLORS, CELL_SIZE, SpecialType } from './types';

interface GemCellProps {
  gem: Gem;
  isSelected: boolean;
  isMatched: boolean;
  swapOffset?: { x: number; y: number };
  onClick: (pos: Position) => void;
  onDragSwap: (from: Position, to: Position) => void;
}

// Gemme 3D avec dégradés, facettes et reflets
const GemShape: React.FC<{ gemId: string; type: string; special: SpecialType; isMatched: boolean }> = React.memo(({
  gemId,
  type,
  special,
  isMatched,
}) => {

  // Formes détaillées pour chaque type de gemme
  const shapes: Record<string, React.ReactNode> = {
    ruby: (
      <>
        <defs>
          <linearGradient id={`g-${gemId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9aa8" />
            <stop offset="40%" stopColor="#e74c3c" />
            <stop offset="100%" stopColor="#8b1e2c" />
          </linearGradient>
          <radialGradient id={`shine-${gemId}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${gemId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon points="20,3 37,14 32,37 8,37 3,14" fill={`url(#g-${gemId})`} stroke="#fff" strokeWidth="0.6" filter={`url(#glow-${gemId})`} />
        {/* Facettes */}
        <polygon points="20,3 37,14 20,20 3,14" fill="#ffffff" opacity="0.15" />
        <polygon points="20,20 37,14 32,37" fill="#000000" opacity="0.15" />
        <polygon points="20,20 3,14 8,37" fill="#000000" opacity="0.25" />
        {/* Reflet */}
        <ellipse cx="14" cy="14" rx="6" ry="4" fill={`url(#shine-${gemId})`} />
        <polygon points="12,10 18,9 16,14" fill="#ffffff" opacity="0.7" />
      </>
    ),
    emerald: (
      <>
        <defs>
          <linearGradient id={`g-${gemId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a8f0d4" />
            <stop offset="40%" stopColor="#2ecc71" />
            <stop offset="100%" stopColor="#145a32" />
          </linearGradient>
          <radialGradient id={`shine-${gemId}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${gemId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <rect x="6" y="6" width="28" height="28" rx="3" fill={`url(#g-${gemId})`} stroke="#fff" strokeWidth="0.6" filter={`url(#glow-${gemId})`} />
        {/* Facettes en croix */}
        <polygon points="6,6 34,6 20,20" fill="#ffffff" opacity="0.2" />
        <polygon points="6,34 34,34 20,20" fill="#000000" opacity="0.2" />
        <polygon points="6,6 6,34 20,20" fill="#ffffff" opacity="0.1" />
        <polygon points="34,6 34,34 20,20" fill="#000000" opacity="0.15" />
        <rect x="10" y="10" width="8" height="6" rx="1" fill="#ffffff" opacity="0.5" />
        <ellipse cx="14" cy="13" rx="4" ry="2" fill={`url(#shine-${gemId})`} />
      </>
    ),
    sapphire: (
      <>
        <defs>
          <linearGradient id={`g-${gemId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a5d4ff" />
            <stop offset="40%" stopColor="#3498db" />
            <stop offset="100%" stopColor="#1a4a72" />
          </linearGradient>
          <radialGradient id={`shine-${gemId}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${gemId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <polygon points="20,3 37,20 20,37 3,20" fill={`url(#g-${gemId})`} stroke="#fff" strokeWidth="0.6" filter={`url(#glow-${gemId})`} />
        <polygon points="20,3 37,20 20,20" fill="#ffffff" opacity="0.2" />
        <polygon points="37,20 20,37 20,20" fill="#000000" opacity="0.2" />
        <polygon points="20,37 3,20 20,20" fill="#000000" opacity="0.3" />
        <polygon points="3,20 20,3 20,20" fill="#ffffff" opacity="0.1" />
        <polygon points="16,10 24,10 20,18" fill="#ffffff" opacity="0.6" />
        <ellipse cx="14" cy="14" rx="5" ry="3" fill={`url(#shine-${gemId})`} />
      </>
    ),
    topaz: (
      <>
        <defs>
          <linearGradient id={`g-${gemId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe5b4" />
            <stop offset="40%" stopColor="#f39c12" />
            <stop offset="100%" stopColor="#8e4a0a" />
          </linearGradient>
          <radialGradient id={`shine-${gemId}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${gemId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <polygon points="20,3 36,14 36,30 20,37 4,30 4,14" fill={`url(#g-${gemId})`} stroke="#fff" strokeWidth="0.6" filter={`url(#glow-${gemId})`} />
        <polygon points="20,3 36,14 20,20 4,14" fill="#ffffff" opacity="0.2" />
        <polygon points="20,20 36,14 36,30" fill="#000000" opacity="0.1" />
        <polygon points="20,20 36,30 20,37" fill="#000000" opacity="0.2" />
        <polygon points="20,20 20,37 4,30" fill="#000000" opacity="0.3" />
        <polygon points="20,20 4,30 4,14" fill="#000000" opacity="0.15" />
        <polygon points="16,10 24,10 20,17" fill="#ffffff" opacity="0.6" />
        <ellipse cx="14" cy="13" rx="5" ry="3" fill={`url(#shine-${gemId})`} />
      </>
    ),
    amethyst: (
      <>
        <defs>
          <radialGradient id={`g-${gemId}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#e4c5ff" />
            <stop offset="50%" stopColor="#9b59b6" />
            <stop offset="100%" stopColor="#4a1a5e" />
          </radialGradient>
          <radialGradient id={`shine-${gemId}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${gemId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle cx="20" cy="20" r="16" fill={`url(#g-${gemId})`} stroke="#fff" strokeWidth="0.6" filter={`url(#glow-${gemId})`} />
        {/* Reflets circulaires */}
        <ellipse cx="14" cy="14" rx="6" ry="4" fill="#ffffff" opacity="0.5" />
        <ellipse cx="12" cy="12" rx="3" ry="2" fill="#ffffff" opacity="0.9" />
        {/* Facette */}
        <path d="M 8 20 Q 20 8 32 20" fill="#ffffff" opacity="0.15" />
        <path d="M 8 20 Q 20 32 32 20" fill="#000000" opacity="0.15" />
      </>
    ),
    diamond: (
      <>
        <defs>
          <linearGradient id={`g-${gemId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e0e8f0" />
            <stop offset="60%" stopColor="#b8c5d4" />
            <stop offset="100%" stopColor="#7a8595" />
          </linearGradient>
          <linearGradient id={`prism-${gemId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#74b9ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#55efc4" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id={`shine-${gemId}`} cx="30%" cy="25%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <filter id={`glow-${gemId}`}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <polygon points="10,4 30,4 38,16 20,37 2,16" fill={`url(#g-${gemId})`} stroke="#fff" strokeWidth="0.6" filter={`url(#glow-${gemId})`} />
        {/* Facettes prismatiques */}
        <polygon points="10,4 30,4 20,16" fill="#ffffff" opacity="0.3" />
        <polygon points="10,4 20,16 2,16" fill={`url(#prism-${gemId})`} />
        <polygon points="30,4 38,16 20,16" fill={`url(#prism-${gemId})`} />
        <polygon points="20,16 2,16 20,37" fill="#000000" opacity="0.15" />
        <polygon points="20,16 38,16 20,37" fill="#000000" opacity="0.25" />
        <polygon points="14,9 26,9 20,15" fill="#ffffff" opacity="0.8" />
        <ellipse cx="15" cy="12" rx="4" ry="2" fill={`url(#shine-${gemId})`} />
      </>
    ),
  };

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <svg viewBox="0 0 40 40" className="w-[44px] h-[44px] drop-shadow-lg" style={{
        filter: isMatched ? 'brightness(2) saturate(1.5)' : undefined,
      }}>
        {shapes[type]}
      </svg>

      {/* Overlay pour les gemmes spéciales */}
      {special === 'striped-h' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[46px] h-[3px] bg-white/90 rounded-full shadow-[0_0_8px_white] animate-pulse" />
          <div className="absolute w-[46px] h-[3px] bg-white/90 rounded-full shadow-[0_0_8px_white]" style={{ transform: 'translateY(-6px)', opacity: 0.7 }} />
          <div className="absolute w-[46px] h-[3px] bg-white/90 rounded-full shadow-[0_0_8px_white]" style={{ transform: 'translateY(6px)', opacity: 0.7 }} />
        </div>
      )}
      {special === 'striped-v' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-[46px] w-[3px] bg-white/90 rounded-full shadow-[0_0_8px_white] animate-pulse" />
          <div className="absolute h-[46px] w-[3px] bg-white/90 rounded-full shadow-[0_0_8px_white]" style={{ transform: 'translateX(-6px)', opacity: 0.7 }} />
          <div className="absolute h-[46px] w-[3px] bg-white/90 rounded-full shadow-[0_0_8px_white]" style={{ transform: 'translateX(6px)', opacity: 0.7 }} />
        </div>
      )}
      {special === 'bomb' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[44px] h-[44px] rounded-full border-2 border-orange-300/80 animate-ping" />
          <div className="absolute w-[30px] h-[30px] rounded-full bg-gradient-radial from-yellow-200 via-orange-400 to-red-600 opacity-60 animate-pulse shadow-[0_0_20px_orange]">
            <div className="w-full h-full flex items-center justify-center text-white text-xl font-black">💥</div>
          </div>
        </div>
      )}
      {special === 'rainbow' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute w-[50px] h-[50px] rounded-full animate-spin-slow" style={{
            background: 'conic-gradient(from 0deg, #ff0000, #ff9900, #ffff00, #00ff00, #0099ff, #9900ff, #ff0000)',
            opacity: 0.7,
            filter: 'blur(2px)',
          }} />
          <div className="relative text-2xl animate-pulse" style={{ textShadow: '0 0 10px white' }}>✦</div>
        </div>
      )}
    </div>
  );
});

GemShape.displayName = 'GemShape';

// Particules d'étincelles autour de la gemme sélectionnée
const Sparkles: React.FC<{ color: string }> = ({ color }) => {
  const sparkles = useMemo(() => Array.from({ length: 6 }, (_, i) => ({
    angle: (i / 6) * 360,
    delay: i * 0.1,
  })), []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            background: color,
            boxShadow: `0 0 6px ${color}`,
            animation: `sparkle 1s ease-in-out ${s.delay}s infinite`,
            transform: `rotate(${s.angle}deg) translateY(-28px)`,
          }}
        />
      ))}
    </div>
  );
};

const GemCell: React.FC<GemCellProps> = React.memo(({
  gem,
  isSelected,
  isMatched,
  swapOffset,
  onClick,
  onDragSwap,
}) => {
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const colors = GEM_COLORS[gem.type];

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const threshold = CELL_SIZE / 3;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) {
      onClick({ row: gem.row, col: gem.col });
    } else {
      let toRow = gem.row;
      let toCol = gem.col;

      if (Math.abs(dx) > Math.abs(dy)) {
        toCol += dx > 0 ? 1 : -1;
      } else {
        toRow += dy > 0 ? 1 : -1;
      }

      onDragSwap({ row: gem.row, col: gem.col }, { row: toRow, col: toCol });
    }

    dragStartRef.current = null;
  }, [gem.row, gem.col, onClick, onDragSwap]);

  const fallDelay = gem.col * 25;
  const fallDuration = Math.min(300 + gem.fallDistance * 45, 500);

  let animStyle: React.CSSProperties = {};

  if (gem.isNew || gem.fallDistance > 0) {
    animStyle = {
      animation: `gemFall ${fallDuration}ms cubic-bezier(0.34, 1.56, 0.64, 1) ${fallDelay}ms both`,
      '--fall-distance': `${-gem.fallDistance * CELL_SIZE}px`,
    } as React.CSSProperties;
  }

  if (swapOffset) {
    animStyle = {
      transition: 'transform 220ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: `translate(${swapOffset.x}px, ${swapOffset.y}px)`,
      zIndex: 5,
    };
  }

  if (isMatched) {
    animStyle = {
      animation: 'gemClear 400ms ease-out forwards',
      zIndex: 10,
    };
  }

  const specialGlow = gem.special !== 'none';

  return (
    <div
      className="absolute flex items-center justify-center cursor-pointer select-none touch-none"
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        left: gem.col * CELL_SIZE,
        top: gem.row * CELL_SIZE,
        ...animStyle,
      }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      {/* Halo pour gemmes spéciales */}
      {specialGlow && !isMatched && (
        <div
          className="absolute inset-0 rounded-xl animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.glow}60 0%, transparent 70%)`,
            filter: 'blur(6px)',
          }}
        />
      )}

      {/* Halo sélection */}
      {isSelected && (
        <div
          className="absolute inset-[-4px] rounded-xl animate-pulse-glow"
          style={{
            background: `radial-gradient(circle, ${colors.glow}80 0%, transparent 70%)`,
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}`,
          }}
        />
      )}

      <div
        className={`
          w-[54px] h-[54px] rounded-xl flex items-center justify-center
          transition-transform duration-150 relative
          ${isSelected ? 'scale-110 z-10' : 'hover:scale-105'}
        `}
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.glow}25, ${colors.bg}15 60%, transparent)`,
          boxShadow: isSelected
            ? `inset 0 0 0 2px rgba(255,255,255,0.9), 0 0 20px ${colors.glow}, 0 4px 15px rgba(0,0,0,0.4)`
            : `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)`,
        }}
      >
        <GemShape gemId={gem.id} type={gem.type} special={gem.special} isMatched={isMatched} />

        {/* Sparkles pour gemme sélectionnée */}
        {isSelected && <Sparkles color={colors.glow} />}
      </div>
    </div>
  );
});

GemCell.displayName = 'GemCell';

export default GemCell;
