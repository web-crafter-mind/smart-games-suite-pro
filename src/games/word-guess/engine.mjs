export function createWordState(word, chances = null) {
  const normalized = normalizeWord(word);
  return {
    word: normalized,
    shown: '_'.repeat(normalized.length),
    correctLetters: [],
    wrongLetters: [],
    remainingChances: chances ?? Math.max(5, normalized.length),
    status: 'playing'
  };
}

export function guessLetter(state, letter) {
  validateState(state);
  const guess = normalizeLetter(letter);
  if (state.status !== 'playing') return { ...state };
  if (state.correctLetters.includes(guess) || state.wrongLetters.includes(guess)) return { ...state };

  const hit = state.word.includes(guess);
  const next = {
    ...state,
    correctLetters: hit ? [...state.correctLetters, guess] : state.correctLetters,
    wrongLetters: hit ? state.wrongLetters : [...state.wrongLetters, guess],
    remainingChances: hit ? state.remainingChances : Math.max(0, state.remainingChances - 1)
  };

  next.shown = [...next.word].map((char) => (next.correctLetters.includes(char) ? char : '_')).join('');
  next.status = next.shown === next.word ? 'won' : next.remainingChances <= 0 ? 'lost' : 'playing';
  return next;
}

export function normalizeWord(word) {
  const normalized = String(word || '').trim().toUpperCase();
  if (!/^[A-Z]{2,24}$/.test(normalized)) throw new Error('Word must contain 2-24 English letters');
  return normalized;
}

function normalizeLetter(letter) {
  const normalized = String(letter || '').trim().toUpperCase();
  if (!/^[A-Z]$/.test(normalized)) throw new Error('Guess must be one English letter');
  return normalized;
}

function validateState(state) {
  if (!state || typeof state !== 'object') throw new Error('Word state is required');
  normalizeWord(state.word);
  if (!Array.isArray(state.correctLetters) || !Array.isArray(state.wrongLetters)) throw new Error('Letter lists must be arrays');
}
