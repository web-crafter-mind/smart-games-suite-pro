import assert from 'node:assert/strict';
import { availableMoves, applyMove, createBoard, winner } from '../src/games/tic-tac-toe/engine.mjs';
import { bestMove } from '../src/games/tic-tac-toe/ai.mjs';
import { createWordState, guessLetter } from '../src/games/word-guess/engine.mjs';
import { readJson, writeJson } from '../src/services/storage.mjs';

const board = createBoard();
assert.deepEqual(availableMoves(board), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
assert.equal(winner(['X', 'X', 'X', '', '', '', '', '', '']), 'X');
assert.equal(winner(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']), 'draw');
assert.throws(() => applyMove(['X', '', '', '', '', '', '', '', ''], 0, 'O'), /occupied/);
assert.equal(bestMove(['O', 'O', '', 'X', 'X', '', '', '', '']), 2);

let word = createWordState('CODE', 3);
word = guessLetter(word, 'c');
assert.equal(word.shown, 'C___');
word = guessLetter(word, 'z');
assert.equal(word.remainingChances, 2);
word = guessLetter(guessLetter(guessLetter(word, 'o'), 'd'), 'e');
assert.equal(word.status, 'won');

const memory = new Map();
const storage = {
  getItem: (key) => memory.get(key) ?? null,
  setItem: (key, value) => memory.set(key, value)
};
writeJson(storage, 'settings', { music: true });
assert.deepEqual(readJson(storage, 'settings', {}), { music: true });
memory.set('broken', '{');
assert.deepEqual(readJson(storage, 'broken', { safe: true }), { safe: true });

console.log('Engine self-check passed.');
