import { Gem, GemType, SpecialType, Position, MatchResult, GEM_TYPES, BOARD_SIZE } from './types';

let nextId = 0;
export function generateId(): string {
  return `gem-${nextId++}`;
}

export function randomGemType(): GemType {
  return GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
}

export function createGem(row: number, col: number, type?: GemType): Gem {
  return {
    id: generateId(),
    type: type || randomGemType(),
    special: 'none',
    row,
    col,
    isMatched: false,
    isNew: false,
    fallDistance: 0,
  };
}

export function createBoard(): Gem[][] {
  const board: Gem[][] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    board[r] = [];
    for (let c = 0; c < BOARD_SIZE; c++) {
      let gem = createGem(r, c);
      // Avoid initial matches
      while (hasInitialMatch(board, r, c, gem.type)) {
        gem = createGem(r, c);
      }
      board[r][c] = gem;
    }
  }
  return board;
}

function hasInitialMatch(board: Gem[][], row: number, col: number, type: GemType): boolean {
  // Check horizontal
  if (col >= 2 && board[row][col - 1]?.type === type && board[row][col - 2]?.type === type) {
    return true;
  }
  // Check vertical
  if (row >= 2 && board[row - 1]?.[col]?.type === type && board[row - 2]?.[col]?.type === type) {
    return true;
  }
  return false;
}

export function cloneBoard(board: Gem[][]): Gem[][] {
  return board.map(row => row.map(gem => ({ ...gem })));
}

export function isAdjacent(p1: Position, p2: Position): boolean {
  const dr = Math.abs(p1.row - p2.row);
  const dc = Math.abs(p1.col - p2.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function swapGems(board: Gem[][], p1: Position, p2: Position): Gem[][] {
  const newBoard = cloneBoard(board);
  const temp = { ...newBoard[p1.row][p1.col] };
  newBoard[p1.row][p1.col] = { ...newBoard[p2.row][p2.col], row: p1.row, col: p1.col };
  newBoard[p2.row][p2.col] = { ...temp, row: p2.row, col: p2.col };
  return newBoard;
}

export function findMatches(board: Gem[][]): MatchResult[] {
  const results: MatchResult[] = [];
  const matched = new Set<string>();

  // Check horizontal matches
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c <= BOARD_SIZE - 3; c++) {
      const type = board[r][c].type;
      let len = 1;
      while (c + len < BOARD_SIZE && board[r][c + len].type === type) {
        len++;
      }
      if (len >= 3) {
        const positions: Position[] = [];
        for (let i = 0; i < len; i++) {
          positions.push({ row: r, col: c + i });
          matched.add(`${r},${c + i}`);
        }
        const result: MatchResult = { positions };

        // Determine special gem creation
        if (len === 4) {
          const midIdx = Math.floor(len / 2);
          result.specialCreated = {
            position: positions[midIdx],
            special: 'striped-h',
            type,
          };
        } else if (len >= 5) {
          const midIdx = Math.floor(len / 2);
          result.specialCreated = {
            position: positions[midIdx],
            special: 'rainbow',
            type,
          };
        }

        results.push(result);
        c += len - 1;
      }
    }
  }

  // Check vertical matches
  for (let c = 0; c < BOARD_SIZE; c++) {
    for (let r = 0; r <= BOARD_SIZE - 3; r++) {
      const type = board[r][c].type;
      let len = 1;
      while (r + len < BOARD_SIZE && board[r + len][c].type === type) {
        len++;
      }
      if (len >= 3) {
        const positions: Position[] = [];
        for (let i = 0; i < len; i++) {
          positions.push({ row: r + i, col: c });
          matched.add(`${r + i},${c}`);
        }
        const result: MatchResult = { positions };

        if (len === 4) {
          const midIdx = Math.floor(len / 2);
          result.specialCreated = {
            position: positions[midIdx],
            special: 'striped-v',
            type,
          };
        } else if (len >= 5) {
          const midIdx = Math.floor(len / 2);
          result.specialCreated = {
            position: positions[midIdx],
            special: 'rainbow',
            type,
          };
        }

        results.push(result);
        r += len - 1;
      }
    }
  }

  // Check for L/T shaped matches (create bombs)
  // Find positions that appear in both horizontal and vertical matches
  const horizontalPositions = new Map<string, MatchResult>();
  const verticalPositions = new Map<string, MatchResult>();

  for (const result of results) {
    const isHorizontal = result.positions.length > 1 &&
      result.positions[0].row === result.positions[1].row;
    for (const pos of result.positions) {
      const key = `${pos.row},${pos.col}`;
      if (isHorizontal) {
        horizontalPositions.set(key, result);
      } else {
        verticalPositions.set(key, result);
      }
    }
  }

  for (const [key] of horizontalPositions) {
    if (verticalPositions.has(key)) {
      const [r, c] = key.split(',').map(Number);
      // Create a bomb at the intersection
      const hResult = horizontalPositions.get(key)!;
      const vResult = verticalPositions.get(key)!;
      // Remove old special creations for these matches
      delete hResult.specialCreated;
      delete vResult.specialCreated;
      // Add bomb special to the first match
      hResult.specialCreated = {
        position: { row: r, col: c },
        special: 'bomb',
        type: board[r][c].type,
      };
    }
  }

  return results;
}

export function applySpecialGemEffect(
  board: Gem[][],
  gem: Gem,
  cascadePositions: Position[]
): Position[] {
  const additional: Position[] = [];

  if (gem.special === 'striped-h') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      additional.push({ row: gem.row, col: c });
    }
  } else if (gem.special === 'striped-v') {
    for (let r = 0; r < BOARD_SIZE; r++) {
      additional.push({ row: r, col: gem.col });
    }
  } else if (gem.special === 'bomb') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = gem.row + dr;
        const nc = gem.col + dc;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
          additional.push({ row: nr, col: nc });
        }
      }
    }
  } else if (gem.special === 'rainbow') {
    // Clear all gems of a random type
    const targetType = cascadePositions.length > 0
      ? board[cascadePositions[0].row]?.[cascadePositions[0].col]?.type
      : randomGemType();
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c].type === targetType) {
          additional.push({ row: r, col: c });
        }
      }
    }
  }

  return additional;
}

export function markMatches(board: Gem[][], matches: MatchResult[]): {
  board: Gem[][];
  clearedCount: number;
  specialsCreated: { position: Position; special: SpecialType; type: GemType }[];
} {
  const newBoard = cloneBoard(board);
  const allPositions = new Set<string>();
  const specialsCreated: { position: Position; special: SpecialType; type: GemType }[] = [];

  // Collect all matched positions
  for (const match of matches) {
    if (match.specialCreated) {
      specialsCreated.push(match.specialCreated);
    }
    for (const pos of match.positions) {
      allPositions.add(`${pos.row},${pos.col}`);
    }
  }

  // Check for special gem activations and add their affected positions
  for (const posKey of allPositions) {
    const [r, c] = posKey.split(',').map(Number);
    const gem = newBoard[r][c];
    if (gem.special !== 'none') {
      const extraPositions = applySpecialGemEffect(
        newBoard,
        gem,
        Array.from(allPositions).map(k => {
          const [pr, pc] = k.split(',').map(Number);
          return { row: pr, col: pc };
        })
      );
      for (const ep of extraPositions) {
        allPositions.add(`${ep.row},${ep.col}`);
      }
    }
  }

  let clearedCount = 0;

  // Don't clear positions where specials will be created
  const specialPositions = new Set(specialsCreated.map(s => `${s.position.row},${s.position.col}`));

  for (const posKey of allPositions) {
    if (!specialPositions.has(posKey)) {
      const [r, c] = posKey.split(',').map(Number);
      newBoard[r][c].isMatched = true;
      clearedCount++;
    }
  }

  // Create special gems
  for (const special of specialsCreated) {
    const { position, special: specialType, type } = special;
    newBoard[position.row][position.col].special = specialType;
    newBoard[position.row][position.col].type = type;
    newBoard[position.row][position.col].isMatched = false;
  }

  return { board: newBoard, clearedCount, specialsCreated };
}

export function applyGravity(board: Gem[][]): Gem[][] {
  const newBoard = cloneBoard(board);

  for (let c = 0; c < BOARD_SIZE; c++) {
    // Collect non-matched gems from bottom to top
    const remaining: Gem[] = [];
    for (let r = BOARD_SIZE - 1; r >= 0; r--) {
      if (!newBoard[r][c].isMatched) {
        remaining.push(newBoard[r][c]);
      }
    }

    // Fill column from bottom
    let fillRow = BOARD_SIZE - 1;
    for (let i = 0; i < remaining.length; i++) {
      const gem = remaining[i];
      const oldRow = gem.row;
      gem.row = fillRow;
      gem.col = c;
      gem.fallDistance = fillRow - oldRow;
      newBoard[fillRow][c] = gem;
      fillRow--;
    }

    // Fill remaining positions with new gems
    const emptyCount = fillRow + 1;
    for (let r = fillRow; r >= 0; r--) {
      const newGem = createGem(r, c);
      newGem.isNew = true;
      newGem.fallDistance = emptyCount;
      newBoard[r][c] = newGem;
    }
  }

  return newBoard;
}

export function hasValidMoves(board: Gem[][]): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      // Try swapping right
      if (c < BOARD_SIZE - 1) {
        const swapped = swapGems(board, { row: r, col: c }, { row: r, col: c + 1 });
        if (findMatches(swapped).length > 0) return true;
      }
      // Try swapping down
      if (r < BOARD_SIZE - 1) {
        const swapped = swapGems(board, { row: r, col: c }, { row: r + 1, col: c });
        if (findMatches(swapped).length > 0) return true;
      }
    }
  }
  return false;
}

export function calculateScore(clearedCount: number, combo: number): number {
  const baseScore = clearedCount * 10;
  const comboMultiplier = 1 + (combo - 1) * 0.5;
  return Math.floor(baseScore * comboMultiplier);
}
