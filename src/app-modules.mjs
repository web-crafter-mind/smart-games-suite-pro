import * as ticTacToeEngine from './games/tic-tac-toe/engine.mjs';
import * as ticTacToeAi from './games/tic-tac-toe/ai.mjs';
import * as wordGuessEngine from './games/word-guess/engine.mjs';
import * as storage from './services/storage.mjs';

window.SGSEngines = Object.freeze({
  ticTacToe: Object.freeze({
    ...ticTacToeEngine,
    bestMove: ticTacToeAi.bestMove
  }),
  wordGuess: Object.freeze(wordGuessEngine),
  storage: Object.freeze(storage)
});
