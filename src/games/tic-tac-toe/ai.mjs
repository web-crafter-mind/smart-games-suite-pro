import { availableMoves, applyMove, winner } from './engine.mjs';

export function bestMove(board, aiPlayer = 'O', humanPlayer = 'X') {
  const moves = availableMoves(board);
  if (!moves.length) return -1;

  let bestScore = -Infinity;
  let move = moves[0];

  for (const index of moves) {
    const next = applyMove(board, index, aiPlayer);
    const score = minimax(next, false, aiPlayer, humanPlayer, 0, -Infinity, Infinity);
    if (score > bestScore) {
      bestScore = score;
      move = index;
    }
  }

  return move;
}

function minimax(board, maximizing, aiPlayer, humanPlayer, depth, alpha, beta) {
  const result = winner(board);
  if (result === aiPlayer) return 10 - depth;
  if (result === humanPlayer) return depth - 10;
  if (result === 'draw') return 0;

  if (maximizing) {
    let best = -Infinity;
    for (const move of availableMoves(board)) {
      best = Math.max(best, minimax(applyMove(board, move, aiPlayer), false, aiPlayer, humanPlayer, depth + 1, alpha, beta));
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }

  let best = Infinity;
  for (const move of availableMoves(board)) {
    best = Math.min(best, minimax(applyMove(board, move, humanPlayer), true, aiPlayer, humanPlayer, depth + 1, alpha, beta));
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}
