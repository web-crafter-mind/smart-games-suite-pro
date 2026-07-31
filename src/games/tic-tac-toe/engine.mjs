export const PLAYERS = Object.freeze({ human: 'X', computer: 'O' });

export function createBoard() {
  return Array(9).fill('');
}

export function availableMoves(board) {
  validateBoard(board);
  return board.flatMap((cell, index) => (cell ? [] : [index]));
}

export function applyMove(board, index, player) {
  validateBoard(board);
  if (!['X', 'O'].includes(player)) throw new Error(`Invalid player: ${player}`);
  if (!Number.isInteger(index) || index < 0 || index > 8) throw new Error(`Invalid move index: ${index}`);
  if (board[index]) throw new Error(`Cell ${index} is already occupied`);
  const next = [...board];
  next[index] = player;
  return next;
}

export function winner(board) {
  return winningLine(board)?.winner ?? (board.every(Boolean) ? 'draw' : null);
}

export function winningLine(board) {
  validateBoard(board);
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], cells: [a, b, c] };
  }

  return null;
}

export function validateBoard(board) {
  if (!Array.isArray(board) || board.length !== 9) throw new Error('Board must contain exactly 9 cells');
  if (board.some((cell) => !['', 'X', 'O'].includes(cell))) throw new Error('Board contains an invalid cell value');
}
