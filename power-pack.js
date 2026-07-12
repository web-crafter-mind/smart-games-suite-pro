(() => {
  'use strict';

  const STORE_KEY = 'sgsPowerProgressV1';
  const DAILY_WORDS = [
    'QUANTUM', 'CIPHER', 'GALAXY', 'PYRAMID', 'ORBITAL', 'NEBULA',
    'VICTORY', 'TACTICS', 'PHOENIX', 'MATRIX', 'ECLIPSE', 'FUSION'
  ];

  const achievements = [
    { id: 'first_win', title: 'First Victory', detail: 'Win any game.', test: (p) => p.wins >= 1 },
    { id: 'grid_master', title: 'Grid Master', detail: 'Win Tic-Tac-Toe.', test: (p) => p.tttWins >= 1 },
    { id: 'word_wizard', title: 'Word Wizard', detail: 'Win Word Guess.', test: (p) => p.wordWins >= 1 },
    { id: 'hard_mode', title: 'Hard Mode Hero', detail: 'Win on hard difficulty.', test: (p) => p.hardWins >= 1 },
    { id: 'streak_three', title: 'Hot Streak', detail: 'Win 3 games in a row.', test: (p) => p.bestStreak >= 3 },
    { id: 'tournament', title: 'Tournament Tactician', detail: 'Win a tournament round.', test: (p) => p.tournamentWins >= 1 },
    { id: 'perfect_word', title: 'Perfect Mind', detail: 'Win a word game with no wrong guesses.', test: (p) => p.perfectWordWins >= 1 },
    { id: 'marathon', title: 'Marathon Player', detail: 'Finish 10 games.', test: (p) => p.gamesPlayed >= 10 },
    { id: 'score_1000', title: 'Score Hunter', detail: 'Earn 1,000 total points.', test: (p) => p.totalScore >= 1000 },
    { id: 'daily', title: 'Daily Challenger', detail: 'Play a daily challenge.', test: (p) => p.dailyPlayed >= 1 }
  ];

  const defaultProgress = {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    tttWins: 0,
    wordWins: 0,
    hardWins: 0,
    tournamentWins: 0,
    perfectWordWins: 0,
    dailyPlayed: 0,
    dailyWins: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalScore: 0,
    xp: 0,
    unlocked: {},
    lastDailyDate: ''
  };

  const state = {
    overlayOpen: false,
    dailyWord: '',
    dailyActive: false
  };

  function safeJson(key, fallback) {
    try {
      return { ...fallback, ...(JSON.parse(localStorage.getItem(key) || '{}') || {}) };
    } catch (error) {
      return { ...fallback };
    }
  }

  let progress = safeJson(STORE_KEY, defaultProgress);

  function saveProgress() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(progress));
    } catch (error) {
      // Storage can be disabled in some locked-down WebViews.
    }
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function dailyWord() {
    const key = todayKey().replace(/-/g, '');
    const seed = Number(key) || 1;
    return DAILY_WORDS[seed % DAILY_WORDS.length];
  }

  function playerName() {
    return (GameState?.player1Name || '').trim() || 'Player 1';
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .power-fab {
        position: fixed;
        right: max(14px, env(safe-area-inset-right));
        bottom: max(86px, calc(env(safe-area-inset-bottom) + 86px));
        z-index: 650;
        min-height: 48px;
        padding: 10px 14px;
        border: 2px solid #ffaa00;
        border-radius: 8px;
        background: rgba(8, 10, 18, 0.94);
        color: #ffaa00;
        font: 700 0.86rem system-ui, sans-serif;
        letter-spacing: 0;
        box-shadow: 0 0 18px rgba(255, 170, 0, 0.28);
        cursor: pointer;
        touch-action: manipulation;
      }

      .power-overlay {
        position: fixed;
        inset: 0;
        z-index: 700;
        display: none;
        align-items: center;
        justify-content: center;
        padding: max(18px, env(safe-area-inset-top)) 14px max(18px, env(safe-area-inset-bottom));
        background: rgba(0, 0, 0, 0.82);
      }

      .power-overlay.open { display: flex; }

      .power-panel {
        width: min(920px, 96vw);
        max-height: min(780px, 90dvh);
        overflow: auto;
        border: 2px solid #00ffaa;
        border-radius: 8px;
        background: linear-gradient(160deg, rgba(7, 12, 24, 0.98), rgba(5, 8, 22, 0.98));
        box-shadow: 0 0 28px rgba(0, 255, 170, 0.2);
        color: #eafff8;
      }

      .power-head,
      .power-actions,
      .power-grid,
      .power-achievements,
      .power-store {
        padding: 18px;
      }

      .power-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        border-bottom: 1px solid rgba(0, 255, 170, 0.25);
      }

      .power-title {
        margin: 0;
        color: #ffaa00;
        font: 800 1.2rem system-ui, sans-serif;
        letter-spacing: 0;
      }

      .power-close,
      .power-action {
        min-height: 42px;
        border: 1px solid #00ffaa;
        border-radius: 6px;
        background: rgba(0, 255, 170, 0.1);
        color: #00ffaa;
        font: 700 0.86rem system-ui, sans-serif;
        cursor: pointer;
      }

      .power-close {
        width: 42px;
        font-size: 1.2rem;
      }

      .power-actions {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        border-bottom: 1px solid rgba(0, 255, 170, 0.15);
      }

      .power-action {
        padding: 10px 12px;
      }

      .power-action.gold {
        border-color: #ffaa00;
        background: rgba(255, 170, 0, 0.12);
        color: #ffaa00;
      }

      .power-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .power-stat,
      .power-achievement,
      .power-store-card {
        border: 1px solid rgba(0, 255, 170, 0.24);
        border-radius: 8px;
        background: rgba(0, 0, 0, 0.28);
        padding: 12px;
      }

      .power-stat span,
      .power-store-card span {
        display: block;
        color: #8daea6;
        font-size: 0.74rem;
      }

      .power-stat strong,
      .power-store-card strong {
        display: block;
        margin-top: 4px;
        color: #ffffff;
        font-size: 1.15rem;
      }

      .power-achievements {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }

      .power-achievement.locked {
        opacity: 0.48;
      }

      .power-achievement strong {
        display: block;
        color: #ffaa00;
        margin-bottom: 4px;
      }

      .power-achievement p {
        margin: 0;
        color: #b9d6d0;
        font-size: 0.82rem;
        line-height: 1.4;
      }

      .power-store {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        border-top: 1px solid rgba(0, 255, 170, 0.15);
      }

      .power-toast {
        position: fixed;
        left: 50%;
        bottom: max(18px, env(safe-area-inset-bottom));
        z-index: 760;
        transform: translateX(-50%);
        max-width: min(92vw, 480px);
        padding: 12px 14px;
        border: 1px solid #ffaa00;
        border-radius: 8px;
        background: rgba(5, 8, 22, 0.96);
        color: #ffaa00;
        box-shadow: 0 0 18px rgba(255, 170, 0, 0.24);
        font: 700 0.9rem system-ui, sans-serif;
      }

      @media (max-width: 760px) {
        .power-actions,
        .power-grid,
        .power-achievements,
        .power-store {
          grid-template-columns: 1fr;
        }

        .power-fab {
          right: 10px;
          bottom: max(74px, calc(env(safe-area-inset-bottom) + 74px));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureDom() {
    if (document.getElementById('powerFab')) return;

    const fab = document.createElement('button');
    fab.id = 'powerFab';
    fab.className = 'power-fab';
    fab.type = 'button';
    fab.textContent = 'Power Hub';
    fab.addEventListener('click', openHub);

    const overlay = document.createElement('div');
    overlay.id = 'powerOverlay';
    overlay.className = 'power-overlay';
    overlay.innerHTML = `
      <section class="power-panel" role="dialog" aria-modal="true" aria-labelledby="powerTitle">
        <header class="power-head">
          <h2 class="power-title" id="powerTitle">Power Hub</h2>
          <button class="power-close" id="powerClose" type="button" aria-label="Close">Ã—</button>
        </header>
        <div class="power-actions">
          <button class="power-action gold" id="dailyChallengeBtn" type="button">Daily Hard Word</button>
          <button class="power-action" id="expertTttBtn" type="button">Expert Tic-Tac-Toe</button>
          <button class="power-action" id="resetPowerBtn" type="button">Reset Progress</button>
        </div>
        <div class="power-grid" id="powerStats"></div>
        <div class="power-achievements" id="powerAchievements"></div>
        <div class="power-store" id="powerStore"></div>
      </section>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(overlay);

    document.getElementById('powerClose').addEventListener('click', closeHub);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) closeHub();
    });
    document.getElementById('dailyChallengeBtn').addEventListener('click', startDailyChallenge);
    document.getElementById('expertTttBtn').addEventListener('click', startExpertTtt);
    document.getElementById('resetPowerBtn').addEventListener('click', resetProgress);
  }

  function level() {
    return Math.max(1, Math.floor(progress.xp / 250) + 1);
  }

  function renderHub() {
    const winRate = progress.gamesPlayed ? Math.round((progress.wins / progress.gamesPlayed) * 100) : 0;
    const stats = [
      ['Level', level()],
      ['XP', progress.xp],
      ['Games', progress.gamesPlayed],
      ['Win Rate', `${winRate}%`],
      ['Best Streak', progress.bestStreak],
      ['Total Score', progress.totalScore],
      ['Daily Wins', progress.dailyWins],
      ['Achievements', `${Object.keys(progress.unlocked || {}).length}/${achievements.length}`]
    ];

    document.getElementById('powerStats').innerHTML = stats
      .map(([label, value]) => `<div class="power-stat"><span>${label}</span><strong>${value}</strong></div>`)
      .join('');

    document.getElementById('powerAchievements').innerHTML = achievements
      .map((achievement) => {
        const unlocked = Boolean(progress.unlocked?.[achievement.id]);
        return `<div class="power-achievement ${unlocked ? '' : 'locked'}"><strong>${unlocked ? 'Unlocked' : 'Locked'} - ${achievement.title}</strong><p>${achievement.detail}</p></div>`;
      })
      .join('');

    const storeCards = [
      ['Today', `${dailyWord()} - Hard Word`],
      ['Play Store', navigator.serviceWorker ? 'Offline cache ready' : 'Service worker unavailable'],
      ['Install Mode', window.matchMedia('(display-mode: fullscreen)').matches || window.matchMedia('(display-mode: standalone)').matches ? 'Installed app' : 'Browser/PWA preview']
    ];

    document.getElementById('powerStore').innerHTML = storeCards
      .map(([label, value]) => `<div class="power-store-card"><span>${label}</span><strong>${value}</strong></div>`)
      .join('');
  }

  function openHub() {
    state.overlayOpen = true;
    renderHub();
    document.getElementById('powerOverlay').classList.add('open');
  }

  function closeHub() {
    state.overlayOpen = false;
    document.getElementById('powerOverlay').classList.remove('open');
  }

  function toast(message) {
    const el = document.createElement('div');
    el.className = 'power-toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function checkAchievements() {
    progress.unlocked = progress.unlocked || {};
    const newlyUnlocked = achievements.filter((achievement) => !progress.unlocked[achievement.id] && achievement.test(progress));
    newlyUnlocked.forEach((achievement) => {
      progress.unlocked[achievement.id] = true;
      progress.xp += 75;
      toast(`Achievement unlocked: ${achievement.title}`);
    });
    if (newlyUnlocked.length) saveProgress();
  }

  function recordGame(result) {
    progress.gamesPlayed += 1;
    progress.totalScore += Math.max(0, Number(result.score) || 0);
    progress.xp += 35 + Math.min(120, Math.max(0, Number(result.score) || 0));

    if (result.draw) {
      progress.draws += 1;
      progress.currentStreak = 0;
    } else if (result.win) {
      progress.wins += 1;
      progress.currentStreak += 1;
      progress.bestStreak = Math.max(progress.bestStreak, progress.currentStreak);
      if (result.game === 'ttt') progress.tttWins += 1;
      if (result.game === 'word') progress.wordWins += 1;
      if (result.difficulty === 'hard') progress.hardWins += 1;
      if (result.tournament) progress.tournamentWins += 1;
      if (result.perfectWord) progress.perfectWordWins += 1;
      if (state.dailyActive) progress.dailyWins += 1;
    } else {
      progress.losses += 1;
      progress.currentStreak = 0;
    }

    if (state.dailyActive) {
      progress.dailyPlayed += 1;
      progress.lastDailyDate = todayKey();
      state.dailyActive = false;
    }

    saveProgress();
    checkAchievements();
    renderHub();
  }

  function wrapVictories() {
    if (typeof showVictory !== 'function' || showVictory.__powerWrapped) return;

    const originalShowVictory = showVictory;
    showVictory = function powerShowVictory(winner, score, isDraw = false, revealedWord = null, isComputerGuessMode = false) {
      const game = GameState?.selectedGame || 'unknown';
      const difficulty = GameState?.difficulty || 'general';
      const player = GameState?.player1Name || 'Player 1';
      const win = !isDraw && (winner === player || (game === 'word' && Number(score) > 0 && winner !== 'Computer'));
      const perfectWord = game === 'word' && win && Array.isArray(WordGame?.wrongLetters) && WordGame.wrongLetters.length === 0;

      recordGame({
        game,
        difficulty,
        score: Number(score) || 0,
        draw: Boolean(isDraw),
        win,
        tournament: Boolean(GameState?.tournamentActive),
        perfectWord,
        isComputerGuessMode
      });

      return originalShowVictory.apply(this, arguments);
    };
    showVictory.__powerWrapped = true;
  }

  function localWinner(board) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return board.every(Boolean) ? 'draw' : null;
  }

  function minimax(board, player, depth, alpha, beta) {
    const winner = localWinner(board);
    if (winner === 'O') return 10 - depth;
    if (winner === 'X') return depth - 10;
    if (winner === 'draw') return 0;

    const maximizing = player === 'O';
    let best = maximizing ? -Infinity : Infinity;
    for (let i = 0; i < board.length; i += 1) {
      if (board[i]) continue;
      board[i] = player;
      const score = minimax(board, player === 'O' ? 'X' : 'O', depth + 1, alpha, beta);
      board[i] = '';
      if (maximizing) {
        best = Math.max(best, score);
        alpha = Math.max(alpha, best);
      } else {
        best = Math.min(best, score);
        beta = Math.min(beta, best);
      }
      if (beta <= alpha) break;
    }
    return best;
  }

  function strengthenTttAi() {
    if (typeof findBestMove !== 'function' || findBestMove.__powerWrapped) return;
    const originalFindBestMove = findBestMove;
    findBestMove = function powerFindBestMove() {
      if (GameState?.difficulty !== 'hard') return originalFindBestMove.apply(this, arguments);

      const board = [...TTTGame.board];
      let bestScore = -Infinity;
      let bestMove = board.findIndex((cell) => cell === '');

      for (let i = 0; i < board.length; i += 1) {
        if (board[i]) continue;
        board[i] = 'O';
        const score = minimax(board, 'X', 0, -Infinity, Infinity);
        board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }

      return bestMove;
    };
    findBestMove.__powerWrapped = true;
  }

  function wrapDailyWord() {
    if (typeof initWordGame !== 'function' || initWordGame.__powerWrapped) return;
    const originalInitWordGame = initWordGame;
    initWordGame = function powerInitWordGame() {
      originalInitWordGame.apply(this, arguments);

      if (!state.dailyWord) return;

      const word = state.dailyWord.toUpperCase();
      state.dailyWord = '';
      WordGame.word = word;
      WordGame.shown = '_'.repeat(word.length);
      WordGame.wrongLetters = [];
      WordGame.correctLetters = [];
      WordGame.totalChances = Math.max(5, word.length);
      WordGame.remainingChances = WordGame.totalChances;
      WordGame.hintsMax = 1;
      WordGame.hintsUsed = 0;
      WordGame.score = 0;
      WordGame.gameActive = true;

      const categoryBadge = document.getElementById('categoryBadge');
      if (categoryBadge) categoryBadge.textContent = 'Daily Challenge';
      if (typeof renderWordDisplay === 'function') renderWordDisplay();
      if (typeof updateWordStats === 'function') updateWordStats();
      if (typeof renderLetterKeyboard === 'function') renderLetterKeyboard();
      toast('Daily challenge loaded.');
    };
    initWordGame.__powerWrapped = true;
  }

  function startDailyChallenge() {
    state.dailyWord = dailyWord();
    state.dailyActive = true;
    closeHub();

    GameState.selectedGame = 'word';
    GameState.selectedMode = 'general';
    GameState.playerMode = 'ai';
    GameState.difficulty = 'hard';
    GameState.category = 'random';
    GameState.guesserMode = 'human';
    GameState.player1Name = playerName();
    GameState.player2Name = 'Computer';

    startGame();
  }

  function startExpertTtt() {
    closeHub();
    GameState.selectedGame = 'ttt';
    GameState.selectedMode = 'timer';
    GameState.selectedTime = 60;
    GameState.playerMode = 'ai';
    GameState.difficulty = 'hard';
    GameState.style = 'neon';
    GameState.player1Name = playerName();
    GameState.player2Name = 'Computer';
    startGame();
  }

  function resetProgress() {
    if (!confirm('Reset Power Hub progress?')) return;
    progress = { ...defaultProgress };
    saveProgress();
    renderHub();
    toast('Power progress reset.');
  }

  function boot() {
    if (!GameState || !WordGame || !TTTGame) {
      setTimeout(boot, 80);
      return;
    }

    injectStyles();
    ensureDom();
    wrapVictories();
    strengthenTttAi();
    wrapDailyWord();
    checkAchievements();
    renderHub();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

