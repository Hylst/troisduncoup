export type GemType = 'ruby' | 'emerald' | 'sapphire' | 'topaz' | 'amethyst' | 'diamond';

export type SpecialType = 'none' | 'striped-h' | 'striped-v' | 'bomb' | 'rainbow';

export interface Gem {
  id: string;
  type: GemType;
  special: SpecialType;
  row: number;
  col: number;
  isMatched: boolean;
  isNew: boolean;
  fallDistance: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface MatchResult {
  positions: Position[];
  specialCreated?: {
    position: Position;
    special: SpecialType;
    type: GemType;
  };
}

export interface ScorePopup {
  id: string;
  score: number;
  x: number;
  y: number;
  combo: number;
  timestamp: number;
}

export const GEM_TYPES: GemType[] = ['ruby', 'emerald', 'sapphire', 'topaz', 'amethyst', 'diamond'];

export const GEM_COLORS: Record<GemType, { bg: string; glow: string; emoji: string }> = {
  ruby: { bg: '#e74c3c', glow: '#ff6b6b', emoji: '💎' },
  emerald: { bg: '#2ecc71', glow: '#55efc4', emoji: '💚' },
  sapphire: { bg: '#3498db', glow: '#74b9ff', emoji: '🔷' },
  topaz: { bg: '#f39c12', glow: '#ffeaa7', emoji: '🔶' },
  amethyst: { bg: '#9b59b6', glow: '#d19dfc', emoji: '🟣' },
  diamond: { bg: '#ecf0f1', glow: '#ffffff', emoji: '⬜' },
};

export const BOARD_SIZE = 8;
export const CELL_SIZE = 60;
